import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterBloodBankDto } from './dto/register-blood-bank.dto.js';
import { UpdateBloodBankDto } from './dto/update-blood-bank.dto.js';
import { paginate } from '../common/utils/pagination.util.js';

@Injectable()
export class BloodBankService {
  constructor(private readonly prisma: PrismaService) {}

  async registerOrGet(deviceId: string, dto: RegisterBloodBankDto) {
    const existing = await this.prisma.bloodBank.findUnique({ where: { deviceId } });
    if (existing) return existing;

    return this.prisma.bloodBank.create({
      data: {
        deviceId,
        ...dto,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [banks, total] = await Promise.all([
      this.prisma.bloodBank.findMany({
        where: { status: 'APPROVED', isActive: true },
        skip,
        take: limit,
        include: { stockEntries: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.bloodBank.count({ where: { status: 'APPROVED', isActive: true } }),
    ]);
    return paginate(banks, total, page, limit);
  }

  async findOne(id: string) {
    const bank = await this.prisma.bloodBank.findUnique({
      where: { id },
      include: {
        stockEntries: true,
        shortageAlerts: { where: { isResolved: false } },
        campaigns: { where: { status: { in: ['UPCOMING', 'ACTIVE'] } } },
      },
    });
    if (!bank) throw new NotFoundException('Blood bank not found');
    return bank;
  }

  async updateProfile(deviceId: string, dto: UpdateBloodBankDto) {
    const bank = await this.prisma.bloodBank.findUnique({ where: { deviceId } });
    if (!bank) throw new NotFoundException('Blood bank not found');
    if (bank.status !== 'APPROVED') throw new ForbiddenException('Blood bank not approved');

    return this.prisma.bloodBank.update({
      where: { deviceId },
      data: dto,
    });
  }

  async getMyStock(deviceId: string) {
    const bank = await this.prisma.bloodBank.findUnique({
      where: { deviceId },
      include: { stockEntries: true },
    });
    if (!bank) throw new NotFoundException('Blood bank not found');
    return bank.stockEntries;
  }

  async findPending(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [banks, total] = await Promise.all([
      this.prisma.bloodBank.findMany({
        where: { status: 'PENDING' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.bloodBank.count({ where: { status: 'PENDING' } }),
    ]);
    return paginate(banks, total, page, limit);
  }

  async approve(id: string, adminId: string) {
    return this.prisma.bloodBank.update({
      where: { id },
      data: { status: 'APPROVED', approvedAt: new Date(), approvedById: adminId },
    });
  }

  async reject(id: string) {
    return this.prisma.bloodBank.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  async suspend(id: string) {
    return this.prisma.bloodBank.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });
  }
}
