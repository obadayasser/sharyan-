import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAdminDto } from './dto/create-admin.dto.js';
import { UpdateAdminDto } from './dto/update-admin.dto.js';
import { paginate } from '../common/utils/pagination.util.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAdminDto) {
    const exists = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const admin = await this.prisma.admin.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        isSuperAdmin: dto.isSuperAdmin || false,
      },
    });

    const { passwordHash: _, refreshToken: __, ...result } = admin;
    return result;
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [admins, total] = await Promise.all([
      this.prisma.admin.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isSuperAdmin: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.admin.count(),
    ]);
    return paginate(admins, total, page, limit);
  }

  async update(id: string, dto: UpdateAdminDto) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException('Admin not found');

    const data: any = { ...dto };
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
      delete data.password;
    }

    const updated = await this.prisma.admin.update({
      where: { id },
      data,
    });

    const { passwordHash: _, refreshToken: __, ...result } = updated;
    return result;
  }

  async remove(id: string) {
    await this.prisma.admin.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Admin deactivated' };
  }

  async getDashboardStats() {
    const [
      totalDonors,
      activeDonors,
      totalPatients,
      totalBloodBanks,
      pendingBloodBanks,
      openRequests,
      emergencyRequests,
      totalDonations,
      activeCampaigns,
    ] = await Promise.all([
      this.prisma.donor.count(),
      this.prisma.donor.count({ where: { isAvailable: true, isActive: true } }),
      this.prisma.patient.count(),
      this.prisma.bloodBank.count({ where: { status: 'APPROVED' } }),
      this.prisma.bloodBank.count({ where: { status: 'PENDING' } }),
      this.prisma.bloodRequest.count({ where: { status: 'OPEN' } }),
      this.prisma.bloodRequest.count({ where: { urgency: 'EMERGENCY', status: 'OPEN' } }),
      this.prisma.donation.count(),
      this.prisma.campaign.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      totalDonors,
      activeDonors,
      totalPatients,
      totalBloodBanks,
      pendingBloodBanks,
      openRequests,
      emergencyRequests,
      totalDonations,
      activeCampaigns,
    };
  }

  async getAllDonors(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [donors, total] = await Promise.all([
      this.prisma.donor.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.donor.count(),
    ]);
    return paginate(donors, total, page, limit);
  }

  async getAllPatients(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.patient.count(),
    ]);
    return paginate(patients, total, page, limit);
  }

  async getAllBloodRequests(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [requests, total] = await Promise.all([
      this.prisma.bloodRequest.findMany({
        skip,
        take: limit,
        include: { patient: true, donationOffers: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.bloodRequest.count(),
    ]);
    return paginate(requests, total, page, limit);
  }

  async toggleDonorActive(id: string) {
    const donor = await this.prisma.donor.findUnique({ where: { id } });
    if (!donor) throw new NotFoundException('Donor not found');
    return this.prisma.donor.update({
      where: { id },
      data: { isActive: !donor.isActive },
    });
  }

  async togglePatientActive(id: string) {
    const patient = await this.prisma.patient.findUnique({ where: { id } });
    if (!patient) throw new NotFoundException('Patient not found');
    return this.prisma.patient.update({
      where: { id },
      data: { isActive: !patient.isActive },
    });
  }
}
