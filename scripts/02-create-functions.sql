-- =====================================================
-- THE BOX Functional Training - Funções e Triggers
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar o contador de mensagens
CREATE OR REPLACE FUNCTION update_message_count()
RETURNS TRIGGER AS $$
DECLARE
    stats_id UUID;
BEGIN
    SELECT id INTO stats_id FROM statistics LIMIT 1;
    
    IF stats_id IS NULL THEN
        INSERT INTO statistics (total_messages, last_updated)
        VALUES (CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END, NOW())
        RETURNING id INTO stats_id;
    ELSE
  IF TG_OP = 'INSERT' THEN
            UPDATE statistics 
            SET total_messages = total_messages + 1, last_updated = NOW()
            WHERE id = stats_id;
  ELSIF TG_OP = 'DELETE' THEN
            UPDATE statistics 
            SET total_messages = GREATEST(0, total_messages - 1), last_updated = NOW()
            WHERE id = stats_id;
        END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar o contador de modalidades ativas
CREATE OR REPLACE FUNCTION update_active_modalities()
RETURNS TRIGGER AS $$
DECLARE
    stats_id UUID;
BEGIN
    SELECT id INTO stats_id FROM statistics LIMIT 1;
    
    IF stats_id IS NULL THEN
        INSERT INTO statistics (active_modalities, last_updated)
        VALUES ((SELECT COUNT(*) FROM modalities WHERE active = TRUE), NOW())
        RETURNING id INTO stats_id;
    ELSE
        UPDATE statistics 
        SET active_modalities = (SELECT COUNT(*) FROM modalities WHERE active = TRUE), 
            last_updated = NOW()
        WHERE id = stats_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar o contador de instrutores ativos
CREATE OR REPLACE FUNCTION update_active_instructors()
RETURNS TRIGGER AS $$
DECLARE
    stats_id UUID;
BEGIN
    SELECT id INTO stats_id FROM statistics LIMIT 1;
    
    IF stats_id IS NULL THEN
        INSERT INTO statistics (active_instructors, last_updated)
        VALUES ((SELECT COUNT(*) FROM instructors WHERE active = TRUE), NOW())
        RETURNING id INTO stats_id;
    ELSE
        UPDATE statistics 
        SET active_instructors = (SELECT COUNT(*) FROM instructors WHERE active = TRUE), 
            last_updated = NOW()
        WHERE id = stats_id;
    END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar o contador de filiais ativas
CREATE OR REPLACE FUNCTION update_active_branches()
RETURNS TRIGGER AS $$
DECLARE
    stats_id UUID;
BEGIN
    SELECT id INTO stats_id FROM statistics LIMIT 1;
    
    IF stats_id IS NULL THEN
        INSERT INTO statistics (active_branches, last_updated)
        VALUES ((SELECT COUNT(*) FROM branches WHERE active = TRUE), NOW())
        RETURNING id INTO stats_id;
    ELSE
        UPDATE statistics 
        SET active_branches = (SELECT COUNT(*) FROM branches WHERE active = TRUE), 
            last_updated = NOW()
        WHERE id = stats_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar o contador de imagens da galeria
CREATE OR REPLACE FUNCTION update_gallery_count()
RETURNS TRIGGER AS $$
DECLARE
    stats_id UUID;
BEGIN
    SELECT id INTO stats_id FROM statistics LIMIT 1;
    
    IF stats_id IS NULL THEN
        INSERT INTO statistics (gallery_images, last_updated)
        VALUES (CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END, NOW())
        RETURNING id INTO stats_id;
    ELSE
  IF TG_OP = 'INSERT' THEN
            UPDATE statistics 
            SET gallery_images = gallery_images + 1, last_updated = NOW()
            WHERE id = stats_id;
  ELSIF TG_OP = 'DELETE' THEN
            UPDATE statistics 
            SET gallery_images = GREATEST(0, gallery_images - 1), last_updated = NOW()
            WHERE id = stats_id;
        END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at 
    BEFORE UPDATE ON site_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modalities_updated_at 
    BEFORE UPDATE ON modalities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instructors_updated_at 
    BEFORE UPDATE ON instructors 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at 
    BEFORE UPDATE ON branches 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_images_updated_at 
    BEFORE UPDATE ON gallery_images 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_messages_updated_at 
    BEFORE UPDATE ON contact_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers para mensagens
DROP TRIGGER IF EXISTS message_inserted_trigger ON contact_messages;
CREATE TRIGGER message_inserted_trigger
AFTER INSERT ON contact_messages
FOR EACH ROW
EXECUTE FUNCTION update_message_count();

DROP TRIGGER IF EXISTS message_deleted_trigger ON contact_messages;
CREATE TRIGGER message_deleted_trigger
AFTER DELETE ON contact_messages
FOR EACH ROW
EXECUTE FUNCTION update_message_count();

-- Triggers para modalidades
DROP TRIGGER IF EXISTS modality_inserted_trigger ON modalities;
CREATE TRIGGER modality_inserted_trigger
AFTER INSERT OR UPDATE OR DELETE ON modalities
FOR EACH ROW
EXECUTE FUNCTION update_active_modalities();

-- Triggers para instrutores
DROP TRIGGER IF EXISTS instructor_inserted_trigger ON instructors;
CREATE TRIGGER instructor_inserted_trigger
AFTER INSERT OR UPDATE OR DELETE ON instructors
FOR EACH ROW
EXECUTE FUNCTION update_active_instructors();

-- Triggers para filiais
DROP TRIGGER IF EXISTS branch_inserted_trigger ON branches;
CREATE TRIGGER branch_inserted_trigger
AFTER INSERT OR UPDATE OR DELETE ON branches
FOR EACH ROW
EXECUTE FUNCTION update_active_branches();

-- Triggers para galeria
DROP TRIGGER IF EXISTS gallery_inserted_trigger ON gallery_images;
CREATE TRIGGER gallery_inserted_trigger
AFTER INSERT ON gallery_images
FOR EACH ROW
EXECUTE FUNCTION update_gallery_count();

DROP TRIGGER IF EXISTS gallery_deleted_trigger ON gallery_images;
CREATE TRIGGER gallery_deleted_trigger
AFTER DELETE ON gallery_images
FOR EACH ROW
EXECUTE FUNCTION update_gallery_count();
