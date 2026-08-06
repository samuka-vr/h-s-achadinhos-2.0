# Atualização — H&S Studio profissional

Esta atualização melhora apenas o painel administrativo e o processo de organização do catálogo. O site público, o Supabase e as variáveis de ambiente continuam na mesma estrutura.

## Principais alterações

- Classificação inteligente baseada em nome, descrição e categoria informada.
- Categorias específicas são consolidadas em categorias principais reutilizáveis.
- Novas categorias só são sugeridas quando nenhuma categoria principal existente é adequada.
- Prévia da importação mostra a categoria recebida e a categoria final.
- Ação para reorganizar os produtos já cadastrados e desativar categorias antigas que ficarem vazias.
- Seleção individual ou de todos os produtos.
- Ações em massa: publicar, rascunhar, arquivar, destacar, alterar categoria e excluir.
- Clique na imagem do produto para enviar ou alterar a capa sem abrir o editor completo.
- Lista de produtos realmente responsiva no celular, sem tabela cortada lateralmente.
- Menu administrativo dividido em Início, Catálogo, Relatórios e Administração.
- Barra superior com contexto da página, nível de acesso e atalhos.

## Categorias principais reconhecidas

- Casa & Cozinha
- Limpeza & Organização
- Eletrônicos
- Decoração & Iluminação
- Beleza & Bem-estar
- Automotivo
- Pet
- Moda & Acessórios
- Bebê & Infantil
- Esporte & Lazer
- Ferramentas & Utilidades

O sistema não cria uma categoria diferente para cada pequeno nome recebido. Produtos sem correspondência segura ficam marcados para revisão.

## Banco de dados

Nenhuma migration nova é necessária.
