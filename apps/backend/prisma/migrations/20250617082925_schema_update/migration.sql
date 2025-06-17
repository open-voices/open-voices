/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `website` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[url]` on the table `website` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "website_name_key" ON "website"("name");

-- CreateIndex
CREATE UNIQUE INDEX "website_url_key" ON "website"("url");
