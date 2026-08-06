begin;
insert into public.site_settings(id) values(1) on conflict(id) do nothing;
insert into public.categories(name,slug,description,sort_order) values
('Casa & Cozinha','casa-cozinha','Utilidades para deixar a rotina mais prática.',10),
('Limpeza & Organização','limpeza-organizacao','Produtos para limpar, conservar e organizar.',20),
('Eletrônicos','eletronicos','Acessórios, dispositivos e soluções tecnológicas.',30),
('Beleza & Bem-estar','beleza-bem-estar','Cuidados pessoais, beleza e conforto.',40),
('Automotivo','automotivo','Acessórios e utilidades para veículos.',50),
('Pet','pet','Produtos úteis para cães, gatos e outros pets.',60),
('Moda & Lazer','moda-lazer','Itens de estilo, acessórios e lazer.',70),
('Bebê & Infantil','bebe-infantil','Produtos para bebês, crianças e responsáveis.',80),
('Ferramentas & Utilidades','ferramentas-utilidades','Ferramentas e soluções para o dia a dia.',90)
on conflict(slug) do nothing;
commit;
