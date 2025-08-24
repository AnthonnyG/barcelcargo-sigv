/*
  Warnings:

  - Made the column `hora` on table `Viagem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Viagem" ALTER COLUMN "hora" SET NOT NULL,
ALTER COLUMN "hora" SET DEFAULT CURRENT_TIMESTAMP;
