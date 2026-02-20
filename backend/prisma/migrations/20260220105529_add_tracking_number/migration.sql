/*
  Warnings:

  - A unique constraint covering the columns `[trackingNumber]` on the table `TransportNumber` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `trackingNumber` to the `TransportNumber` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[TransportNumber] ADD [trackingNumber] NVARCHAR(1000) NOT NULL;

-- CreateIndex
ALTER TABLE [dbo].[TransportNumber] ADD CONSTRAINT [TransportNumber_trackingNumber_key] UNIQUE NONCLUSTERED ([trackingNumber]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
