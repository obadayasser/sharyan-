import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateStockDto } from './dto/update-stock.dto.js';
import { CreateShortageAlertDto } from './dto/create-shortage-alert.dto.js';
import { paginate } from '../common/utils/pagination.util.js';

@Injectable()
export class BloodStockService {
  constructor(private readonly prisma: PrismaService) {}

  async updateStock(bloodBankId: string, dto: UpdateStockDto) {
    return this.prisma.bloodStock.upsert({
      where: {
        bloodBankId_bloodType: {
          bloodBankId,
          bloodType: dto.bloodType,
        },
      },
      update: {
        bagsCount: dto.bagsCount,
        stockLevel: dto.stockLevel,
      },
      create: {
        bloodBankId,
        bloodType: dto.bloodType,
        bagsCount: dto.bagsCount,
        stockLevel: dto.stockLevel,
      },
    });
  }

  async getStockByBank(bankId: string) {
    return this.prisma.bloodStock.findMany({
      where: { bloodBankId: bankId },
      orderBy: { bloodType: 'asc' },
    });
  }

  async createShortageAlert(bloodBankId: string, dto: CreateShortageAlertDto) {
    return this.prisma.shortageAlert.create({
      data: {
        bloodBankId,
        bloodType: dto.bloodType,
        message: dto.message,
      },
      include: { bloodBank: { select: { name: true } } },
    });
  }

  async getActiveAlerts(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [alerts, total] = await Promise.all([
      this.prisma.shortageAlert.findMany({
        where: { isResolved: false },
        skip,
        take: limit,
        include: { bloodBank: { select: { name: true, city: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.shortageAlert.count({ where: { isResolved: false } }),
    ]);
    return paginate(alerts, total, page, limit);
  }

  async resolveAlert(id: string) {
    const alert = await this.prisma.shortageAlert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException('Alert not found');

    return this.prisma.shortageAlert.update({
      where: { id },
      data: { isResolved: true, resolvedAt: new Date() },
    });
  }
}
