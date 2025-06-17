/*
  Warnings:

  - The values [ALLOW_ANONYMOUS_ACCESS,ALLOW_SIGNUPS] on the enum `InstallationSettingName` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InstallationSettingName_new" AS ENUM ('IS_FIRST_SETUP_COMPLETED', 'ALLOW_NEW_COMMENTS', 'ALLOW_COMMENT_UPDATES', 'ALLOW_COMMENT_DELETION', 'ALLOW_COMMENT_INTERACTIONS');
ALTER TABLE "installation_settings" ALTER COLUMN "name" TYPE "InstallationSettingName_new" USING ("name"::text::"InstallationSettingName_new");
ALTER TYPE "InstallationSettingName" RENAME TO "InstallationSettingName_old";
ALTER TYPE "InstallationSettingName_new" RENAME TO "InstallationSettingName";
DROP TYPE "InstallationSettingName_old";
COMMIT;
