# Deploy sem falhas evitáveis

## Preview

1. Crie projeto Supabase separado para preview.
2. Execute migrations.
3. Configure variáveis na Vercel Preview.
4. Rode `npm run verify` localmente.
5. Faça deploy de preview.
6. Teste login, owner, CRUD, RLS, upload, busca, clique externo, analytics, mobile e acessibilidade.

## Produção

1. Backup do banco.
2. Execute migrations em produção.
3. Configure variáveis Production.
4. Mantenha `SITE_INDEXING_ENABLED=false`.
5. Publique e faça smoke test.
6. Ative indexação no Studio e depois mude a variável para `true`.
7. Monitore erros, cliques e desempenho.

## Rollback

- Código: restaure o commit anterior e faça novo deploy.
- Banco: use migration de reversão testada; não apague colunas durante a mesma janela de lançamento.
- Conteúdo: altere produto para rascunho ou arquivado.
