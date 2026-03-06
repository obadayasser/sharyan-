import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { BloodType } from '@prisma/client';

@Injectable()
export class GeoService {
  constructor(private readonly prisma: PrismaService) {}

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

  async findNearbyDonors(
    latitude: number,
    longitude: number,
    radiusKm: number,
    bloodTypes: BloodType[],
    limit: number = 50,
    minDonationIntervalDays: number = 56,
  ) {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() - minDonationIntervalDays);

    const donors = await this.prisma.donor.findMany({
      where: {
        bloodType: { in: bloodTypes },
        isAvailable: true,
        isActive: true,
        OR: [
          { lastDonationDate: null },
          { lastDonationDate: { lt: minDate } },
        ],
      },
    });

    return donors
      .map((donor) => ({
        ...donor,
        distanceKm: this.calculateDistance(
          latitude,
          longitude,
          donor.latitude,
          donor.longitude,
        ),
      }))
      .filter((d) => d.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
  }

  async findNearbyBloodBanks(
    latitude: number,
    longitude: number,
    radiusKm: number,
    limit: number = 20,
  ) {
    const banks = await this.prisma.bloodBank.findMany({
      where: { status: 'APPROVED', isActive: true },
      include: { stockEntries: true },
    });

    return banks
      .map((bank) => ({
        ...bank,
        distanceKm: this.calculateDistance(
          latitude,
          longitude,
          bank.latitude,
          bank.longitude,
        ),
      }))
      .filter((b) => b.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
