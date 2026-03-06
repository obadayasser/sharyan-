import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { BadgeType } from '@prisma/client';
import { paginate } from '../common/utils/pagination.util.js';

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [donors, total] = await Promise.all([
      this.prisma.donor.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          bloodType: true,
          points: true,
          totalDonations: true,
          badges: true,
        },
        orderBy: { points: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.donor.count({ where: { isActive: true, points: { gt: 0 } } }),
    ]);
    return paginate(donors, total, page, limit);
  }

  async getAllBadges() {
    const badgeDescriptions: Record<BadgeType, { name: string; nameAr: string; description: string }> = {
      FIRST_DONATION: { name: 'First Donation', nameAr: 'أول تبرع', description: 'Complete your first blood donation' },
      FIVE_DONATIONS: { name: 'Five Donations', nameAr: 'خمس تبرعات', description: 'Complete 5 blood donations' },
      TEN_DONATIONS: { name: 'Ten Donations', nameAr: 'عشر تبرعات', description: 'Complete 10 blood donations' },
      TWENTY_FIVE_DONATIONS: { name: '25 Donations', nameAr: '25 تبرع', description: 'Complete 25 blood donations' },
      FIFTY_DONATIONS: { name: '50 Donations', nameAr: '50 تبرع', description: 'Complete 50 blood donations' },
      LIFE_SAVER: { name: 'Life Saver', nameAr: 'منقذ حياة', description: 'Respond to an emergency blood request' },
      SPEED_HERO: { name: 'Speed Hero', nameAr: 'بطل السرعة', description: 'Respond to a request within 30 minutes' },
      CONSISTENT_DONOR: { name: 'Consistent Donor', nameAr: 'متبرع منتظم', description: 'Donate every 3 months for a year' },
      CAMPAIGN_CHAMPION: { name: 'Campaign Champion', nameAr: 'بطل الحملات', description: 'Participate in 5+ campaigns' },
      COMMUNITY_PILLAR: { name: 'Community Pillar', nameAr: 'ركيزة المجتمع', description: 'Earn 100+ points' },
    };
    return badgeDescriptions;
  }

  async getDonorSummary(donorId: string) {
    const donor = await this.prisma.donor.findUnique({
      where: { id: donorId },
      select: {
        id: true,
        name: true,
        points: true,
        totalDonations: true,
        badges: true,
      },
    });

    const rank = await this.prisma.donor.count({
      where: {
        isActive: true,
        points: { gt: donor?.points || 0 },
      },
    });

    return {
      ...donor,
      rank: rank + 1,
    };
  }

  async checkAndAwardBadges(donorId: string) {
    const donor = await this.prisma.donor.findUnique({
      where: { id: donorId },
      include: { badges: true },
    });
    if (!donor) return;

    const existingBadges = donor.badges.map((b) => b.badge);
    const newBadges: BadgeType[] = [];

    if (donor.totalDonations >= 1 && !existingBadges.includes('FIRST_DONATION')) {
      newBadges.push('FIRST_DONATION');
    }
    if (donor.totalDonations >= 5 && !existingBadges.includes('FIVE_DONATIONS')) {
      newBadges.push('FIVE_DONATIONS');
    }
    if (donor.totalDonations >= 10 && !existingBadges.includes('TEN_DONATIONS')) {
      newBadges.push('TEN_DONATIONS');
    }
    if (donor.totalDonations >= 25 && !existingBadges.includes('TWENTY_FIVE_DONATIONS')) {
      newBadges.push('TWENTY_FIVE_DONATIONS');
    }
    if (donor.totalDonations >= 50 && !existingBadges.includes('FIFTY_DONATIONS')) {
      newBadges.push('FIFTY_DONATIONS');
    }
    if (donor.points >= 100 && !existingBadges.includes('COMMUNITY_PILLAR')) {
      newBadges.push('COMMUNITY_PILLAR');
    }

    if (newBadges.length > 0) {
      await this.prisma.donorBadge.createMany({
        data: newBadges.map((badge) => ({ donorId, badge })),
      });
    }

    return newBadges;
  }
}
