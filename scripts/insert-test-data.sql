-- Script para inserir dados de teste
-- Execute este script no SQL Editor do Supabase

-- Inserir mensagens de teste
INSERT INTO contact_messages (name, email, company, phone, participants, subject, message, read) VALUES
('João Silva', 'joao@email.com', 'Empresa ABC', '+244 123 456 789', 5, 'Consulta sobre pacotes', 'Gostaria de saber mais sobre os pacotes disponíveis.', false),
('Maria Santos', 'maria@email.com', 'Empresa XYZ', '+244 987 654 321', 10, 'Evento corporativo', 'Precisamos de um evento para nossa equipa.', false),
('Pedro Costa', 'pedro@email.com', 'Startup Tech', '+244 555 123 456', 3, 'Programa personalizado', 'Queremos um programa específico para nossa startup.', true);

-- Inserir planos de teste
INSERT INTO plans (name, description, price, duration, features, active) VALUES
('Pacote Essencial', 'Programa básico de fitness e desenvolvimento pessoal', 50000, '8 semanas', '["Treinos básicos", "Acompanhamento semanal", "Material de apoio"]', true),
('Pacote Profissional', 'Programa avançado com coaching personalizado', 75000, '12 semanas', '["Treinos avançados", "Coaching 1-on-1", "Avaliação física", "Plano nutricional"]', true),
('Pacote Premium', 'Programa completo com eventos exclusivos', 100000, '14 semanas', '["Tudo do Profissional", "Eventos exclusivos", "Certificação", "Suporte 24/7"]', true),
('Pacote Corporativo', 'Programa para empresas e equipas', 150000, '16 semanas', '["Programa personalizado", "Workshops", "Avaliação de equipa", "Relatórios mensais"]', true);

-- Inserir imagens de teste na galeria
INSERT INTO gallery_images (title, description, image_url, category) VALUES
('Treino em Equipa', 'Sessão de treino em grupo no ginásio', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', 'treinos'),
('Workshop Motivacional', 'Workshop sobre desenvolvimento pessoal', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', 'eventos'),
('Avaliação Física', 'Processo de avaliação física inicial', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', 'avaliacoes'),
('Evento Corporativo', 'Evento de equipa em empresa', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', 'eventos');

-- Verificar se a tabela statistics existe e tem dados
INSERT INTO statistics (monthly_views, last_updated) 
VALUES (1250, NOW())
ON CONFLICT (id) DO UPDATE SET 
  monthly_views = 1250,
  last_updated = NOW();

-- Verificar dados inseridos
SELECT 'Dados de teste inseridos com sucesso!' as status;
