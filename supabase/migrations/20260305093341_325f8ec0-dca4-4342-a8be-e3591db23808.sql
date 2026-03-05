
ALTER TABLE public.sim_mercado DROP CONSTRAINT sim_mercado_indicador_check;
ALTER TABLE public.sim_mercado ADD CONSTRAINT sim_mercado_indicador_check 
  CHECK (indicador = ANY (ARRAY['preco_spot','preco_futuro','preco_interno','estoque','consumo','exportacao','producao','qualidade_sca']));
