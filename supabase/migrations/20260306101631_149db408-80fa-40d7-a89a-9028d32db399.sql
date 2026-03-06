-- 1. Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 2. Add audit triggers for critical tables that don't have them yet
CREATE OR REPLACE TRIGGER audit_lotes_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.lotes
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

CREATE OR REPLACE TRIGGER audit_exportacoes_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.exportacoes
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

CREATE OR REPLACE TRIGGER audit_transformacoes_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.transformacoes
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

CREATE OR REPLACE TRIGGER audit_armazenamento_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.armazenamento
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

CREATE OR REPLACE TRIGGER audit_comercializacao_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.comercializacao
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

CREATE OR REPLACE TRIGGER audit_logistica_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.logistica
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

CREATE OR REPLACE TRIGGER audit_qualidade_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.qualidade_certificacoes
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

CREATE OR REPLACE TRIGGER audit_exploracoes_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.exploracoes
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

CREATE OR REPLACE TRIGGER audit_secagens_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.secagens
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();