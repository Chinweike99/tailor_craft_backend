-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DesignCategory" AS ENUM ('NATIVE', 'CASUAL', 'FORMAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'SUCCESS', 'REFUNDED', 'PROCESSING', 'PENDING');
migrations/0_init
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CLIENT');

-- CreateTable
CREATE TABLE "Booking" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "designId" UUID,
    "customDesign" JSONB,
    "measurements" JSONB NOT NULL,
    "deliveryDate" TIMESTAMPTZ(6) NOT NULL,
    "notes" TEXT,
    "status" "BookingStatus" DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" DEFAULT 'UNPAID',
    "declineReason" TEXT,
    "hasReview" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" INTEGER,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Design" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "priceRange" JSONB NOT NULL,
    "category" "DesignCategory" NOT NULL,
    "minimumDeliveryTime" INTEGER NOT NULL,
    "requiredMaterials" TEXT[],
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Design_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guide" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "resourceUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" DEFAULT 'UNPAID',
    "isInstallment" BOOLEAN DEFAULT false,
    "paymentReference" TEXT,
    "paymentUrl" TEXT,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bookingId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "daysBefore" INTEGER NOT NULL,
    "sentAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "rating" INTEGER,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" DEFAULT 'CLIENT',
    "isVerified" BOOLEAN DEFAULT false,
    "otp" TEXT,
    "otpExpires" TIMESTAMPTZ(6),
    "profileImage" TEXT,
    "bio" TEXT,
    "address" JSONB,
    "preferredPickupAddress" JSONB,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingVerification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "otp" TEXT NOT NULL,
    "otpExpires" TIMESTAMP(6) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevokedToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevokedToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PendingVerification_email_key" ON "PendingVerification"("email");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "fk_booking_design" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "fk_booking_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "fk_payment_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "fk_payment_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "fk_reminder_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "fk_reminder_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "fk_review_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "fk_review_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

