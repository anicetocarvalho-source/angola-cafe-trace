-- Normalize legacy TEMP- lot references
UPDATE public.lotes
SET referencia_lote = public.generate_lot_reference()
WHERE referencia_lote LIKE 'TEMP-%';

-- Update trigger function to also catch TEMP- prefixes
CREATE OR REPLACE FUNCTION public.auto_generate_lot_codes()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.referencia_lote IS NULL
     OR NEW.referencia_lote LIKE 'PLACEHOLDER-%'
     OR NEW.referencia_lote LIKE 'TEMP-%' THEN
    NEW.referencia_lote := public.generate_lot_reference();
  END IF;
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code := public.generate_qr_code();
  END IF;
  RETURN NEW;
END;
$function$;