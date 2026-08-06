# H&S Achadinhos — projeto completo

Plataforma mobile-first de curadoria de produtos afiliados, com site público, busca, categorias, redirecionamento rastreado, H&S Studio, papéis administrativos, importação, mídia, analytics próprio, SEO, Supabase e deploy na Vercel.

## O que existe

- Site público: home, catálogo, produto, categoria, busca, sobre, privacidade e termos.
- Link externo seguro em `/go/HS-XXXXX`, com rastreamento de clique.
- H&S Studio: dashboard, produtos, categorias, banners, upload de mídia, importação JSON, analytics, configurações, convites e papéis de usuários.
- Supabase: banco, Auth, Storage, migrations, RLS e funções SQL.
- Papéis: `owner`, `admin`, `editor`, `analyst`.
- Analytics first-party anônimo, sem IP bruto permanente.
- Retenção de eventos brutos por 90 dias.
- Testes unitários, E2E e CI.
- Segurança: RLS, validação Zod, headers, URLs externas HTTP/HTTPS e service role somente no servidor.

## Instalação

1. Extraia o ZIP.
2. Crie um projeto no Supabase.
3. Copie `.env.example` para `.env.local` e preencha as chaves.
4. Execute as migrations da pasta `supabase/migrations` na ordem numérica, usando Supabase CLI ou SQL Editor.
5. Instale e rode:

```bash
npm install
npm run dev
```

6. Acesse `/studio/login`, crie a primeira conta e depois abra `/studio/bootstrap` para tornar essa conta `owner`.
7. Adicione produtos e mantenha `SITE_INDEXING_ENABLED=false` até a homologação final.

## Verificação

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

## Deploy

Conecte o repositório à Vercel, adicione as mesmas variáveis de ambiente e publique somente depois de concluir `docs/DEPLOY.md`.

## Observação sobre versões

Este pacote foi criado sem pesquisa web disponível. As versões foram fixadas em uma linha estável conhecida e podem precisar de atualização controlada quando o projeto for instalado. Não atualize tudo automaticamente antes do primeiro build bem-sucedido.
