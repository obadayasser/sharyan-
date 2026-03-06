import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service.js';
import { BloodCompatibilityService } from '../blood-compatibility/blood-compatibility.service.js';
import { GeoService } from '../geo/geo.service.js';
import { CreateBloodRequestDto } from './dto/create-blood-request.dto.js';
import { UpdateBloodRequestDto } from './dto/update-blood-request.dto.js';
import { BloodRequestQueryDto } from './dto/blood-request-query.dto.js';
import { paginate } from '../common/utils/pagination.util.js';

@Injectable()
export class BloodRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bloodCompatibility: BloodCompatibilityService,
    private readonly geoService: GeoService,
  ) {}

  async create(patientId: string, dto: CreateBloodRequestDto) {
    const request = await this.prisma.bloodRequest.create({
      data: {
        patientId,
        bloodType: dto.bloodType,
        bagsNeeded: dto.bagsNeeded,
        urgency: dto.urgency || 'NORMAL',
        patientName: dto.patientName,
        hospitalName: dto.hospitalName,
        bloodBankId: dto.bloodBankId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        contactPhone: dto.contactPhone,
        notes: dto.notes,
        shareToken: uuidv4(),
      },
      include: { patient: true },
    });

    return request;
  }

  async findAll(query: BloodRequestQueryDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 20);
    const where: any = { status: query.status || 'OPEN' };

    if (query.bloodType) where.bloodType = query.bloodType;
    if (query.urgency) where.urgency = query.urgency;

    const [requests, total] = await Promise.all([
      this.prisma.bloodRequest.findMany({
        where,
        skip,
        take: query.limit || 20,
        include: {
          patient: { select: { name: true, mobile: true } },
          _count: { select: { donationOffers: true } },
        },
        orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.bloodRequest.count({ where }),
    ]);

    let results: any[] = requests;

    if (query.latitude && query.longitude) {
      results = requests
        .map((req) => ({
          ...req,
          distanceKm: this.geoService.calculateDistance(
            query.latitude!, query.longitude!,
            req.latitude, req.longitude,
          ),
        }))
        .filter((r) => !query.radiusKm || r.distanceKm <= query.radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return paginate(results, total, query.page || 1, query.limit || 20);
  }

  async findOne(id: string) {
    const request = await this.prisma.bloodRequest.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, name: true, mobile: true } },
        bloodBank: { select: { id: true, name: true, phone: true } },
        donationOffers: {
          include: { donor: { select: { id: true, name: true, bloodType: true, mobile: true } } },
        },
      },
    });
    if (!request) throw new NotFoundException('Blood request not found');
    return request;
  }

  async update(id: string, patientId: string, dto: UpdateBloodRequestDto) {
    const request = await this.prisma.bloodRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Blood request not found');
    if (request.patientId !== patientId) throw new ForbiddenException('Not your request');

    return this.prisma.bloodRequest.update({
      where: { id },
      data: dto,
    });
  }

  async cancel(id: string, patientId: string) {
    const request = await this.prisma.bloodRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Blood request not found');
    if (request.patientId !== patientId) throw new ForbiddenException('Not your request');

    return this.prisma.bloodRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async findByShareToken(shareToken: string) {
    const request = await this.prisma.bloodRequest.findUnique({
      where: { shareToken },
      include: {
        patient: { select: { name: true, mobile: true } },
        bloodBank: { select: { name: true, phone: true, address: true } },
      },
    });
    if (!request) throw new NotFoundException('Request not found');
    return request;
  }

  async findNearbyDonorsForRequest(id: string) {
    const request = await this.prisma.bloodRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Blood request not found');

    const compatibleTypes = this.bloodCompatibility.getCompatibleDonorTypes(request.bloodType);
    const radiusKm = request.urgency === 'EMERGENCY' ? 10 : 5;

    let donors = await this.geoService.findNearbyDonors(
      request.latitude,
      request.longitude,
      radiusKm,
      compatibleTypes,
      50,
    );

    if (donors.length < 5 && request.urgency === 'EMERGENCY') {
      donors = await this.geoService.findNearbyDonors(
        request.latitude,
        request.longitude,
        25,
        compatibleTypes,
        50,
      );
    }

    return { request, donors, compatibleTypes };
  }
}
