import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, FileCheck } from "lucide-react";

interface Lote {
  id: string;
  referencia_lote: string;
}

const NovaAnalise = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [formData, setFormData] = useState({
    lote_id: "",
    tipo: "",
    laboratorio: "",
    resultado: "",
    parametros: "",
    certificado_pdf_url: "",
  });
  const [certificacoesSelecionadas, setCertificacoesSelecionadas] = useState<string[]>([]);

  const tiposAnalise = [
    { value: "fisico", label: "Análise Física" },
    { value: "sensorial", label: "Análise Sensorial" },
    { value: "quimico", label: "Análise Química" },
    { value: "residuos", label: "Análise de Resíduos" },
  ];

  const certificacoesDisponiveis = [
    "UTZ Certified",
    "Rainforest Alliance",
    "FairTrade",
    "Orgânico",
    "DOC Angola",
    "EUDR Ready",
  ];

  useEffect(() => {
    fetchLotes();
  }, []);

  const fetchLotes = async () => {
    try {
      const { data, error } = await supabase
        .from("lotes")
        .select("id, referencia_lote")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLotes(data || []);
    } catch (error) {
      console.error("Error fetching lotes:", error);
      toast.error("Erro ao carregar lotes");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse parametros JSON if provided
      let parametrosJson = null;
      if (formData.parametros.trim()) {
        try {
          parametrosJson = JSON.parse(formData.parametros);
        } catch {
          toast.error("Parâmetros devem estar em formato JSON válido");
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase.from("qualidade_certificacoes").insert({
        lote_id: formData.lote_id,
        tipo: formData.tipo,
        laboratorio: formData.laboratorio || null,
        resultado: formData.resultado,
        parametros: parametrosJson,
        certificacoes_emitidas: certificacoesSelecionadas,
        certificado_pdf_url: formData.certificado_pdf_url || null,
      });

      if (error) throw error;

      toast.success("Análise registada com sucesso!");
      navigate("/qualidade");
    } catch (error: any) {
      console.error("Error creating analysis:", error);
      toast.error(error.message || "Erro ao registar análise");
    } finally {
      setLoading(false);
    }
  };

  const handleCertificacaoToggle = (cert: string) => {
    setCertificacoesSelecionadas((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/qualidade")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <FileCheck className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Nova Análise de Qualidade</h1>
              <p className="text-muted-foreground">Registar análise laboratorial e certificações</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados da Análise</CardTitle>
            <CardDescription>Preencha as informações da análise de qualidade</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="lote_id">Lote *</Label>
                <Select
                  value={formData.lote_id}
                  onValueChange={(value) => setFormData({ ...formData, lote_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o lote" />
                  </SelectTrigger>
                  <SelectContent>
                    {lotes.map((lote) => (
                      <SelectItem key={lote.id} value={lote.id}>
                        {lote.referencia_lote}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Análise *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposAnalise.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="laboratorio">Laboratório</Label>
                <Input
                  id="laboratorio"
                  value={formData.laboratorio}
                  onChange={(e) => setFormData({ ...formData, laboratorio: e.target.value })}
                  placeholder="Nome do laboratório"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resultado">Resultado *</Label>
                <Select
                  value={formData.resultado}
                  onValueChange={(value) => setFormData({ ...formData, resultado: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o resultado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="reprovado">Reprovado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parametros">Parâmetros (JSON)</Label>
                <Textarea
                  id="parametros"
                  value={formData.parametros}
                  onChange={(e) => setFormData({ ...formData, parametros: e.target.value })}
                  placeholder='{"humidade": 12, "defeitos": 5, "pontuacao": 85}'
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Formato JSON com os parâmetros medidos
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificado_pdf_url">URL do Certificado PDF</Label>
                <Input
                  id="certificado_pdf_url"
                  type="url"
                  value={formData.certificado_pdf_url}
                  onChange={(e) =>
                    setFormData({ ...formData, certificado_pdf_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-3">
                <Label>Certificações Emitidas</Label>
                <div className="grid grid-cols-2 gap-3">
                  {certificacoesDisponiveis.map((cert) => (
                    <div key={cert} className="flex items-center space-x-2">
                      <Checkbox
                        id={cert}
                        checked={certificacoesSelecionadas.includes(cert)}
                        onCheckedChange={() => handleCertificacaoToggle(cert)}
                      />
                      <Label
                        htmlFor={cert}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {cert}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "A registar..." : "Registar Análise"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/qualidade")}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NovaAnalise;
