-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DONOR', 'PATIENT', 'BLOOD_BANK');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "BloodBankStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "BloodRequestStatus" AS ENUM ('OPEN', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BloodRequestUrgency" AS ENUM ('NORMAL', 'URGENT', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "DonationOfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BLOOD_REQUEST', 'EMERGENCY_REQUEST', 'DONATION_REMINDER', 'CAMPAIGN_ANNOUNCEMENT', 'SHORTAGE_ALERT', 'DONATION_OFFER', 'CHAT_MESSAGE', 'BADGE_EARNED', 'POINTS_EARNED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ChatMessageType" AS ENUM ('TEXT', 'IMAGE', 'LOCATION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "StockLevel" AS ENUM ('CRITICAL', 'LOW', 'ADEQUATE', 'HIGH');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('FIRST_DONATION', 'FIVE_DONATIONS', 'TEN_DONATIONS', 'TWENTY_FIVE_DONATIONS', 'FIFTY_DONATIONS', 'LIFE_SAVER', 'SPEED_HERO', 'CONSISTENT_DONOR', 'CAMPAIGN_CHAMPION', 'COMMUNITY_PILLAR');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "refresh_token" TEXT,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donors" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT,
    "blood_type" "BloodType" NOT NULL,
    "gender" "Gender",
    "date_of_birth" TIMESTAMP(3),
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "last_donation_date" TIMESTAMP(3),
    "fcm_token" TEXT,
    "total_donations" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "fcm_token" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blood_banks" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "status" "BloodBankStatus" NOT NULL DEFAULT 'PENDING',
    "license_number" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "fcm_token" TEXT,
    "approved_at" TIMESTAMP(3),
    "approved_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blood_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blood_requests" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "blood_type" "BloodType" NOT NULL,
    "bags_needed" INTEGER NOT NULL,
    "bags_fulfilled" INTEGER NOT NULL DEFAULT 0,
    "urgency" "BloodRequestUrgency" NOT NULL DEFAULT 'NORMAL',
    "status" "BloodRequestStatus" NOT NULL DEFAULT 'OPEN',
    "patient_name" TEXT NOT NULL,
    "hospital_name" TEXT,
    "blood_bank_id" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "contact_phone" TEXT,
    "notes" TEXT,
    "share_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blood_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation_offers" (
    "id" TEXT NOT NULL,
    "blood_request_id" TEXT NOT NULL,
    "donor_id" TEXT NOT NULL,
    "status" "DonationOfferStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donation_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "donor_id" TEXT NOT NULL,
    "donation_offer_id" TEXT,
    "blood_type" "BloodType" NOT NULL,
    "bags_count" INTEGER NOT NULL DEFAULT 1,
    "hospital_name" TEXT,
    "notes" TEXT,
    "points_awarded" INTEGER NOT NULL DEFAULT 0,
    "donated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_by_admin_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blood_stocks" (
    "id" TEXT NOT NULL,
    "blood_bank_id" TEXT NOT NULL,
    "blood_type" "BloodType" NOT NULL,
    "bags_count" INTEGER NOT NULL,
    "stock_level" "StockLevel" NOT NULL DEFAULT 'ADEQUATE',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blood_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shortage_alerts" (
    "id" TEXT NOT NULL,
    "blood_bank_id" TEXT NOT NULL,
    "blood_type" "BloodType" NOT NULL,
    "message" TEXT,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shortage_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "blood_bank_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_ar" TEXT,
    "description" TEXT,
    "description_ar" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "target_bags" INTEGER,
    "collected_bags" INTEGER NOT NULL DEFAULT 0,
    "status" "CampaignStatus" NOT NULL DEFAULT 'UPCOMING',
    "blood_types" "BloodType"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_registrations" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "donor_id" TEXT NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donor_badges" (
    "id" TEXT NOT NULL,
    "donor_id" TEXT NOT NULL,
    "badge" "BadgeType" NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donor_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_transactions" (
    "id" TEXT NOT NULL,
    "donor_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "reference_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "donor_id" TEXT,
    "patient_id" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "title_ar" TEXT,
    "body" TEXT NOT NULL,
    "body_ar" TEXT,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_rooms" (
    "id" TEXT NOT NULL,
    "blood_request_id" TEXT,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_participants" (
    "id" TEXT NOT NULL,
    "chat_room_id" TEXT NOT NULL,
    "donor_id" TEXT,
    "patient_id" TEXT,
    "last_read_at" TIMESTAMP(3),
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "chat_room_id" TEXT NOT NULL,
    "sender_type" "UserRole" NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "ChatMessageType" NOT NULL DEFAULT 'TEXT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_logs" (
    "id" TEXT NOT NULL,
    "recipient_phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT,
    "reference_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "donors_device_id_key" ON "donors"("device_id");

-- CreateIndex
CREATE INDEX "donors_blood_type_is_available_idx" ON "donors"("blood_type", "is_available");

-- CreateIndex
CREATE INDEX "donors_latitude_longitude_idx" ON "donors"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "patients_device_id_key" ON "patients"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "blood_banks_device_id_key" ON "blood_banks"("device_id");

-- CreateIndex
CREATE INDEX "blood_banks_status_idx" ON "blood_banks"("status");

-- CreateIndex
CREATE INDEX "blood_banks_latitude_longitude_idx" ON "blood_banks"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "blood_requests_share_token_key" ON "blood_requests"("share_token");

-- CreateIndex
CREATE INDEX "blood_requests_blood_type_status_idx" ON "blood_requests"("blood_type", "status");

-- CreateIndex
CREATE INDEX "blood_requests_urgency_status_idx" ON "blood_requests"("urgency", "status");

-- CreateIndex
CREATE INDEX "blood_requests_latitude_longitude_idx" ON "blood_requests"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "donation_offers_status_idx" ON "donation_offers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "donation_offers_blood_request_id_donor_id_key" ON "donation_offers"("blood_request_id", "donor_id");

-- CreateIndex
CREATE UNIQUE INDEX "donations_donation_offer_id_key" ON "donations"("donation_offer_id");

-- CreateIndex
CREATE INDEX "donations_donor_id_idx" ON "donations"("donor_id");

-- CreateIndex
CREATE INDEX "donations_donated_at_idx" ON "donations"("donated_at");

-- CreateIndex
CREATE UNIQUE INDEX "blood_stocks_blood_bank_id_blood_type_key" ON "blood_stocks"("blood_bank_id", "blood_type");

-- CreateIndex
CREATE INDEX "shortage_alerts_blood_type_is_resolved_idx" ON "shortage_alerts"("blood_type", "is_resolved");

-- CreateIndex
CREATE INDEX "campaigns_status_start_date_idx" ON "campaigns"("status", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_registrations_campaign_id_donor_id_key" ON "campaign_registrations"("campaign_id", "donor_id");

-- CreateIndex
CREATE UNIQUE INDEX "donor_badges_donor_id_badge_key" ON "donor_badges"("donor_id", "badge");

-- CreateIndex
CREATE INDEX "point_transactions_donor_id_idx" ON "point_transactions"("donor_id");

-- CreateIndex
CREATE INDEX "notifications_donor_id_is_read_idx" ON "notifications"("donor_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_patient_id_is_read_idx" ON "notifications"("patient_id", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "chat_participants_chat_room_id_donor_id_key" ON "chat_participants"("chat_room_id", "donor_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_participants_chat_room_id_patient_id_key" ON "chat_participants"("chat_room_id", "patient_id");

-- CreateIndex
CREATE INDEX "chat_messages_chat_room_id_created_at_idx" ON "chat_messages"("chat_room_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "app_settings_key_key" ON "app_settings"("key");

-- AddForeignKey
ALTER TABLE "blood_requests" ADD CONSTRAINT "blood_requests_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_requests" ADD CONSTRAINT "blood_requests_blood_bank_id_fkey" FOREIGN KEY ("blood_bank_id") REFERENCES "blood_banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_offers" ADD CONSTRAINT "donation_offers_blood_request_id_fkey" FOREIGN KEY ("blood_request_id") REFERENCES "blood_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_offers" ADD CONSTRAINT "donation_offers_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "donors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "donors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donation_offer_id_fkey" FOREIGN KEY ("donation_offer_id") REFERENCES "donation_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_stocks" ADD CONSTRAINT "blood_stocks_blood_bank_id_fkey" FOREIGN KEY ("blood_bank_id") REFERENCES "blood_banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortage_alerts" ADD CONSTRAINT "shortage_alerts_blood_bank_id_fkey" FOREIGN KEY ("blood_bank_id") REFERENCES "blood_banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_blood_bank_id_fkey" FOREIGN KEY ("blood_bank_id") REFERENCES "blood_banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_registrations" ADD CONSTRAINT "campaign_registrations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_registrations" ADD CONSTRAINT "campaign_registrations_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "donors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donor_badges" ADD CONSTRAINT "donor_badges_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "donors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "donors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "donors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "chat_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "donors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "chat_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
