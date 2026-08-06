# Banco de dados

## Aplicação

Execute `001` até `008` na ordem. Em ambiente local com Supabase CLI:

```bash
npx supabase start
npx supabase db reset
```

Em projeto remoto:

```bash
npx supabase link --project-ref SEU_REF
npx supabase db push
```

## RLS

Todas as tabelas de domínio possuem RLS. Leitura pública é restrita a categorias ativas, produtos publicados e banners ativos. Analytics não permite inserção direta pelo cliente; a API usa service role somente no servidor.

## Retenção

Agende `select public.purge_old_analytics();` diariamente no Supabase Cron para apagar eventos brutos com mais de 90 dias.

## Backup

Antes de cada migration em produção, gere backup e teste rollback em preview. Nunca execute alterações destrutivas diretamente no SQL Editor de produção.
