import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Parcela {
  id: string;
  codigo_parcela: string;
  exploracoes: {
    designacao: string;
  };
}

const tiposManutencao = [
  { value: "tratamento", label: "Tratamento Fitossanitário" },
  { value: "fertilizacao", label: "Fertilização" },
  { value: "poda", label: "Poda" },
  { value: "capina", label: "Capina/Monda" },
  { value: "irrigacao", label: "Irrigação" },
  { value: "outro", label: "Outro" },
];

const NovaManutencao = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [loadingParcelas, setLoadingParcelas] = useState(true);
  
  const [formData, setFormData] = useState({
    parcela_id: "",
    data_execucao: new Date().toISOString().split("T")[0],
    tipo: "",
    descricao: "",
    quantidade_produto: "",
    unidade_produto: "",
    area_aplicada_ha: "",
    responsavel: "",
    custo_estimado: "",
    observacoes: "",
  });

  const [produtos, setProdutos] = useState<string[]>([]);
  const [novoProduto, setNovoProduto] = useState("");

  useEffect(() => {
    fetchParcelas();
    if (isEditMode && id) {
      fetchManutencao(id);
    }
  }, [id, isEditMode]);

  const fetchManutencao = async (manutencaoId: string) => {
    try {
      const { data, error } = await supabase
        .from("manutencao_agricola")
        .select("*")
        .eq("id", manutencaoId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          parcela_id: data.parcela_id,
          data_execucao: data.data_execucao,
          tipo: data.tipo,
          descricao: data.descricao || "",
          quantidade_produto: data.quantidade_produto?.toString() || "",
          unidade_produto: data.unidade_produto || "",
          area_aplicada_ha: data.area_aplicada_ha?.toString() || "",
          responsavel: data.responsavel || "",
          custo_estimado: data.custo_estimado?.toString() || "",
          observacoes: data.observacoes || "",
        });
        setProdutos(data.produtos_utilizados || []);
      }
    } catch (error) {
      console.error("Error fetching manutencao:", error);
      toast.error("Erro ao carregar registo de manutenção");
      navigate("/manutencao");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchParcelas = async () => {
    try {
      const { data, error } = await supabase
        .from("parcelas")
        .select(`
          id,
          codigo_parcela,
          exploracoes (
            designacao
          )
        `)
        .order("codigo_parcela");

      if (error) throw error;
      setParcelas((data as unknown as Parcela[]) || []);
    } catch (error) {
      console.error("Error fetching parcelas:", error);
      toast.error("Erro ao carregar parcelas");
    } finally {
      setLoadingParcelas(false);
    }
  };

  const handleAddProduto = () => {
    if (novoProduto.trim() && !produtos.includes(novoProduto.trim())) {
      setProdutos([...produtos, novoProduto.trim()]);
      setNovoProduto("");
    }
  };

  const handleRemoveProduto = (produto: string) => {
    setProdutos(produtos.filter(p => p !== produto));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.parcela_id || !formData.tipo || !formData.data_execucao) {
      toast.error("Por favor preencha os campos obrigatórios");
      return;
    }

    setLoading(true);

    const payload = {
      parcela_id: formData.parcela_id,
      data_execucao: formData.data_execucao,
      tipo: formData.tipo,
      descricao: formData.descricao || null,
      produtos_utilizados: produtos.length > 0 ? produtos : null,
      quantidade_produto: formData.quantidade_produto ? parseFloat(formData.quantidade_produto) : null,
      unidade_produto: formData.unidade_produto || null,
      area_aplicada_ha: formData.area_aplicada_ha ? parseFloat(formData.area_aplicada_ha) : null,
      responsavel: formData.responsavel || null,
      custo_estimado: formData.custo_estimado ? parseFloat(formData.custo_estimado) : null,
      observacoes: formData.observacoes || null,
    };

    try {
      if (isEditMode && id) {
        const { error } = await supabase
          .from("manutencao_agricola")
          .update(payload)
          .eq("id", id);

        if (error) throw error;
        toast.success("Manutenção actualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("manutencao_agricola")
          .insert(payload);

        if (error) throw error;
        toast.success("Manutenção registada com sucesso!");
      }
      
      navigate("/manutencao");
    } catch (error) {
      console.error("Error saving manutencao:", error);
      toast.error(isEditMode ? "Erro ao actualizar manutenção" : "Erro ao registar manutenção");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/manutencao")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditMode ? "Editar Manutenção" : "Nova Manutenção"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode 
                ? "Actualizar registo de manutenção agrícola"
                : "Registar tratamento, fertilização ou prática cultural"
              }
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informação Base</CardTitle>
                <CardDescription>Dados principais da manutenção</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="parcela_id">Parcela *</Label>
                  <Select
                    value={formData.parcela_id}
                    onValueChange={(value) => setFormData({ ...formData, parcela_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingParcelas ? "A carregar..." : "Seleccione uma parcela"} />
                    </SelectTrigger>
                    <SelectContent>
                      {parcelas.map((parcela) => (
                        <SelectItem key={parcela.id} value={parcela.id}>
                          {parcela.codigo_parcela} - {parcela.exploracoes?.designacao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Manutenção *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposManutencao.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_execucao">Data de Execução *</Label>
                  <Input
                    id="data_execucao"
                    type="date"
                    value={formData.data_execucao}
                    onChange={(e) => setFormData({ ...formData, data_execucao: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva a actividade realizada..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    placeholder="Nome do responsável pela execução"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produtos e Aplicação</CardTitle>
                <CardDescription>Detalhes de produtos utilizados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Produtos Utilizados</Label>
                  <div className="flex gap-2">
                    <Input
                      value={novoProduto}
                      onChange={(e) => setNovoProduto(e.target.value)}
                      placeholder="Nome do produto"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddProduto();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={handleAddProduto}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {produtos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {produtos.map((produto, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {produto}
                          <button
                            type="button"
                            onClick={() => handleRemoveProduto(produto)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantidade_produto">Quantidade</Label>
                    <Input
                      id="quantidade_produto"
                      type="number"
                      step="0.01"
                      value={formData.quantidade_produto}
                      onChange={(e) => setFormData({ ...formData, quantidade_produto: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unidade_produto">Unidade</Label>
                    <Select
                      value={formData.unidade_produto}
                      onValueChange={(value) => setFormData({ ...formData, unidade_produto: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                        <SelectItem value="l">Litros (L)</SelectItem>
                        <SelectItem value="g">Gramas (g)</SelectItem>
                        <SelectItem value="ml">Mililitros (mL)</SelectItem>
                        <SelectItem value="un">Unidades</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area_aplicada_ha">Área Aplicada (ha)</Label>
                  <Input
                    id="area_aplicada_ha"
                    type="number"
                    step="0.01"
                    value={formData.area_aplicada_ha}
                    onChange={(e) => setFormData({ ...formData, area_aplicada_ha: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custo_estimado">Custo Estimado (AOA)</Label>
                  <Input
                    id="custo_estimado"
                    type="number"
                    step="0.01"
                    value={formData.custo_estimado}
                    onChange={(e) => setFormData({ ...formData, custo_estimado: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Notas adicionais..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => navigate("/manutencao")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Actualizar Manutenção" : "Registar Manutenção"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NovaManutencao;
