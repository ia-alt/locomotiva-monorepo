-- Registra quem enviou o arquivo (auditoria / futura checagem de dono).
-- Nullable: arquivos anteriores à coluna não têm como ser atribuídos.
ALTER TABLE "files" ADD COLUMN "uploadedByUserId" TEXT;
