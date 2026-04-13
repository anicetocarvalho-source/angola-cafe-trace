import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface SCAScores {
  sca_aroma: number | null;
  sca_acidez: number | null;
  sca_corpo: number | null;
  sca_sabor: number | null;
  sca_aftertaste: number | null;
  sca_uniformidade: number | null;
  sca_balance: number | null;
  sca_clean_cup: number | null;
  sca_sweetness: number | null;
  sca_overall: number | null;
}

interface ExportData {
  referencia_lote: string;
  tipo: string;
  volume_kg: number;
  estado: string;
  scores: SCAScores;
  totalScore: number | null;
  notas_sensoriais: string | null;
  avaliador?: string | null;
  password?: string | null;
  origem?: {
    exploracao: string;
    parcela: string;
    municipio: string;
    provincia: string;
    campanha: string;
  } | null;
}

const getClassification = (score: number) => {
  if (score >= 90) return "Outstanding";
  if (score >= 85) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  return "Below Standard";
};

const attributes = [
  { key: "sca_aroma", label: "Aroma" },
  { key: "sca_acidez", label: "Acidez" },
  { key: "sca_corpo", label: "Corpo" },
  { key: "sca_sabor", label: "Sabor" },
  { key: "sca_aftertaste", label: "Aftertaste" },
  { key: "sca_uniformidade", label: "Uniformidade" },
  { key: "sca_balance", label: "Balance" },
  { key: "sca_clean_cup", label: "Clean Cup" },
  { key: "sca_sweetness", label: "Sweetness" },
  { key: "sca_overall", label: "Overall" },
];

function drawRadarChart(doc: jsPDF, scores: SCAScores, cx: number, cy: number, radius: number) {
  const values = attributes.map((a) => (scores as any)[a.key] ?? 0);
  const n = values.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2; // start from top

  // Draw concentric grid circles and radial lines
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  for (let ring = 2; ring <= 10; ring += 2) {
    const r = (ring / 10) * radius;
    // Draw polygon for grid
    const pts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep;
      pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
    for (let i = 0; i < pts.length; i++) {
      const next = (i + 1) % pts.length;
      doc.line(pts[i][0], pts[i][1], pts[next][0], pts[next][1]);
    }
  }

  // Radial lines
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    doc.line(cx, cy, cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
  }

  // Labels
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    const lx = cx + (radius + 8) * Math.cos(angle);
    const ly = cy + (radius + 8) * Math.sin(angle);
    const label = attributes[i].label;
    const textWidth = doc.getTextWidth(label);
    // Adjust alignment based on position
    let alignX = lx - textWidth / 2;
    if (Math.cos(angle) < -0.3) alignX = lx - textWidth;
    else if (Math.cos(angle) > 0.3) alignX = lx;
    else alignX = lx - textWidth / 2;
    doc.text(label, alignX, ly + 2);
  }

  // Scale tick labels
  doc.setFontSize(5);
  doc.setTextColor(150, 150, 150);
  for (let ring = 2; ring <= 10; ring += 2) {
    const r = (ring / 10) * radius;
    doc.text(String(ring), cx + 1, cy - r + 3);
  }

  // Draw data polygon with fill
  const dataPoints: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    const r = (values[i] / 10) * radius;
    dataPoints.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }

  // Fill
  doc.setFillColor(34, 139, 34);
  doc.setGState(new (doc as any).GState({ opacity: 0.2 }));
  const fillPath = dataPoints.map(([x, y], i) => (i === 0 ? `${x} ${y} m` : `${x} ${y} l`)).join(" ");
  // Use lines approach instead
  doc.setGState(new (doc as any).GState({ opacity: 0.15 }));
  // Manual polygon fill using triangle fan
  for (let i = 0; i < dataPoints.length; i++) {
    const next = (i + 1) % dataPoints.length;
    doc.triangle(
      cx, cy,
      dataPoints[i][0], dataPoints[i][1],
      dataPoints[next][0], dataPoints[next][1],
      "F"
    );
  }

  // Stroke outline
  doc.setGState(new (doc as any).GState({ opacity: 1 }));
  doc.setDrawColor(34, 139, 34);
  doc.setLineWidth(0.8);
  for (let i = 0; i < dataPoints.length; i++) {
    const next = (i + 1) % dataPoints.length;
    doc.line(dataPoints[i][0], dataPoints[i][1], dataPoints[next][0], dataPoints[next][1]);
  }

  // Data points
  doc.setFillColor(34, 139, 34);
  for (const [x, y] of dataPoints) {
    doc.circle(x, y, 1.2, "F");
  }
}

export function exportScaPdf(data: ExportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(39, 55, 40);
  doc.rect(0, 0, pageWidth, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Perfil Sensorial SCA", 14, 16);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Lote: ${data.referencia_lote}`, 14, 24);
  doc.text(`Data: ${new Date().toLocaleDateString("pt-PT")}`, pageWidth - 14, 24, { align: "right" });

  // Lot info section
  let y = 42;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Informação do Lote", 14, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const info: [string, string][] = [
    ["Referência", data.referencia_lote],
    ["Tipo", data.tipo],
    ["Volume", `${data.volume_kg} kg`],
    ["Estado", data.estado],
  ];
  if (data.avaliador) {
    info.push(["Avaliador", data.avaliador]);
  }
  if (data.origem) {
    info.push(
      ["Exploração", data.origem.exploracao],
      ["Parcela", data.origem.parcela],
      ["Localização", `${data.origem.municipio}, ${data.origem.provincia}`],
      ["Campanha", data.origem.campanha],
    );
  }

  for (const [label, value] of info) {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, 50, y);
    y += 5;
  }

  // Total score badge
  if (data.totalScore) {
    y += 4;
    const classification = getClassification(data.totalScore);
    doc.setFillColor(39, 55, 40);
    doc.roundedRect(14, y - 5, 60, 12, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Pontuação Total: ${data.totalScore.toFixed(1)}`, 18, y + 2);
    doc.setFontSize(9);
    doc.text(classification, 18, y + 7);
    y += 16;
  }

  // Radar chart
  y += 6;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Gráfico Radar", 14, y);
  y += 4;

  const chartCenterX = pageWidth / 2;
  const chartCenterY = y + 45;
  drawRadarChart(doc, data.scores, chartCenterX, chartCenterY, 38);

  // Scores table
  y = chartCenterY + 55;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Pontuações Detalhadas", 14, y);
  y += 4;

  const tableData = attributes.map((a) => {
    const val = (data.scores as any)[a.key];
    const score = val != null ? val.toFixed(1) : "—";
    const bar = val != null ? "█".repeat(Math.round(val)) + "░".repeat(10 - Math.round(val)) : "—";
    return [a.label, score, bar];
  });

  autoTable(doc, {
    startY: y,
    head: [["Atributo", "Pontuação", ""]],
    body: tableData,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [39, 55, 40], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 240] },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: "auto", fontStyle: "bold", textColor: [34, 139, 34] },
    },
  });

  // Sensory notes
  if (data.notas_sensoriais) {
    const finalY = (doc as any).lastAutoTable.finalY + 8;
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Notas Sensoriais", 14, finalY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(data.notas_sensoriais, 14, finalY + 6, { maxWidth: pageWidth - 28 });
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(200, 200, 200);
  doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("Angola Café Trace — Sistema de Rastreabilidade", 14, pageHeight - 7);
  doc.text(`Gerado em ${new Date().toLocaleString("pt-PT")}`, pageWidth - 14, pageHeight - 7, { align: "right" });

  // Password protection
  if (data.password) {
    doc.save(`SCA_${data.referencia_lote}.pdf`, { encryption: { userPassword: data.password, ownerPassword: data.password, userPermissions: ["print"] } });
  } else {
    doc.save(`SCA_${data.referencia_lote}.pdf`);
  }
}
