import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RecordDonationDto } from './dto/record-donation.dto.js';
import { paginate } from '../common/utils/pagination.util.js';

@Injectable()
export class DonationService {
  constructor(private readonly prisma: PrismaService) {}

  async record(dto: RecordDonationDto, adminId: string) {
    const donor = await this.prisma.donor.findUnique({ where: { id: dto.donorId } });
    if (!donor) throw new NotFoundException('Donor not found');

    const pointsAwarded = 100;

    const [donation] = await this.prisma.$transaction([
      this.prisma.donation.create({
        data: {
          donorId: dto.donorId,
          bloodType: dto.bloodType,
          bagsCount: dto.bagsCount || 1,
          hospitalName: dto.hospitalName,
          notes: dto.notes,
          pointsAwarded,
          donatedAt: dto.donatedAt ? new Date(dto.donatedAt) : new Date(),
          verifiedByAdminId: adminId,
        },
      }),
      this.prisma.donor.update({
        where: { id: dto.donorId },
        data: {
          totalDonations: { increment: 1 },
          points: { increment: pointsAwarded },
          lastDonationDate: dto.donatedAt ? new Date(dto.donatedAt) : new Date(),
        },
      }),
      this.prisma.pointTransaction.create({
        data: {
          donorId: dto.donorId,
          points: pointsAwarded,
          reason: 'Manual donation record by admin',
        },
      }),
    ]);

    return donation;
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [donations, total] = await Promise.all([
      this.prisma.donation.findMany({
        skip,
        take: limit,
        include: {
          donor: { select: { id: true, name: true, bloodType: true } },
        },
        orderBy: { donatedAt: 'desc' },
      }),
      this.prisma.donation.count(),
    ]);
    return paginate(donations, total, page, limit);
  }

  async findOne(id: string) {
    const donation = await this.prisma.donation.findUnique({
      where: { id },
      include: {
        donor: true,
        donationOffer: { include: { bloodRequest: true } },
      },
    });
    if (!donation) throw new NotFoundException('Donation not found');
    return donation;
  }

  async getStats() {
    const [total, last30Days, byBloodType] = await Promise.all([
      this.prisma.donation.count(),
      this.prisma.donation.count({
        where: { donatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
      this.prisma.donation.groupBy({
        by: ['bloodType'],
        _count: true,
      }),
    ]);

    return { total, last30Days, byBloodType };
  }
}
