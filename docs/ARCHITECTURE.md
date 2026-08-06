# Arquitetura

## Fluxo público

Navegador → Next.js App Router → Supabase com chave anônima e RLS → páginas públicas.

O clique de oferta passa por `/go/[code]`, valida o código, consulta o produto publicado, registra evento anônimo com service role no servidor e redireciona apenas para HTTP/HTTPS.

## Fluxo administrativo

H&S Studio → Supabase Auth → `user_roles` → RLS → CRUD autorizado.

Papéis:
- owner: controle total e gestão de papéis;
- admin: conteúdo e configurações;
- editor: conteúdo e mídia;
- analyst: leitura e analytics.

## Banco

Migrations independentes criam extensões, schema, funções, RLS, Storage, analytics, seed e retenção. Não edite migration aplicada; crie uma nova.

## Privacidade

O cookie `hs_anonymous_id` é aleatório e first-party. O sistema armazena apenas dispositivo aproximado, domínio de referência e navegação. IP bruto e user-agent bruto não são persistidos.
