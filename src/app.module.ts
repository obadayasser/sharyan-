import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AdminModule } from './admin/admin.module.js';
import { DonorModule } from './donor/donor.module.js';
import { PatientModule } from './patient/patient.module.js';
import { BloodBankModule } from './blood-bank/blood-bank.module.js';
import { BloodCompatibilityModule } from './blood-compatibility/blood-compatibility.module.js';
import { GeoModule } from './geo/geo.module.js';
import { BloodRequestModule } from './blood-request/blood-request.module.js';
import { DonationOfferModule } from './donation-offer/donation-offer.module.js';
import { DonationModule } from './donation/donation.module.js';
import { BloodStockModule } from './blood-stock/blood-stock.module.js';
import { CampaignModule } from './campaign/campaign.module.js';
import { NotificationModule } from './notification/notification.module.js';
import { ChatModule } from './chat/chat.module.js';
import { SmsModule } from './sms/sms.module.js';
import { GamificationModule } from './gamification/gamification.module.js';
import { ShareModule } from './share/share.module.js';
import { FirebaseModule } from './firebase/firebase.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FirebaseModule,
    PrismaModule,
    AuthModule,
    AdminModule,
    DonorModule,
    PatientModule,
    BloodBankModule,
    BloodCompatibilityModule,
    GeoModule,
    BloodRequestModule,
    DonationOfferModule,
    DonationModule,
    BloodStockModule,
    CampaignModule,
    NotificationModule,
    ChatModule,
    SmsModule,
    GamificationModule,
    ShareModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
