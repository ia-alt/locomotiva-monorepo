-- Arquivos viram entidade própria do módulo storage (tabela "files", com
-- exclusão lógica — o registro fica, só o objeto sai do bucket) e o pedido
-- de impressão passa a referenciar arquivos e filamento por id (não mais
-- snapshot de nome/url).

-- limpa pedidos de teste (dev) — as colunas novas de referência são NOT NULL
DELETE FROM "print_requests";

-- storage: registro dos arquivos enviados
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- print_requests: referências por id no lugar dos snapshots de arquivo/material
ALTER TABLE "print_requests"
  DROP COLUMN "stlFileName",
  DROP COLUMN "stlFileUrl",
  DROP COLUMN "stlFileSizeBytes",
  DROP COLUMN "gcodeFileName",
  DROP COLUMN "gcodeFileUrl",
  DROP COLUMN "gcodeFileSizeBytes",
  DROP COLUMN "material",
  ADD COLUMN "stlFileId" TEXT NOT NULL,
  ADD COLUMN "gcodeFileId" TEXT NOT NULL,
  ADD COLUMN "filamentId" TEXT NOT NULL;
