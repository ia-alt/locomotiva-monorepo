-- ============================================================================
-- REVERSÃO das migrações do Login Único gov.br
--
--   20260805180000_govbr_login_unico
--   20260805190000_govbr_auth_requests
--   20260805200000_govbr_pending_identities
--
-- Fica FORA de prisma/migrations de propósito: o Prisma trataria qualquer pasta
-- lá dentro como migração a aplicar. Este arquivo é para execução manual.
-- Não existe `prisma migrate down` — reverter schema é SQL escrito à mão.
--
-- ----------------------------------------------------------------------------
-- ANTES DE RODAR, LEIA:
--
-- Só o último passo é problemático. `SET NOT NULL` em `passwordHash` FALHA se
-- alguma conta já tiver entrado pelo gov.br, porque essas contas têm senha nula
-- por definição. Rode a verificação abaixo primeiro.
--
-- Se houver contas federadas, você precisa decidir o destino delas ANTES:
--   a) apagar (perdem reservas, check-ins e pedidos de impressão), ou
--   b) definir uma senha provisória e avisar cada pessoa, ou
--   c) não reverter o banco — apenas o código, que funciona sem esta reversão.
--
-- A opção (c) costuma ser a certa: o código antigo roda normalmente com o
-- schema novo. Reverter o banco só é necessário para apagar o rastro.
-- ============================================================================

-- PASSO 0 — verificação. Rode isto SOZINHO primeiro.
--   Se `contas_federadas` for maior que zero, PARE e decida (a), (b) ou (c).
SELECT
    count(*) FILTER (WHERE "passwordHash" IS NULL) AS contas_federadas,
    count(*) FILTER (WHERE "govbrSub" IS NOT NULL) AS contas_vinculadas,
    count(*)                                       AS total
FROM "users";


-- PASSO 0.1 — SÓ EM AMBIENTE DE TESTE, e só se o PASSO 0 acusou contas
-- federadas criadas durante os seus próprios testes.
--
-- Veja quem são antes de apagar qualquer coisa:
--
--   SELECT id, name, email, cpf, "createdAt"
--     FROM "users" WHERE "passwordHash" IS NULL ORDER BY "createdAt";
--
-- `users` tem uma única chave estrangeira apontando para ela (`files`), então
-- as linhas soltas em bookings / access_logs / print_requests não impedem a
-- exclusão — mas ficam órfãs. Em teste isso é aceitável; em produção, não.
--
--   DELETE FROM "files" WHERE "uploadedByUserId" IN
--       (SELECT id FROM "users" WHERE "passwordHash" IS NULL);
--   DELETE FROM "users" WHERE "passwordHash" IS NULL;
--
-- Deixado comentado de propósito: apagar conta de pessoa é decisão consciente,
-- não algo que se executa junto com o resto do script sem perceber.


-- ============================================================================
-- A partir daqui é a reversão. Rode dentro de uma transação.
-- ============================================================================
BEGIN;

-- PASSO 1 — tabelas auxiliares. Guardam apenas estado de login em trânsito
-- (segundos de vida), então não há dado de negócio a preservar.
DROP TABLE IF EXISTS "govbr_pending_identities";
DROP TABLE IF EXISTS "govbr_auth_requests";

-- PASSO 2 — colunas do gov.br em `users`.
DROP INDEX IF EXISTS "users_govbrSub_key";
ALTER TABLE "users" DROP COLUMN IF EXISTS "govbrSub";
ALTER TABLE "users" DROP COLUMN IF EXISTS "authProvider";

-- PASSO 3 — restaura a obrigatoriedade da senha.
-- Falha se o PASSO 0 acusou contas federadas. A falha é proposital: melhor
-- abortar a transação do que apagar conta de alguém em silêncio.
ALTER TABLE "users" ALTER COLUMN "passwordHash" SET NOT NULL;

-- PASSO 4 — faz o Prisma esquecer que aplicou estas migrações, para que
-- `migrate status` volte a bater com o schema real.
DELETE FROM "_prisma_migrations"
 WHERE "migration_name" IN (
    '20260805180000_govbr_login_unico',
    '20260805190000_govbr_auth_requests',
    '20260805200000_govbr_pending_identities'
 );

COMMIT;

-- Depois de reverter, o schema.prisma e o client Prisma também precisam voltar
-- ao commit anterior — senão o próximo `migrate dev` tenta reaplicar tudo.
