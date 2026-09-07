-- AlterTable
ALTER TABLE "Venda" ADD COLUMN     "cancelada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canceladaEm" TIMESTAMP(3);
