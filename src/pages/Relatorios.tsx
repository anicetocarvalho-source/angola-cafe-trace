import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  FileText, TrendingUp, Package, MapPin, Award, Download, Shield, Ship,
  CheckCircle, XCircle, AlertTriangle, Loader2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

interface ReportData {
  // Production
  lotesPorProvincia: { name: string; lotes: number; volume: number }[];
  producaoPorTipo: { name: string; value: number }[];
  producaoMensal: { mes: string; volume: number }[];
  // Quality
  qualidadePorEstado: { name: string; value: number }[];
  certificacoes: { tipo: string; total: number; aprovadas: number }[];
  qualidadeMedia: number;
  totalAnalises: number;
  // EUDR
  eudrStats: { total: number; compliant: number; pending: number; nonCompliant: number };
  eudrPorProvincia: { name: string; conforme: number; naoConforme: number }[];
  // Exports
  exportacoesPorDestino: { name: string; value: number }[];
  exportacoesPorMes: { mes: string; volume: number; lotes: number }[];
  exportacoesStats: { total: number; preparacao: number; embarque: number; exportado: number };
  // General
  totalLotes: number;
  lotesAprovados: number;
  totalExploracoes: number;
  totalVolume: number;
}

const COLORS = [
  "hsl(30, 65%, 45%)", "hsl(30, 45%, 60%)", "hsl(30, 35%, 75%)",
  "hsl(150, 40%, 45%)", "hsl(200, 40%, 50%)", "hsl(0, 50%, 55%)",
  "hsl(45, 60%, 50%)", "hsl(270, 40%, 55%)"
];

const Relatorios = () => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [
        { data: lotes },
        { data: exploracoes },
        { data: exportacoes },
        { data: qualidade },
        { data: colheitas },
        { data: entities },
      ] = await Promise.all([
        supabase.from("lotes").select("*"),
        supabase.from("exploracoes").select("id, provincia, status"),
        supabase.from("exportacoes").select("*"),
        supabase.from("qualidade_certificacoes").select("*"),
        supabase.from("colheitas").select("id, volume_cereja_kg, data_inicio, parcelas(exploracoes(provincia))"),
        supabase.from("entities").select("id, nome_legal, eudr_compliant, provincia"),
      ]);

      // --- Production by province ---
      const provMap: Record<string, { lotes: number; volume: number }> = {};
      colheitas?.forEach((c: any) => {
        const prov = c.parcelas?.exploracoes?.provincia;
        if (prov) {
          if (!provMap[prov]) provMap[prov] = { lotes: 0, volume: 0 };
          provMap[prov].lotes++;
          provMap[prov].volume += Number(c.volume_cereja_kg || 0);
        }
      });
      const lotesPorProvincia = Object.entries(provMap)
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.volume - a.volume);

      // --- Production by type ---
      const tipoMap: Record<string, number> = {};
      lotes?.forEach(l => { tipoMap[l.tipo] = (tipoMap[l.tipo] || 0) + 1; });
      const producaoPorTipo = Object.entries(tipoMap).map(([name, value]) => ({ name, value }));

      // --- Monthly production ---
      const mesMap: Record<string, number> = {};
      colheitas?.forEach((c: any) => {
        const m = c.data_inicio?.substring(0, 7);
        if (m) mesMap[m] = (mesMap[m] || 0) + Number(c.volume_cereja_kg || 0);
      });
      const producaoMensal = Object.entries(mesMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([mes, volume]) => ({ mes: mes.substring(5) + "/" + mes.substring(2, 4), volume: Math.round(volume) }));

      // --- Quality by status ---
      const estadoMap: Record<string, number> = {};
      lotes?.forEach(l => { if (l.estado) estadoMap[l.estado] = (estadoMap[l.estado] || 0) + 1; });
      const qualidadePorEstado = Object.entries(estadoMap).map(([name, value]) => ({ name, value }));

      // --- Certifications ---
      const certMap: Record<string, { total: number; aprovadas: number }> = {};
      qualidade?.forEach((q: any) => {
        if (!certMap[q.tipo]) certMap[q.tipo] = { total: 0, aprovadas: 0 };
        certMap[q.tipo].total++;
        if (q.resultado === "aprovado" || q.resultado === "conforme") certMap[q.tipo].aprovadas++;
      });
      const certificacoes = Object.entries(certMap).map(([tipo, v]) => ({ tipo, ...v }));

      const scores = lotes?.filter(l => l.classificacao_sensorial).map(l => l.classificacao_sensorial!) || [];
      const qualidadeMedia = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;

      // --- EUDR ---
      const eudrCompliant = entities?.filter(e => e.eudr_compliant === true).length || 0;
      const eudrNon = entities?.filter(e => e.eudr_compliant === false).length || 0;
      const eudrPending = (entities?.length || 0) - eudrCompliant - eudrNon;

      const eudrProvMap: Record<string, { conforme: number; naoConforme: number }> = {};
      entities?.forEach((e: any) => {
        const p = e.provincia || "Sem província";
        if (!eudrProvMap[p]) eudrProvMap[p] = { conforme: 0, naoConforme: 0 };
        if (e.eudr_compliant) eudrProvMap[p].conforme++;
        else eudrProvMap[p].naoConforme++;
      });
      const eudrPorProvincia = Object.entries(eudrProvMap).map(([name, v]) => ({ name, ...v }));

      // --- Exports ---
      const destMap: Record<string, number> = {};
      exportacoes?.forEach(e => {
        const d = e.pais_destino || "N/D";
        destMap[d] = (destMap[d] || 0) + 1;
      });
      const exportacoesPorDestino = Object.entries(destMap).map(([name, value]) => ({ name, value }));

      const expMesMap: Record<string, { volume: number; lotes: number }> = {};
      exportacoes?.forEach(e => {
        const m = e.data_embarque?.substring(0, 7);
        if (m) {
          if (!expMesMap[m]) expMesMap[m] = { volume: 0, lotes: 0 };
          expMesMap[m].lotes += e.lote_ids?.length || 0;
          expMesMap[m].volume++;
        }
      });
      const exportacoesPorMes = Object.entries(expMesMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([mes, v]) => ({ mes: mes.substring(5) + "/" + mes.substring(2, 4), ...v }));

      const expStatuses = { total: exportacoes?.length || 0, preparacao: 0, embarque: 0, exportado: 0 };
      exportacoes?.forEach(e => {
        if (e.status === "preparacao") expStatuses.preparacao++;
        else if (e.status === "embarque") expStatuses.embarque++;
        else if (e.status === "exportado") expStatuses.exportado++;
      });

      const totalVol = lotes?.reduce((s, l) => s + Number(l.volume_kg || 0), 0) || 0;

      setData({
        lotesPorProvincia,
        producaoPorTipo,
        producaoMensal,
        qualidadePorEstado,
        certificacoes,
        qualidadeMedia,
        totalAnalises: qualidade?.length || 0,
        eudrStats: { total: entities?.length || 0, compliant: eudrCompliant, pending: eudrPending, nonCompliant: eudrNon },
        eudrPorProvincia,
        exportacoesPorDestino,
        exportacoesPorMes,
        exportacoesStats: expStatuses,
        totalLotes: lotes?.length || 0,
        lotesAprovados: lotes?.filter(l => l.estado === "aprovado").length || 0,
        totalExploracoes: exploracoes?.length || 0,
        totalVolume: Math.round(totalVol),
      });
    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = (type: string) => {
    if (!data) return;
    const doc = new jsPDF();
    const brown: [number, number, number] = [139, 90, 43];
    const now = new Date().toLocaleDateString("pt-PT");

    doc.setFontSize(16);
    doc.setTextColor(...brown);

    switch (type) {
      case "producao": {
        doc.text("Relatorio de Producao por Regiao", 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`INCA Coffee Trace | ${now}`, 14, 28);

        autoTable(doc, {
          startY: 35,
          head: [["Provincia", "Colheitas", "Volume (kg)"]],
          body: data.lotesPorProvincia.map(p => [p.name, p.lotes.toString(), p.volume.toLocaleString("pt-AO")]),
          theme: "grid",
          headStyles: { fillColor: brown },
        });

        const y1 = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setTextColor(...brown);
        doc.text("Distribuicao por Tipo de Cafe", 14, y1);
        autoTable(doc, {
          startY: y1 + 5,
          head: [["Tipo", "Quantidade"]],
          body: data.producaoPorTipo.map(t => [t.name, t.value.toString()]),
          theme: "grid",
          headStyles: { fillColor: brown },
        });

        const y2 = (doc as any).lastAutoTable.finalY + 10;
        doc.text("Resumo", 14, y2);
        autoTable(doc, {
          startY: y2 + 5,
          head: [["Metrica", "Valor"]],
          body: [
            ["Total Lotes", data.totalLotes.toString()],
            ["Volume Total (kg)", data.totalVolume.toLocaleString("pt-AO")],
            ["Exploracoes Registadas", data.totalExploracoes.toString()],
          ],
          theme: "grid",
          headStyles: { fillColor: brown },
        });
        break;
      }
      case "qualidade": {
        doc.text("Relatorio de Qualidade e Certificacoes", 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`INCA Coffee Trace | ${now}`, 14, 28);

        autoTable(doc, {
          startY: 35,
          head: [["Estado", "Quantidade"]],
          body: data.qualidadePorEstado.map(q => [q.name, q.value.toString()]),
          theme: "grid",
          headStyles: { fillColor: brown },
        });

        const yc = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setTextColor(...brown);
        doc.text("Certificacoes", 14, yc);
        autoTable(doc, {
          startY: yc + 5,
          head: [["Tipo", "Total Analises", "Aprovadas", "Taxa (%)"]],
          body: data.certificacoes.map(c => [
            c.tipo, c.total.toString(), c.aprovadas.toString(),
            c.total > 0 ? Math.round((c.aprovadas / c.total) * 100).toString() + "%" : "—",
          ]),
          theme: "grid",
          headStyles: { fillColor: brown },
        });

        const yq = (doc as any).lastAutoTable.finalY + 10;
        doc.text("Resumo de Qualidade", 14, yq);
        autoTable(doc, {
          startY: yq + 5,
          head: [["Metrica", "Valor"]],
          body: [
            ["Classificacao Media SCA", data.qualidadeMedia.toString()],
            ["Total Analises/Certificacoes", data.totalAnalises.toString()],
            ["Lotes Aprovados", data.lotesAprovados.toString()],
          ],
          theme: "grid",
          headStyles: { fillColor: brown },
        });
        break;
      }
      case "eudr": {
        doc.text("Relatorio de Conformidade EUDR", 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`INCA Coffee Trace | ${now}`, 14, 28);

        autoTable(doc, {
          startY: 35,
          head: [["Indicador", "Valor"]],
          body: [
            ["Total Entidades", data.eudrStats.total.toString()],
            ["Conformes", data.eudrStats.compliant.toString()],
            ["Pendentes", data.eudrStats.pending.toString()],
            ["Nao Conformes", data.eudrStats.nonCompliant.toString()],
            ["Taxa Conformidade", data.eudrStats.total > 0 ? Math.round((data.eudrStats.compliant / data.eudrStats.total) * 100) + "%" : "—"],
          ],
          theme: "grid",
          headStyles: { fillColor: brown },
        });

        const ye = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setTextColor(...brown);
        doc.text("Conformidade por Provincia", 14, ye);
        autoTable(doc, {
          startY: ye + 5,
          head: [["Provincia", "Conformes", "Nao Conformes"]],
          body: data.eudrPorProvincia.map(p => [p.name, p.conforme.toString(), p.naoConforme.toString()]),
          theme: "grid",
          headStyles: { fillColor: brown },
        });
        break;
      }
      case "exportacao": {
        doc.text("Relatorio de Exportacoes", 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`INCA Coffee Trace | ${now}`, 14, 28);

        autoTable(doc, {
          startY: 35,
          head: [["Indicador", "Valor"]],
          body: [
            ["Total Exportacoes", data.exportacoesStats.total.toString()],
            ["Em Preparacao", data.exportacoesStats.preparacao.toString()],
            ["Em Embarque", data.exportacoesStats.embarque.toString()],
            ["Exportadas", data.exportacoesStats.exportado.toString()],
          ],
          theme: "grid",
          headStyles: { fillColor: brown },
        });

        if (data.exportacoesPorDestino.length > 0) {
          const yd = (doc as any).lastAutoTable.finalY + 10;
          doc.setFontSize(12);
          doc.setTextColor(...brown);
          doc.text("Destinos de Exportacao", 14, yd);
          autoTable(doc, {
            startY: yd + 5,
            head: [["Pais", "Exportacoes"]],
            body: data.exportacoesPorDestino.map(d => [d.name, d.value.toString()]),
            theme: "grid",
            headStyles: { fillColor: brown },
          });
        }
        break;
      }
    }

    doc.save(`relatorio-${type}-${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF exportado com sucesso!");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const eudrRate = data.eudrStats.total > 0 ? Math.round((data.eudrStats.compliant / data.eudrStats.total) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios & Análises</h1>
          <p className="text-muted-foreground">Dados estatísticos do sistema INCA Coffee Trace</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Lotes</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalLotes}</div>
              <p className="text-xs text-muted-foreground">{data.totalVolume.toLocaleString("pt-AO")} kg total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lotes Aprovados</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.lotesAprovados}</div>
              <p className="text-xs text-muted-foreground">
                {data.totalLotes > 0 ? Math.round((data.lotesAprovados / data.totalLotes) * 100) : 0}% aprovação
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conformidade EUDR</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eudrRate}%</div>
              <p className="text-xs text-muted-foreground">{data.eudrStats.compliant}/{data.eudrStats.total} entidades</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exportações</CardTitle>
              <Ship className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.exportacoesStats.total}</div>
              <p className="text-xs text-muted-foreground">{data.exportacoesStats.exportado} concluídas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="producao">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="producao"><MapPin className="h-4 w-4 mr-1 hidden sm:inline" />Produção</TabsTrigger>
            <TabsTrigger value="qualidade"><Award className="h-4 w-4 mr-1 hidden sm:inline" />Qualidade</TabsTrigger>
            <TabsTrigger value="eudr"><Shield className="h-4 w-4 mr-1 hidden sm:inline" />EUDR</TabsTrigger>
            <TabsTrigger value="exportacao"><Ship className="h-4 w-4 mr-1 hidden sm:inline" />Exportações</TabsTrigger>
          </TabsList>

          {/* PRODUÇÃO */}
          <TabsContent value="producao" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => exportPDF("producao")}>
                <Download className="h-4 w-4 mr-2" />Exportar PDF
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Produção por Província</CardTitle>
                  <CardDescription>Volume de colheita (kg)</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.lotesPorProvincia.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.lotesPorProvincia}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                        <YAxis />
                        <Tooltip formatter={(v: number) => v.toLocaleString("pt-AO") + " kg"} />
                        <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <EmptyChart />}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Tipo de Café</CardTitle>
                  <CardDescription>Distribuição de lotes</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.producaoPorTipo.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={data.producaoPorTipo} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {data.producaoPorTipo.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <EmptyChart />}
                </CardContent>
              </Card>
            </div>
            {data.producaoMensal.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Evolução Mensal da Produção</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data.producaoMensal}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(v: number) => v.toLocaleString("pt-AO") + " kg"} />
                      <Line type="monotone" dataKey="volume" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* QUALIDADE */}
          <TabsContent value="qualidade" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => exportPDF("qualidade")}>
                <Download className="h-4 w-4 mr-2" />Exportar PDF
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Lotes por Estado</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.qualidadePorEstado.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={data.qualidadePorEstado} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {data.qualidadePorEstado.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <EmptyChart />}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Qualidade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Classificação Média SCA</span>
                    <Badge variant="secondary" className="text-lg">{data.qualidadeMedia || "—"}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Total de Análises</span>
                    <Badge variant="outline">{data.totalAnalises}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Lotes Aprovados</span>
                    <Badge>{data.lotesAprovados}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
            {data.certificacoes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Certificações</CardTitle>
                  <CardDescription>Análises por tipo e taxa de aprovação</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Aprovadas</TableHead>
                        <TableHead>Taxa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.certificacoes.map(c => (
                        <TableRow key={c.tipo}>
                          <TableCell className="font-medium">{c.tipo}</TableCell>
                          <TableCell>{c.total}</TableCell>
                          <TableCell>{c.aprovadas}</TableCell>
                          <TableCell>
                            <Badge variant={c.total > 0 && (c.aprovadas / c.total) >= 0.8 ? "default" : "secondary"}>
                              {c.total > 0 ? Math.round((c.aprovadas / c.total) * 100) + "%" : "—"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* EUDR */}
          <TabsContent value="eudr" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => exportPDF("eudr")}>
                <Download className="h-4 w-4 mr-2" />Exportar PDF
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{data.eudrStats.compliant}</div>
                  <p className="text-sm text-muted-foreground">Conformes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <div className="text-2xl font-bold">{data.eudrStats.pending}</div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold">{data.eudrStats.nonCompliant}</div>
                  <p className="text-sm text-muted-foreground">Não Conformes</p>
                </CardContent>
              </Card>
            </div>
            {data.eudrPorProvincia.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Conformidade EUDR por Província</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.eudrPorProvincia}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="conforme" name="Conformes" fill="hsl(150, 40%, 45%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="naoConforme" name="Não Conformes" fill="hsl(0, 50%, 55%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* EXPORTAÇÕES */}
          <TabsContent value="exportacao" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => exportPDF("exportacao")}>
                <Download className="h-4 w-4 mr-2" />Exportar PDF
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-2xl font-bold">{data.exportacoesStats.preparacao}</div>
                  <p className="text-sm text-muted-foreground">Em Preparação</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Ship className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{data.exportacoesStats.embarque}</div>
                  <p className="text-sm text-muted-foreground">Em Embarque</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{data.exportacoesStats.exportado}</div>
                  <p className="text-sm text-muted-foreground">Exportadas</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Destinos de Exportação</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.exportacoesPorDestino.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={data.exportacoesPorDestino} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {data.exportacoesPorDestino.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <EmptyChart />}
                </CardContent>
              </Card>
              {data.exportacoesPorMes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Exportações por Mês</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.exportacoesPorMes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="volume" name="Exportações" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

const EmptyChart = () => (
  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
    <div className="text-center">
      <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>Sem dados disponíveis</p>
    </div>
  </div>
);

export default Relatorios;
