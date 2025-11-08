import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

interface Exploracao {
  id: string;
  designacao: string;
  provincia: string;
  municipio: string;
  latitude: number;
  longitude: number;
  area_ha: number;
  status: string;
}

const Mapa = () => {
  const [exploracoes, setExploracoes] = useState<Exploracao[]>([]);
  const [filteredExploracoes, setFilteredExploracoes] = useState<Exploracao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    provincia: "",
    status: "",
    search: "",
  });
  useEffect(() => {
    fetchExploracoes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [exploracoes, filters]);

  const fetchExploracoes = async () => {
    try {
      const { data, error } = await supabase
        .from("exploracoes")
        .select("*")
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (error) throw error;

      setExploracoes(data || []);
    } catch (error) {
      console.error("Error fetching exploracoes:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...exploracoes];

    if (filters.provincia) {
      filtered = filtered.filter((e) => e.provincia === filters.provincia);
    }

    if (filters.status) {
      filtered = filtered.filter((e) => e.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.designacao.toLowerCase().includes(searchLower) ||
          e.municipio.toLowerCase().includes(searchLower)
      );
    }

    setFilteredExploracoes(filtered);
  };

  const provincias = Array.from(new Set(exploracoes.map((e) => e.provincia))).sort();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "validado":
        return "bg-secondary";
      case "pendente":
        return "bg-accent";
      case "indeferido":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mapa de Explorações</h1>
          <p className="text-muted-foreground">Visualização geográfica das explorações de café em Angola</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtre as explorações no mapa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Pesquisar</Label>
                <Input
                  placeholder="Nome ou município..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Província</Label>
                <Select
                  value={filters.provincia}
                  onValueChange={(value) => setFilters({ ...filters, provincia: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as províncias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {provincias.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="validado">Validado</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="indeferido">Indeferido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Map Placeholder */}
          <Card className="lg:col-span-2">
            <CardContent className="p-0">
              <div className="h-[600px] w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <div className="text-center p-8">
                  <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Mapa Interactivo</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualização geográfica das explorações em Angola<br />
                    (Funcionalidade de mapa será activada em breve)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* List */}
          <Card>
            <CardHeader>
              <CardTitle>Explorações</CardTitle>
              <CardDescription>
                {filteredExploracoes.length} de {exploracoes.length} explorações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[520px] overflow-y-auto">
                {loading ? (
                  <p className="text-sm text-muted-foreground">A carregar...</p>
                ) : filteredExploracoes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma exploração encontrada com os filtros aplicados.
                  </p>
                ) : (
                  filteredExploracoes.map((exploracao) => (
                    <div
                      key={exploracao.id}
                      className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{exploracao.designacao}</h4>
                          <p className="text-xs text-muted-foreground">
                            {exploracao.municipio}, {exploracao.provincia}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {exploracao.area_ha} ha
                          </p>
                        </div>
                        <Badge className={getStatusColor(exploracao.status)} variant="outline">
                          {exploracao.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Mapa;
