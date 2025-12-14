-- Adicionar campo display_order na tabela instructors
-- Este campo permite ordenar os instrutores no site e no painel admin

-- Adicionar a coluna display_order
ALTER TABLE instructors 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Inicializar a ordem baseada na data de criação (mais antigos primeiro)
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1 as new_order
  FROM instructors
)
UPDATE instructors 
SET display_order = ordered.new_order
FROM ordered 
WHERE instructors.id = ordered.id;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_instructors_display_order ON instructors(display_order);

-- Comentário
COMMENT ON COLUMN instructors.display_order IS 'Ordem de exibição dos instrutores (drag and drop)';

