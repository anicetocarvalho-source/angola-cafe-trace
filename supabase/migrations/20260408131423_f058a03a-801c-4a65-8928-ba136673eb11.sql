CREATE POLICY "Processadores can update lote estado for split/blend"
ON public.lotes
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'processador'::app_role)
  OR has_role(auth.uid(), 'cooperativa'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'processador'::app_role)
  OR has_role(auth.uid(), 'cooperativa'::app_role)
);