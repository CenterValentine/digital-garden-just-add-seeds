-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'EMAIL');

-- CreateEnum
CREATE TYPE "CatalogType" AS ENUM ('PLANT', 'IRRIGATION', 'ARTIFACT', 'FURNITURE');

-- CreateEnum
CREATE TYPE "OverlayType" AS ENUM ('AI_ENHANCED', 'BYOI');

-- CreateEnum
CREATE TYPE "PlantStatus" AS ENUM ('PLANTED', 'GROWING', 'HARVESTED');

-- CreateEnum
CREATE TYPE "RuleScope" AS ENUM ('PLANT', 'GLOBAL');

-- CreateEnum
CREATE TYPE "RuleTriggerType" AS ENUM ('TIME', 'CONDITION');

-- CreateEnum
CREATE TYPE "RuleOutputType" AS ENUM ('TASK', 'ALERT', 'MESSAGE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'DONE', 'SNOOZED');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "authProvider" "AuthProvider" NOT NULL,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "intents" TEXT[],
    "experienceLevel" TEXT,
    "climateZone" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Garden" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseLocation" JSONB NOT NULL,
    "timezone" TEXT NOT NULL,

    CONSTRAINT "Garden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GardenArea" (
    "id" TEXT NOT NULL,
    "gardenId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "polygonGeoJSON" JSONB NOT NULL,
    "areaSqM" DOUBLE PRECISION NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GardenArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapOverlay" (
    "id" TEXT NOT NULL,
    "gardenId" TEXT NOT NULL,
    "type" "OverlayType" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "bounds" JSONB NOT NULL,
    "opacity" DOUBLE PRECISION NOT NULL,
    "alignmentPoints" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MapOverlay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogItem" (
    "id" TEXT NOT NULL,
    "type" "CatalogType" NOT NULL,
    "name" TEXT NOT NULL,
    "categoryPath" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,

    CONSTRAINT "CatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantCatalog" (
    "id" TEXT NOT NULL,
    "catalogItemId" TEXT NOT NULL,
    "spacingCm" INTEGER NOT NULL,
    "growthDays" INTEGER NOT NULL,
    "sunNeeds" TEXT NOT NULL,
    "waterNeeds" TEXT NOT NULL,
    "compatiblePlants" TEXT[],
    "antagonisticPlants" TEXT[],
    "zones" TEXT[],
    "defaultRules" JSONB NOT NULL,

    CONSTRAINT "PlantCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GardenItem" (
    "id" TEXT NOT NULL,
    "gardenId" TEXT NOT NULL,
    "gardenAreaId" TEXT NOT NULL,
    "catalogItemId" TEXT NOT NULL,
    "type" "CatalogType" NOT NULL,
    "location" JSONB NOT NULL,
    "rotation" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GardenItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantInstance" (
    "id" TEXT NOT NULL,
    "gardenItemId" TEXT NOT NULL,
    "plantedAt" TIMESTAMP(3) NOT NULL,
    "status" "PlantStatus" NOT NULL,
    "overrides" JSONB NOT NULL,

    CONSTRAINT "PlantInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleTemplate" (
    "id" TEXT NOT NULL,
    "scope" "RuleScope" NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "triggerType" "RuleTriggerType" NOT NULL,
    "paramsSchema" JSONB NOT NULL,
    "defaultParams" JSONB NOT NULL,
    "outputType" "RuleOutputType" NOT NULL,

    CONSTRAINT "RuleTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleAssignment" (
    "id" TEXT NOT NULL,
    "plantInstanceId" TEXT NOT NULL,
    "ruleTemplateId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "paramsOverride" JSONB NOT NULL,

    CONSTRAINT "RuleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "plantInstanceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "sourceRuleId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "plantInstanceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceRuleId" TEXT NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboxMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceRuleId" TEXT,

    CONSTRAINT "InboxMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OverlayEnhancementAttempt" (
    "id" TEXT NOT NULL,
    "gardenId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OverlayEnhancementAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlantCatalog_catalogItemId_key" ON "PlantCatalog"("catalogItemId");

-- CreateIndex
CREATE UNIQUE INDEX "PlantInstance_gardenItemId_key" ON "PlantInstance"("gardenItemId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garden" ADD CONSTRAINT "Garden_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GardenArea" ADD CONSTRAINT "GardenArea_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "Garden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapOverlay" ADD CONSTRAINT "MapOverlay_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "Garden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantCatalog" ADD CONSTRAINT "PlantCatalog_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GardenItem" ADD CONSTRAINT "GardenItem_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "Garden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GardenItem" ADD CONSTRAINT "GardenItem_gardenAreaId_fkey" FOREIGN KEY ("gardenAreaId") REFERENCES "GardenArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GardenItem" ADD CONSTRAINT "GardenItem_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantInstance" ADD CONSTRAINT "PlantInstance_gardenItemId_fkey" FOREIGN KEY ("gardenItemId") REFERENCES "GardenItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleAssignment" ADD CONSTRAINT "RuleAssignment_plantInstanceId_fkey" FOREIGN KEY ("plantInstanceId") REFERENCES "PlantInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleAssignment" ADD CONSTRAINT "RuleAssignment_ruleTemplateId_fkey" FOREIGN KEY ("ruleTemplateId") REFERENCES "RuleTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_plantInstanceId_fkey" FOREIGN KEY ("plantInstanceId") REFERENCES "PlantInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_plantInstanceId_fkey" FOREIGN KEY ("plantInstanceId") REFERENCES "PlantInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxMessage" ADD CONSTRAINT "InboxMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverlayEnhancementAttempt" ADD CONSTRAINT "OverlayEnhancementAttempt_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "Garden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
