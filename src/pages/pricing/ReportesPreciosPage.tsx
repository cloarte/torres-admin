import { useState } from "react";
import { DownloadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

/* ── Mock data ── */
const priceHistory = [
  { fecha: "Jul 2025", precio: 11.00 },
  { fecha: "Ago 2025", precio: 11.00 },
  { fecha: "Sep 2025", precio: 11.50 },
  { fecha: "Oct 2025", precio: 11.50 },
  { fecha: "Nov 2025", precio: 11.80 },
  { fecha: "Dic 2025", precio: 11.80 },
  { fecha: "Ene 2026", precio: 12.50 },
];

const priceHistoryTable = [
  { fecha: "01/01/2026", conIgv: 12.50, sinIgv: 10.59, modificadoPor: "María García", motivo: "Actualización anual" },
  { fecha: "01/07/2025", conIgv: 11.80, sinIgv: 10.00, modificadoPor: "María García", motivo: "Ajuste inflación" },
  { fecha: "01/01/2025", conIgv: 11.00, sinIgv: 9.32, modificadoPor: "Carlos Ríos", motivo: "Precio inicial" },
];

const cotizacionesChart = [
  { mes: "Ago", emitidas: 8, convertidas: 4 },
  { mes: "Sep", emitidas: 10, convertidas: 6 },
  { mes: "Oct", emitidas: 9, convertidas: 5 },
  { mes: "Nov", emitidas: 11, convertidas: 7 },
  { mes: "Dic", emitidas: 14, convertidas: 8 },
  { mes: "Ene", emitidas: 12, convertidas: 7 },
];

const cotizacionesTable = [
  { numero: "COT-2026-0001", cliente: "Supermercados Plaza", valor: 1850, estado: "ACTIVA", emitida: "05/01/2026", vence: "20/01/2026" },
  { numero: "COT-2026-0002", cliente: "Bodega San Martín", valor: 480, estado: "ACTIVA", emitida: "08/01/2026", vence: "23/01/2026" },
  { numero: "COT-2025-0089", cliente: "Distribuidora Lima", valor: 3200, estado: "CONVERTIDA", emitida: "15/12/2025", vence: "30/12/2025" },
  { numero: "COT-2025-0088", cliente: "Restaurant El Buen", valor: 950, estado: "VENCIDA", emitida: "10/12/2025", vence: "25/12/2025" },
];

const estadoBadge: Record<string, string> = {
  ACTIVA: "bg-success/10 text-success border border-success/20",
  VENCIDA: "bg-destructive/10 text-destructive border border-destructive/20",
  CONVERTIDA: "bg-primary/10 text-primary border border-primary/20",
  ANULADA: "bg-muted text-muted-foreground",
};

const fmt = (n: number) => `S/ ${n.toLocaleString("es-PE")}`;

const kpis = [
  { label: "Emitidas este mes", value: "12", color: "text-foreground" },
  { label: "Convertidas", value: "7 (58.3%)", color: "text-success" },
  { label: "Vencidas sin convertir", value: "3", color: "text-destructive" },
  { label: "Valor convertido", value: "S/ 28,400", color: "text-primary" },
];

export default function ReportesPreciosPage() {
  const [canalFilter, setCanalFilter] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reportes de Precios</h2>
          <p className="text-sm text-muted-foreground">Análisis de precios y cotizaciones</p>
        </div>
        <Button variant="outline" className="gap-2">
          <DownloadCloud className="h-4 w-4" /> Exportar Excel
        </Button>
      </div>

      <Tabs defaultValue="variacion">
        <TabsList>
          <TabsTrigger value="variacion">Variación de Precios</TabsTrigger>
          <TabsTrigger value="cotizaciones">Cotizaciones</TabsTrigger>
        </TabsList>

        {/* TAB 1 */}
        <TabsContent value="variacion" className="space-y-6">
          <div className="flex items-center gap-3">
            <Select value={canalFilter} onValueChange={setCanalFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Canal" /></SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">Todos los canales</SelectItem>
                <SelectItem value="Corporativo">Corporativo</SelectItem>
                <SelectItem value="Moderno">Moderno</SelectItem>
                <SelectItem value="Tradicional">Tradicional</SelectItem>
                <SelectItem value="Directa">Directa</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Buscar producto..." className="w-64" />
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="fecha" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `S/${v}`} />
                <Tooltip formatter={(v: number) => [`S/ ${v.toFixed(2)}`, "Precio c/IGV"]} />
                <Line type="monotone" dataKey="precio" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fecha</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Precio c/IGV</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Sin IGV</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Modificado por</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceHistoryTable.map((r, i) => (
                  <TableRow key={i} className="hover:bg-muted/30">
                    <TableCell>{r.fecha}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums font-semibold">{fmt(r.conIgv)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-muted-foreground">{fmt(r.sinIgv)}</TableCell>
                    <TableCell>{r.modificadoPor}</TableCell>
                    <TableCell className="text-muted-foreground">{r.motivo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* TAB 2 */}
        <TabsContent value="cotizaciones" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {kpis.map((k, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">{k.label}</p>
                <p className={`text-2xl font-bold font-mono tabular-nums ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cotizacionesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Legend />
                <Bar dataKey="emitidas" name="Emitidas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="convertidas" name="Convertidas" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">N° Cotización</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Valor</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Emitida</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cotizacionesTable.map((r, i) => (
                  <TableRow key={i} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-sm">{r.numero}</TableCell>
                    <TableCell>{r.cliente}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums font-semibold">{fmt(r.valor)}</TableCell>
                    <TableCell><Badge className={estadoBadge[r.estado] || ""}>{r.estado}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.emitida}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.vence}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
