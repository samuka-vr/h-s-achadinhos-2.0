# Segurança

- Nunca exponha `SUPABASE_SERVICE_ROLE_KEY`.
- Não use chave service role em componentes client.
- Mantenha RLS ativado.
- O primeiro owner só pode ser criado enquanto `user_roles` está vazio.
- Revise membros com papel owner regularmente.
- Restrinja tipos e tamanho de upload.
- URLs de saída aceitam somente HTTP e HTTPS.
- O site permanece sem indexação até duas aprovações: variável de ambiente e configuração do Studio.
- Ative MFA no Supabase para contas administrativas quando disponível no seu plano.
- Configure proteção de branch e revisão obrigatória no GitHub.
