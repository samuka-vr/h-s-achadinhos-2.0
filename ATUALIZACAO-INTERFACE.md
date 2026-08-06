# Atualização completa da interface — H&S Achadinhos

Esta versão mantém a arquitetura Next.js + Supabase e refaz a experiência pública e administrativa.

## Principais mudanças

- Nova interface pública responsiva, com busca em destaque, categorias, banners, cards e páginas de produto.
- Novo H&S Studio responsivo, com menu móvel, dashboard, filtros e ações rápidas.
- Importação em massa pelo formato de texto numerado usado pelo projeto.
- Criação automática de categorias ausentes durante a importação.
- Detecção e bloqueio opcional de links duplicados.
- Prévia da importação e relatório final.
- Gestão aprimorada de produtos, categorias, banners, equipe, analytics e personalização.
- Personalização de cores e conteúdo da página inicial pelo painel.
- Melhorias no fluxo de criação de conta e confirmação de e-mail.

## Formato aceito pelo importador

```text
1. Nome do produto
Categoria: Cozinha
Descrição: Breve descrição do produto.
Valor: R$19,90 - R$29,90
Link: https://s.shopee.com.br/...
```

O importador aceita até 200 produtos por operação.

## Atualização no Codespaces

1. Faça backup do projeto atual.
2. Substitua os arquivos pelos desta versão.
3. Preserve o seu `.env.local`.
4. Execute:

```bash
npm install
npm run verify
```

5. Depois envie ao GitHub:

```bash
git add .
git commit -m "Refazer interfaces e importação do H&S Achadinhos"
git push origin main
```

A Vercel iniciará um novo deploy automaticamente.
