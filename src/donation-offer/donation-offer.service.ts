import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDonationOfferDto } from './dto/create-donation-offer.dto.js';

@Injectable()
export class DonationOfferService {
  constructor(private readonly prisma: PrismaService) {}

  async create(donorId: string, dto: CreateDonationOfferDto) {
    const request = await this.prisma.bloodRequest.findUnique({
      where: { id: dto.bloodRequestId },
    });
    if (!request) throw new NotFoundException('Blood request not found');
    if (request.status !== 'OPEN' && request.status !== 'PARTIALLY_FULFILLED') {
      throw new ConflictException('Blood request is not accepting offers');
    }

    const existing = await this.prisma.donationOffer.findUnique({
      where: {
        bloodRequestId_donorId: {
          bloodRequestId: dto.bloodRequestId,
          donorId,
        },
      },
    });
    if (existing) throw new ConflictException('You already offered for this request');

    return this.prisma.donationOffer.create({
      data: {
        bloodRequestId: dto.bloodRequestId,
        donorId,
        message: dto.message,
      },
      include: {
        donor: { select: { id: true, name: true, bloodType: true } },
        bloodRequest: { select: { id: true, bloodType: true, patientName: true } },
      },
    });
  }

  async findByRequest(requestId: string) {
    return this.prisma.donationOffer.findMany({
      where: { bloodRequestId: requestId },
      include: {
        donor: { select: { id: true, name: true, bloodType: true, mobile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async accept(id: string, patientId: string) {
    const offer = await this.getOfferWithRequest(id);
    if (offer.bloodRequest.patientId !== patientId) {
      throw new ForbiddenException('Not your request');
    }

    return this.prisma.donationOffer.update({
      where: { id },
      data: { status: 'ACCEPTED', respondedAt: new Date() },
    });
  }

  async reject(id: string, patientId: string) {
    const offer = await this.getOfferWithRequest(id);
    if (offer.bloodRequest.patientId !== patientId) {
      throw new ForbiddenException('Not your request');
    }

    return this.prisma.donationOffer.update({
      where: { id },
      data: { status: 'REJECTED', respondedAt: new Date() },
    });
  }

  async complete(id: string) {
    const offer = await this.prisma.donationOffer.findUnique({
      where: { id },
      include: { bloodRequest: true, donor: true },
    });
    if (!offer) throw new NotFoundException('Offer not found');

    const [updatedOffer] = await this.prisma.$transaction([
      this.prisma.donationOffer.update({
        where: { id },
        data: { status: 'COMPLETED', respondedAt: new Date() },
      }),
      this.prisma.donation.create({
        data: {
          donorId: offer.donorId,
          donationOfferId: offer.id,
          bloodType: offer.bloodRequest.bloodType,
          hospitalName: offer.bloodRequest.hospitalName,
          pointsAwarded: 100,
        },
      }),
      this.prisma.donor.update({
        where: { id: offer.donorId },
        data: {
          totalDonations: { increment: 1 },
          points: { increment: 100 },
          lastDonationDate: new Date(),
        },
      }),
      this.prisma.bloodRequest.update({
        where: { id: offer.bloodRequestId },
        data: {
          bagsFulfilled: { increment: 1 },
          status:
            offer.bloodRequest.bagsFulfilled + 1 >= offer.bloodRequest.bagsNeeded
              ? 'FULFILLED'
              : 'PARTIALLY_FULFILLED',
        },
      }),
      this.prisma.pointTransaction.create({
        data: {
          donorId: offer.donorId,
          points: 100,
          reason: 'Blood donation completed',
          referenceId: offer.id,
        },
      }),
    ]);

    return updatedOffer;
  }

  async cancel(id: string, donorId: string) {
    const offer = await this.prisma.donationOffer.findUnique({ where: { id } });
    if (!offer) throw new NotFoundException('Offer not found');
    if (offer.donorId !== donorId) throw new ForbiddenException('Not your offer');

    return this.prisma.donationOffer.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  private async getOfferWithRequest(id: string) {
    const offer = await this.prisma.donationOffer.findUnique({
      where: { id },
      include: { bloodRequest: true },
    });
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }
}
