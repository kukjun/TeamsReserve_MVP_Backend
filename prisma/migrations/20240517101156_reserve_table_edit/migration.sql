/*
  Warnings:

  - You are about to drop the column `times` on the `reserve` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `space` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endTime` to the `reserve` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memberId` to the `reserve` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spaceId` to the `reserve` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `reserve` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reserve" DROP COLUMN "times",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "memberId" UUID NOT NULL,
ADD COLUMN     "spaceId" UUID NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "space_name_key" ON "space"("name");

-- AddForeignKey
ALTER TABLE "reserve" ADD CONSTRAINT "reserve_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserve" ADD CONSTRAINT "reserve_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
