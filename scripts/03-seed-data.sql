-- Inserir administrador padrão
INSERT INTO admins (email, password)
VALUES ('admin@superbeast.com', '$2a$10$XdR0Z9RdKJQH/Zs.8X6kXuHnGfYKTxpMl7vNYJkYXXeZy7RNmgmNK') -- senha: admin123
ON CONFLICT (email) DO NOTHING;

-- Inserir estatísticas iniciais
INSERT INTO statistics (monthly_views, total_messages, active_plans, gallery_images)
VALUES (0, 0, 0, 0)
ON CONFLICT DO NOTHING;

-- Inserir planos iniciais
INSERT INTO plans (name, price, description, duration, participants, features, active)
VALUES 
  ('Essencial', '€299', 'Perfeito para equipas pequenas que querem experimentar o Team Building', '4 horas', '15-25 pessoas', 
   '["Até 10 participantes", "4 horas de atividades", "Facilitador certificado", "Material de apoio", "Relatório básico"]', true),
  ('Profissional', '€599', 'Ideal para empresas que buscam resultados consistentes', '6 horas', '25-50 pessoas', 
   '["Até 25 participantes", "8 horas de atividades", "2 facilitadores certificados", "Material personalizado", "Relatório detalhado", "Follow-up de 30 dias", "Certificados de participação"]', true),
  ('Premium', '€999', 'Experiência completa para transformação organizacional', '8 horas', '50+ pessoas', 
   '["Até 50 participantes", "2 dias de atividades", "Equipe completa de facilitadores", "Programa personalizado", "Relatório executivo", "Follow-up de 90 dias", "Coaching individual", "Suporte contínuo"]', true)
ON CONFLICT DO NOTHING;
