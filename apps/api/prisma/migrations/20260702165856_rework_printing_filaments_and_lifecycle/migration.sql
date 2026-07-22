-- Reforma do módulo printing: filamentos dinâmicos (catálogo do admin),
-- dois arquivos por pedido (.stl + .gcode), fim do agendamento por data
-- e novos status no ciclo de vida (delivered / discarded).

-- limpa pedidos de teste (dev) — as colunas novas de arquivo são NOT NULL
DELETE FROM "print_requests";

-- printers: materiais suportados deixam de existir (o catálogo de filamentos é global)
ALTER TABLE "printers" DROP COLUMN "supportedMaterials";

-- print_requests: dois arquivos, sem datas/estimativa de duração
ALTER TABLE "print_requests"
  DROP COLUMN "fileName",
  DROP COLUMN "fileUrl",
  DROP COLUMN "fileSizeBytes",
  DROP COLUMN "estimatedDurationMinutes",
  DROP COLUMN "preferredDate",
  DROP COLUMN "scheduledStartTime",
  DROP COLUMN "scheduledEndTime",
  ADD COLUMN "stlFileName" TEXT NOT NULL,
  ADD COLUMN "stlFileUrl" TEXT NOT NULL,
  ADD COLUMN "stlFileSizeBytes" INTEGER,
  ADD COLUMN "gcodeFileName" TEXT NOT NULL,
  ADD COLUMN "gcodeFileUrl" TEXT NOT NULL,
  ADD COLUMN "gcodeFileSizeBytes" INTEGER;

-- a disponibilidade global por data não existe mais
DROP TABLE "printing_settings";

-- catálogo de filamentos gerido pelo admin
CREATE TABLE "filaments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filaments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "filaments_name_key" ON "filaments"("name");
