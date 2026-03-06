import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { UpdateCampaignDto } from './dto/update-campaign.dto.js';
import { CampaignQueryDto } from './dto/campaign-query.dto.js';
import { paginate } from '../common/utils/pagination.util.js';

@Injectable()
export class CampaignService {
  constructor(private readonly prisma: PrismaService) {}

  async create(bloodBankId: string, dto: CreateCampaignDto) {
    return this.prisma.campaign.create({
      data: {
        bloodBankId,
        title: dto.title,
        titleAr: dto.titleAr,
        description: dto.description,
        descriptionAr: dto.descriptionAr,
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        targetBags: dto.targetBags,
        bloodTypes: dto.bloodTypes || [],
      },
      include: { bloodBank: { select: { name: true } } },
    });
  }

  async findAll(query: CampaignQueryDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 20);
    const where: any = {};
    if (query.status) where.status = query.status;

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: query.limit || 20,
        include: {
          bloodBank: { select: { name: true, city: true } },
          _count: { select: { registrations: true } },
        },
        orderBy: { startDate: 'desc' },
      }),
      this.prisma.campaign.count({ where }),
    ]);
    return paginate(campaigns, total, query.page || 1, query.limit || 20);
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        bloodBank: { select: { name: true, city: true, phone: true } },
        _count: { select: { registrations: true } },
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async update(id: string, bloodBankId: string, dto: UpdateCampaignDto) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.bloodBankId !== bloodBankId) throw new ForbiddenException('Not your campaign');

    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);

    return this.prisma.campaign.update({ where: { id }, data });
  }

  async cancel(id: string) {
    return this.prisma.campaign.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async register(campaignId: string, donorId: string) {
    return this.prisma.campaignRegistration.create({
      data: { campaignId, donorId },
    });
  }

  async unregister(campaignId: string, donorId: string) {
    return this.prisma.campaignRegistration.delete({
      where: {
        campaignId_donorId: { campaignId, donorId },
      },
    });
  }

  async markAttendance(campaignId: string, donorId: string) {
    return this.prisma.campaignRegistration.update({
      where: {
        campaignId_donorId: { campaignId, donorId },
      },
      data: { attended: true },
    });
  }
}
