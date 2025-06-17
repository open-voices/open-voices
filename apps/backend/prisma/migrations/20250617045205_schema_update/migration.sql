-- CreateEnum
CREATE TYPE "InstallationSettingName" AS ENUM ('ALLOW_ANONYMOUS_ACCESS', 'ALLOW_SIGNUPS', 'IS_FIRST_SETUP_COMPLETED');

-- CreateTable
CREATE TABLE "installation_settings" (
    "id" TEXT NOT NULL,
    "name" "InstallationSettingName" NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "installation_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "installation_settings_name_key" ON "installation_settings"("name");
