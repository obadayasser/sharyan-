import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDonorDto } from './dto/register-donor.dto.js';
import { UpdateDonorDto } from './dto/update-donor.dto.js';
import { DonorSearchQueryDto } from './dto/donor-search-query.dto.js';
import { paginate } from '../common/utils/pagination.util.js';

@Injectable()
export class DonorService {
  constructor(private readonly prisma: PrismaService) {}

  async registerOrGet(deviceId: string, dto: RegisterDonorDto) {
    const existing = await this.prisma.donor.findUnique({ where: { deviceId } });
    if (existing) return existing;

    return this.prisma.donor.create({
      data: {
        deviceId,
        name: dto.name,
        mobile: dto.mobile,
        bloodType: dto.bloodType,
        gender: dto.gender,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        latitude: dto.latitude,
        longitude: dto.longitude,
        lastDonationDate: dto.lastDonationDate
          ? new Date(dto.lastDonationDate)
          : undefined,
        fcmToken: dto.fcmToken,
      },
    });
  }

  async getProfile(deviceId: string) {
    const donor = await this.prisma.donor.findUnique({
      where: { deviceId },
      include: {
        badges: true,
        _count: { select: { donations: true, donationOffers: true } },
      },
    });
    if (!donor) throw new NotFoundException('Donor not found');
    return donor;
  }

  async updateProfile(deviceId: string, dto: UpdateDonorDto) {
    const data: any = { ...dto };
    if (dto.dateOfBirth) data.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.lastDonationDate) data.lastDonationDate = new Date(dto.lastDonationDate);

    return this.prisma.donor.update({
      where: { deviceId },
      data,
    });
  }

  async search(query: DonorSearchQueryDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 20);
    const where: any = { isActive: true };

    if (query.bloodType) {
      where.bloodType = query.bloodType;
    }

    if (query.availableOnly) {
      where.isAvailable = true;
    }

    const [donors, total] = await Promise.all([
      this.prisma.donor.findMany({
        where,
        skip,
        take: query.limit || 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.donor.count({ where }),
    ]);

    let results = donors;

    // If lat/lng provided, calculate distances and sort
    if (query.latitude && query.longitude) {
      results = donors
        .map((donor) => ({
          ...donor,
          distanceKm: this.calculateDistance(
            query.latitude!,
            query.longitude!,
            donor.latitude,
            donor.longitude,
          ),
        }))
        .filter((d) => !query.radiusKm || d.distanceKm <= query.radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return paginate(results, total, query.page || 1, query.limit || 20);
  }

  async getDonorDonations(donorId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [donations, total] = await Promise.all([
      this.prisma.donation.findMany({
        where: { donorId },
        skip,
        take: limit,
        orderBy: { donatedAt: 'desc' },
      }),
      this.prisma.donation.count({ where: { donorId } }),
    ]);
    return paginate(donations, total, page, limit);
  }

  async getDonorOffers(donorId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [offers, total] = await Promise.all([
      this.prisma.donationOffer.findMany({
        where: { donorId },
        skip,
        take: limit,
        include: { bloodRequest: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.donationOffer.count({ where: { donorId } }),
    ]);
    return paginate(offers, total, page, limit);
  }

  async getDonorBadges(donorId: string) {
    return this.prisma.donorBadge.findMany({
      where: { donorId },
      orderBy: { earnedAt: 'desc' },
    });
  }

  async getDonorPoints(donorId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const donor = await this.prisma.donor.findUnique({
      where: { id: donorId },
      select: { points: true },
    });
    const [transactions, total] = await Promise.all([
      this.prisma.pointTransaction.findMany({
        where: { donorId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pointTransaction.count({ where: { donorId } }),
    ]);
    return {
      totalPoints: donor?.points || 0,
      transactions: paginate(transactions, total, page, limit),
    };
  }

  async updateFcmToken(deviceId: string, fcmToken: string) {
    return this.prisma.donor.update({
      where: { deviceId },
      data: { fcmToken },
    });
  }

  async toggleAvailability(deviceId: string) {
    const donor = await this.prisma.donor.findUnique({ where: { deviceId } });
    if (!donor) throw new NotFoundException('Donor not found');
    return this.prisma.donor.update({
      where: { deviceId },
      data: { isAvailable: !donor.isAvailable },
    });
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
