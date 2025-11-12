-- Funções e triggers para manter as estatísticas atualizadas

-- Função para atualizar o contador de mensagens
CREATE OR REPLACE FUNCTION update_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE statistics SET total_messages = total_messages + 1, last_updated = NOW();
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE statistics SET total_messages = total_messages - 1, last_updated = NOW();
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar o contador de planos ativos
CREATE OR REPLACE FUNCTION update_active_plans()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE statistics SET active_plans = (SELECT COUNT(*) FROM plans WHERE active = TRUE), last_updated = NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar o contador de imagens da galeria
CREATE OR REPLACE FUNCTION update_gallery_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE statistics SET gallery_images = gallery_images + 1, last_updated = NOW();
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE statistics SET gallery_images = gallery_images - 1, last_updated = NOW();
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para mensagens
CREATE TRIGGER message_inserted_trigger
AFTER INSERT ON contact_messages
FOR EACH ROW
EXECUTE FUNCTION update_message_count();

CREATE TRIGGER message_deleted_trigger
AFTER DELETE ON contact_messages
FOR EACH ROW
EXECUTE FUNCTION update_message_count();

-- Triggers para planos
CREATE TRIGGER plan_inserted_trigger
AFTER INSERT OR UPDATE OR DELETE ON plans
FOR EACH ROW
EXECUTE FUNCTION update_active_plans();

-- Triggers para galeria
CREATE TRIGGER gallery_inserted_trigger
AFTER INSERT ON gallery_images
FOR EACH ROW
EXECUTE FUNCTION update_gallery_count();

CREATE TRIGGER gallery_deleted_trigger
AFTER DELETE ON gallery_images
FOR EACH ROW
EXECUTE FUNCTION update_gallery_count();
