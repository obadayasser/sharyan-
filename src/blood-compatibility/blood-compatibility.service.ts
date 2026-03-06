import { Injectable } from '@nestjs/common';
import { BloodType } from '@prisma/client';

@Injectable()
export class BloodCompatibilityService {
  private readonly canReceiveFrom: Record<BloodType, BloodType[]> = {
    [BloodType.O_NEGATIVE]: [BloodType.O_NEGATIVE],
    [BloodType.O_POSITIVE]: [BloodType.O_NEGATIVE, BloodType.O_POSITIVE],
    [BloodType.A_NEGATIVE]: [BloodType.O_NEGATIVE, BloodType.A_NEGATIVE],
    [BloodType.A_POSITIVE]: [
      BloodType.O_NEGATIVE, BloodType.O_POSITIVE,
      BloodType.A_NEGATIVE, BloodType.A_POSITIVE,
    ],
    [BloodType.B_NEGATIVE]: [BloodType.O_NEGATIVE, BloodType.B_NEGATIVE],
    [BloodType.B_POSITIVE]: [
      BloodType.O_NEGATIVE, BloodType.O_POSITIVE,
      BloodType.B_NEGATIVE, BloodType.B_POSITIVE,
    ],
    [BloodType.AB_NEGATIVE]: [
      BloodType.O_NEGATIVE, BloodType.A_NEGATIVE,
      BloodType.B_NEGATIVE, BloodType.AB_NEGATIVE,
    ],
    [BloodType.AB_POSITIVE]: [
      BloodType.O_NEGATIVE, BloodType.O_POSITIVE,
      BloodType.A_NEGATIVE, BloodType.A_POSITIVE,
      BloodType.B_NEGATIVE, BloodType.B_POSITIVE,
      BloodType.AB_NEGATIVE, BloodType.AB_POSITIVE,
    ],
  };

  private readonly canDonateTo: Record<BloodType, BloodType[]> = {
    [BloodType.O_NEGATIVE]: [
      BloodType.O_NEGATIVE, BloodType.O_POSITIVE,
      BloodType.A_NEGATIVE, BloodType.A_POSITIVE,
      BloodType.B_NEGATIVE, BloodType.B_POSITIVE,
      BloodType.AB_NEGATIVE, BloodType.AB_POSITIVE,
    ],
    [BloodType.O_POSITIVE]: [
      BloodType.O_POSITIVE, BloodType.A_POSITIVE,
      BloodType.B_POSITIVE, BloodType.AB_POSITIVE,
    ],
    [BloodType.A_NEGATIVE]: [
      BloodType.A_NEGATIVE, BloodType.A_POSITIVE,
      BloodType.AB_NEGATIVE, BloodType.AB_POSITIVE,
    ],
    [BloodType.A_POSITIVE]: [BloodType.A_POSITIVE, BloodType.AB_POSITIVE],
    [BloodType.B_NEGATIVE]: [
      BloodType.B_NEGATIVE, BloodType.B_POSITIVE,
      BloodType.AB_NEGATIVE, BloodType.AB_POSITIVE,
    ],
    [BloodType.B_POSITIVE]: [BloodType.B_POSITIVE, BloodType.AB_POSITIVE],
    [BloodType.AB_NEGATIVE]: [BloodType.AB_NEGATIVE, BloodType.AB_POSITIVE],
    [BloodType.AB_POSITIVE]: [BloodType.AB_POSITIVE],
  };

  getCompatibleDonorTypes(recipientBloodType: BloodType): BloodType[] {
    return this.canReceiveFrom[recipientBloodType];
  }

  getCompatibleRecipientTypes(donorBloodType: BloodType): BloodType[] {
    return this.canDonateTo[donorBloodType];
  }

  isCompatible(donorBloodType: BloodType, recipientBloodType: BloodType): boolean {
    return this.canReceiveFrom[recipientBloodType].includes(donorBloodType);
  }

  getCompatibilityTable() {
    return {
      canReceiveFrom: this.canReceiveFrom,
      canDonateTo: this.canDonateTo,
    };
  }
}
