
-- Add SCA cupping profile columns to lotes table
ALTER TABLE public.lotes
  ADD COLUMN IF NOT EXISTS sca_aroma numeric,
  ADD COLUMN IF NOT EXISTS sca_acidez numeric,
  ADD COLUMN IF NOT EXISTS sca_corpo numeric,
  ADD COLUMN IF NOT EXISTS sca_sabor numeric,
  ADD COLUMN IF NOT EXISTS sca_aftertaste numeric,
  ADD COLUMN IF NOT EXISTS sca_uniformidade numeric,
  ADD COLUMN IF NOT EXISTS sca_balance numeric,
  ADD COLUMN IF NOT EXISTS sca_clean_cup numeric,
  ADD COLUMN IF NOT EXISTS sca_sweetness numeric,
  ADD COLUMN IF NOT EXISTS sca_overall numeric,
  ADD COLUMN IF NOT EXISTS notas_sensoriais text;

-- Add comments for documentation
COMMENT ON COLUMN public.lotes.sca_aroma IS 'SCA Cupping: Aroma score (0-10)';
COMMENT ON COLUMN public.lotes.sca_acidez IS 'SCA Cupping: Acidity score (0-10)';
COMMENT ON COLUMN public.lotes.sca_corpo IS 'SCA Cupping: Body score (0-10)';
COMMENT ON COLUMN public.lotes.sca_sabor IS 'SCA Cupping: Flavor score (0-10)';
COMMENT ON COLUMN public.lotes.sca_aftertaste IS 'SCA Cupping: Aftertaste score (0-10)';
COMMENT ON COLUMN public.lotes.sca_uniformidade IS 'SCA Cupping: Uniformity score (0-10)';
COMMENT ON COLUMN public.lotes.sca_balance IS 'SCA Cupping: Balance score (0-10)';
COMMENT ON COLUMN public.lotes.sca_clean_cup IS 'SCA Cupping: Clean Cup score (0-10)';
COMMENT ON COLUMN public.lotes.sca_sweetness IS 'SCA Cupping: Sweetness score (0-10)';
COMMENT ON COLUMN public.lotes.sca_overall IS 'SCA Cupping: Overall score (0-10)';
COMMENT ON COLUMN public.lotes.notas_sensoriais IS 'Tasting notes / flavor descriptors';
