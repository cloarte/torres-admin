import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, flexRender, createColumnHelper,
} from "@tanstack/react-table";
import { Search, Pencil, Clock, DownloadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";

/* ── Types ── */
interface PriceRow {
  sku: string;
  nombre: string;
  linea: string;
  sinIgv: number;
  igv: number;
  conIgv: number;
  vigente: string;
}

interface HistoryEntry {
  fecha: string;
  conIgv: number;
  sinIgv: number;
  modificadoPor: string;
  motivo: string;
  vigente?: boolean;
}

/* ── Mock data by canal ── */
const mockByCanal: Record<string, PriceRow[]> = {
  Corporativo: [
    { sku: "PAX-001", nombre: "Panetón Clásico 900g", linea: "Panetones", sinIgv: 9.32, igv: 1.68, conIgv: 11.00, vigente: "01/01/2026" },
    { sku: "PAX-002", nombre: "Panetón Chocolate 900g", linea: "Panetones", sinIgv: 10.59, igv: 1.91, conIgv: 12.50, vigente: "01/01/2026" },
    { sku: "MOL-001", nombre: "Pan Molde Blanco 500g", linea: "Pan de Molde", sinIgv: 2.97, igv: 0.53, conIgv: 3.50, vigente: "15/01/2026" },
    { sku: "EMP-001", nombre: "Empanada Pollo x12", linea: "Empanadas", sinIgv: 7.63, igv: 1.37, conIgv: 9.00, vigente: "01/01/2026" },
  ],
  Moderno: [
    { sku: "PAX-001", nombre: "Panetón Clásico 900g", linea: "Panetones", sinIgv: 9.75, igv: 1.75, conIgv: 11.50, vigente: "01/01/2026" },
    { sku: "PAX-002", nombre: "Panetón Chocolate 900g", linea: "Panetones", sinIgv: 11.02, igv: 1.98, conIgv: 13.00, vigente: "01/01/2026" },
    { sku: "MOL-001", nombre: "Pan Molde Blanco 500g", linea: "Pan de Molde", sinIgv: 3.18, igv: 0.57, conIgv: 3.75, vigente: "15/01/2026" },
    { sku: "EMP-001", nombre: "Empanada Pollo x12", linea: "Empanadas", sinIgv: 8.05, igv: 1.45, conIgv: 9.50, vigente: "01/01/2026" },
  ],
  Tradicional: [
    { sku: "PAX-001", nombre: "Panetón Clásico 900g", linea: "Panetones", sinIgv: 10.59, igv: 1.91, conIgv: 12.50, vigente: "01/01/2026" },
    { sku: "PAX-002", nombre: "Panetón Chocolate 900g", linea: "Panetones", sinIgv: 11.86, igv: 2.14, conIgv: 14.00, vigente: "01/01/2026" },
    { sku: "MOL-001", nombre: "Pan Molde Blanco 500g", linea: "Pan de Molde", sinIgv: 3.39, igv: 0.61, conIgv: 4.00, vigente: "15/01/2026" },
    { sku: "EMP-001", nombre: "Empanada Pollo x12", linea: "Empanadas", sinIgv: 8.47, igv: 1.53, conIgv: 10.00, vigente: "01/01/2026" },
  ],
  Directa: [
    { sku: "PAX-001", nombre: "Panetón Clásico 900g", linea: "Panetones", sinIgv: 10.17, igv: 1.83, conIgv: 12.00, vigente: "01/01/2026" },
    { sku: "PAX-002", nombre: "Panetón Chocolate 900g", linea: "Panetones", sinIgv: 11.44, igv: 2.06, conIgv: 13.50, vigente: "01/01/2026" },
    { sku: "MOL-001", nombre: "Pan Molde Blanco 500g", linea: "Pan de Molde", sinIgv: 3.18, igv: 0.57, conIgv: 3.75, vigente: "15/01/2026" },
    { sku: "EMP-001", nombre: "Empanada Pollo x12", linea: "Empanadas", sinIgv: 8.05, igv: 1.45, conIgv: 9.50, vigente: "01/01/2026" },
  ],
};

const mockHistory: HistoryEntry[] = [
  { fecha: "01/01/2026", conIgv: 12.50, sinIgv: 10.59, modificadoPor: "María García", motivo: "Actualización anual de precios", vigente: true },
  { fecha: "01/07/2025", conIgv: 11.80, sinIgv: 10.00, modificadoPor: "María García", motivo: "Ajuste por inflación semestral" },
  { fecha: "01/01/2025", conIgv: 11.00, sinIgv: 9.32, modificadoPor: "Carlos Ríos", motivo: "Precio inicial" },
];

const canales = ["Corporativo", "Moderno", "Tradicional", "Directa"];

const col = createColumnHelper<PriceRow>();

const fmt = (n: number) => `S/ ${n.toFixed(2)}`;

export default function PreciosCanalPage() {
  const [canal, setCanal] = useState("Tradicional");
  const [search, setSearch] = useState("");
  const [editRow, setEditRow] = useState<PriceRow | null>(null);
  const [historyRow, setHistoryRow] = useState<PriceRow | null>(null);

  // Edit sheet state
  const [newPrice, setNewPrice] = useState("");
  const [motivo, setMotivo] = useState("");

  const data = useMemo(() => {
    const rows = mockByCanal[canal] || [];
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(r => r.sku.toLowerCase().includes(q) || r.nombre.toLowerCase().includes(q));
  }, [canal, search]);

  const columns = useMemo(() => [
    col.accessor("sku", { header: "SKU", cell: i => <span className="font-mono text-sm">{i.getValue()}</span> }),
    col.accessor("nombre", { header: "Nombre" }),
    col.accessor("linea", {
      header: "Línea",
      cell: i => <Badge variant="secondary" className="bg-muted text-muted-foreground">{i.getValue()}</Badge>,
    }),
    col.accessor("sinIgv", {
      header: () => <span className="block text-right">Precio s/IGV</span>,
      cell: i => <span className="block text-right font-mono tabular-nums">{fmt(i.getValue())}</span>,
    }),
    col.accessor("igv", {
      header: () => <span className="block text-right">IGV</span>,
      cell: i => <span className="block text-right font-mono tabular-nums text-muted-foreground">{fmt(i.getValue())}</span>,
    }),
    col.accessor("conIgv", {
      header: () => <span className="block text-right">Precio c/IGV</span>,
      cell: i => <span className="block text-right font-mono tabular-nums font-semibold">{fmt(i.getValue())}</span>,
    }),
    col.accessor("vigente", {
      header: "Vigente desde",
      cell: i => <span className="text-sm text-muted-foreground">{i.getValue()}</span>,
    }),
    col.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditRow(info.row.original); setNewPrice(String(info.row.original.conIgv)); setMotivo(""); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setHistoryRow(info.row.original)}>
            <Clock className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const newSinIgv = newPrice ? (parseFloat(newPrice) / 1.18) : 0;
  const newIgvCalc = newPrice ? (parseFloat(newPrice) - newSinIgv) : 0;
  const priceChanged = editRow ? parseFloat(newPrice) !== editRow.conIgv : false;
  const canSave = priceChanged && motivo.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Precios por Canal</h2>
        <p className="text-sm text-muted-foreground">Gestión de precios por canal de venta</p>
      </div>

      {/* Canal Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          {canales.map(c => (
            <button
              key={c}
              onClick={() => setCanal(c)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                canal === c
                  ? "border-accent text-foreground font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center border-b border-border px-4 py-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por SKU o nombre..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="bg-muted/50 hover:bg-muted/50">
                {hg.headers.map(h => (
                  <TableHead key={h.id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">No se encontraron productos.</TableCell></TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">{data.length} producto{data.length !== 1 ? "s" : ""}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
            <span className="text-sm text-muted-foreground">Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</Button>
          </div>
        </div>
      </div>

      {/* Edit Price Sheet */}
      <Sheet open={!!editRow} onOpenChange={o => { if (!o) setEditRow(null); }}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Modificar Precio</SheetTitle>
            <SheetDescription>{editRow?.sku} — {editRow?.nombre}</SheetDescription>
          </SheetHeader>
          {editRow && (
            <div className="mt-6 space-y-6">
              {/* Current price card */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Precio actual</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Con IGV:</span> <span className="font-mono font-semibold">{fmt(editRow.conIgv)}</span></div>
                  <div><span className="text-muted-foreground">Sin IGV:</span> <span className="font-mono">{fmt(editRow.sinIgv)}</span></div>
                  <div><span className="text-muted-foreground">IGV:</span> <span className="font-mono">{fmt(editRow.igv)}</span></div>
                  <div><span className="text-muted-foreground">Vigente desde:</span> <span>{editRow.vigente}</span></div>
                </div>
              </div>

              {/* New price */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Precio con IGV incluido *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  className="font-mono"
                />
                {newPrice && parseFloat(newPrice) > 0 && (
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Sin IGV: <span className="font-mono font-medium text-foreground">{fmt(newSinIgv)}</span></span>
                    <span>IGV (18%): <span className="font-mono font-medium text-foreground">{fmt(newIgvCalc)}</span></span>
                  </div>
                )}
              </div>

              {/* Motivo */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo *</label>
                <Textarea rows={3} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Razón del cambio de precio..." />
                <p className="text-xs text-muted-foreground">Este motivo quedará registrado en el historial de auditoría.</p>
              </div>
            </div>
          )}
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setEditRow(null)}>Cancelar</Button>
            <Button disabled={!canSave} onClick={() => { toast.success("Precio actualizado. El precio anterior ha sido versionado."); setEditRow(null); }}>
              Guardar Precio
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* History Sheet */}
      <Sheet open={!!historyRow} onOpenChange={o => { if (!o) setHistoryRow(null); }}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Historial de Precios</SheetTitle>
            <SheetDescription>{historyRow?.sku} — {historyRow?.nombre} — Canal: {canal}</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
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
                {mockHistory.map((h, i) => (
                  <TableRow key={i} className="hover:bg-muted/30">
                    <TableCell className="text-sm">{h.fecha}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      <span className="font-semibold">{fmt(h.conIgv)}</span>
                      {h.vigente && <Badge className="ml-2 bg-success/10 text-success border border-success/20 text-[10px]">VIGENTE</Badge>}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-muted-foreground">{fmt(h.sinIgv)}</TableCell>
                    <TableCell className="text-sm">{h.modificadoPor}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{h.motivo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" className="gap-2">
              <DownloadCloud className="h-4 w-4" /> Exportar Excel
            </Button>
            <Button variant="outline" onClick={() => setHistoryRow(null)}>Cerrar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
