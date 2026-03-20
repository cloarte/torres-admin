import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, flexRender, createColumnHelper,
} from "@tanstack/react-table";
import { Search, FilePlus, Eye, ArrowRight, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

/* ── Types ── */
interface Cotizacion {
  numero: string;
  cliente: string;
  canal: string;
  total: number;
  estado: "ACTIVA" | "VENCIDA" | "CONVERTIDA" | "ANULADA";
  creada: string;
  vence: string;
  diasRestantes: number | null;
}

/* ── Mock ── */
const mockCotizaciones: Cotizacion[] = [
  { numero: "COT-2026-0001", cliente: "Supermercados Plaza", canal: "Moderno", total: 1850, estado: "ACTIVA", creada: "05/01/2026", vence: "20/01/2026", diasRestantes: 8 },
  { numero: "COT-2026-0002", cliente: "Bodega San Martín", canal: "Tradicional", total: 480, estado: "ACTIVA", creada: "08/01/2026", vence: "23/01/2026", diasRestantes: 11 },
  { numero: "COT-2025-0089", cliente: "Distribuidora Lima", canal: "Directa", total: 3200, estado: "CONVERTIDA", creada: "15/12/2025", vence: "30/12/2025", diasRestantes: null },
  { numero: "COT-2025-0088", cliente: "Restaurant El Buen", canal: "Corporativo", total: 950, estado: "VENCIDA", creada: "10/12/2025", vence: "25/12/2025", diasRestantes: null },
];

const estadoBadge: Record<string, string> = {
  ACTIVA: "bg-success/10 text-success border border-success/20",
  VENCIDA: "bg-destructive/10 text-destructive border border-destructive/20",
  CONVERTIDA: "bg-primary/10 text-primary border border-primary/20",
  ANULADA: "bg-muted text-muted-foreground",
};

const canalBadge: Record<string, string> = {
  Corporativo: "bg-primary/10 text-primary border border-primary/20",
  Moderno: "bg-accent/10 text-accent border border-accent/20",
  Tradicional: "bg-success/10 text-success border border-success/20",
  Directa: "bg-warning/10 text-warning border border-warning/20",
};

const fmt = (n: number) => `S/ ${n.toLocaleString("es-PE")}`;

const col = createColumnHelper<Cotizacion>();

const detailProducts = [
  { nombre: "Panetón Clásico 900g", cantidad: 50, precio: 12.50, subtotal: 625 },
  { nombre: "Panetón Chocolate 900g", cantidad: 40, precio: 14.00, subtotal: 560 },
  { nombre: "Pan Molde Blanco 500g", cantidad: 100, precio: 4.00, subtotal: 400 },
  { nombre: "Empanada Pollo x12", cantidad: 30, precio: 10.00, subtotal: 300 },
];

export default function CotizacionesListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [canalFilter, setCanalFilter] = useState("all");
  const [estadoFilters, setEstadoFilters] = useState<string[]>([]);
  const [viewCot, setViewCot] = useState<Cotizacion | null>(null);
  const [anularCot, setAnularCot] = useState<Cotizacion | null>(null);

  const toggleEstado = (e: string) => {
    setEstadoFilters(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  };

  const filtered = useMemo(() => {
    return mockCotizaciones.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.numero.toLowerCase().includes(q) && !c.cliente.toLowerCase().includes(q)) return false;
      }
      if (canalFilter !== "all" && c.canal !== canalFilter) return false;
      if (estadoFilters.length > 0 && !estadoFilters.includes(c.estado)) return false;
      return true;
    });
  }, [search, canalFilter, estadoFilters]);

  const columns = [
    col.accessor("numero", {
      header: "N° Cotización",
      cell: i => <span className="font-mono text-sm font-medium">{i.getValue()}</span>,
    }),
    col.accessor("cliente", { header: "Cliente" }),
    col.accessor("canal", {
      header: "Canal",
      cell: i => <Badge className={canalBadge[i.getValue()] || ""}>{i.getValue()}</Badge>,
    }),
    col.accessor("total", {
      header: () => <span className="block text-right">Total c/IGV</span>,
      cell: i => <span className="block text-right font-mono tabular-nums font-semibold">{fmt(i.getValue())}</span>,
    }),
    col.accessor("estado", {
      header: "Estado",
      cell: i => <Badge className={estadoBadge[i.getValue()] || ""}>{i.getValue()}</Badge>,
    }),
    col.accessor("creada", { header: "Creada" }),
    col.accessor("vence", { header: "Vence" }),
    col.display({
      id: "diasRestantes",
      header: "Días restantes",
      cell: info => {
        const c = info.row.original;
        if (c.estado === "VENCIDA") return <span className="text-destructive font-medium">Vencida</span>;
        if (c.diasRestantes === null) return <span className="text-muted-foreground">—</span>;
        const d = c.diasRestantes;
        const cls = d <= 3 ? "text-destructive font-bold" : d <= 7 ? "text-warning font-medium" : "text-muted-foreground";
        return <span className={cls}>{d} días</span>;
      },
    }),
    col.display({
      id: "actions",
      header: "",
      cell: info => {
        const c = info.row.original;
        return (
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewCot(c)}>
              <Eye className="h-4 w-4" />
            </Button>
            {c.estado === "ACTIVA" && (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => toast.info("Funcionalidad de conversión a pedido próximamente")}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setAnularCot(c)}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const activeFilters = (canalFilter !== "all" ? 1 : 0) + (estadoFilters.length > 0 ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Cotizaciones</h2>
          <p className="text-sm text-muted-foreground">Gestión de cotizaciones comerciales</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate("/pricing/cotizaciones/nueva")}>
          <FilePlus className="mr-2 h-4 w-4" /> Nueva Cotización
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por N° o cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Filtros
                {activeFilters > 0 && <Badge className="ml-1 h-5 w-5 rounded-full bg-accent p-0 text-[10px] text-accent-foreground">{activeFilters}</Badge>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-4" align="end">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Estado</label>
                <div className="space-y-1.5">
                  {["ACTIVA", "VENCIDA", "CONVERTIDA", "ANULADA"].map(e => (
                    <label key={e} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={estadoFilters.includes(e)} onCheckedChange={() => toggleEstado(e)} />
                      {e}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Canal</label>
                <Select value={canalFilter} onValueChange={setCanalFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Corporativo">Corporativo</SelectItem>
                    <SelectItem value="Moderno">Moderno</SelectItem>
                    <SelectItem value="Tradicional">Tradicional</SelectItem>
                    <SelectItem value="Directa">Directa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => { setCanalFilter("all"); setEstadoFilters([]); }}>
                Limpiar filtros
              </Button>
            </PopoverContent>
          </Popover>
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
              <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">No se encontraron cotizaciones.</TableCell></TableRow>
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
          <p className="text-sm text-muted-foreground">{filtered.length} cotización{filtered.length !== 1 ? "es" : ""}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
            <span className="text-sm text-muted-foreground">Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</Button>
          </div>
        </div>
      </div>

      {/* View Detail Sheet */}
      <Sheet open={!!viewCot} onOpenChange={o => { if (!o) setViewCot(null); }}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{viewCot?.numero}</SheetTitle>
            <SheetDescription>{viewCot?.cliente} — <Badge className={canalBadge[viewCot?.canal || ""] || ""}>{viewCot?.canal}</Badge></SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><span className="text-muted-foreground">Estado:</span> <Badge className={estadoBadge[viewCot?.estado || ""] || ""}>{viewCot?.estado}</Badge></div>
              <div><span className="text-muted-foreground">Creada:</span> {viewCot?.creada}</div>
              <div><span className="text-muted-foreground">Vence:</span> {viewCot?.vence}</div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Producto</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Cant.</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Precio</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailProducts.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm">{p.nombre}</TableCell>
                    <TableCell className="text-right font-mono">{p.cantidad}</TableCell>
                    <TableCell className="text-right font-mono">{fmt(p.precio)}</TableCell>
                    <TableCell className="text-right font-mono font-semibold">{fmt(p.subtotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="text-right text-lg font-bold text-primary font-mono">Total: {fmt(viewCot?.total || 0)}</div>
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setViewCot(null)}>Cerrar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Anular Dialog */}
      <AlertDialog open={!!anularCot} onOpenChange={o => { if (!o) setAnularCot(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Anular cotización?</AlertDialogTitle>
            <AlertDialogDescription>¿Estás seguro de anular {anularCot?.numero}? Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { toast.success(`Cotización ${anularCot?.numero} anulada.`); setAnularCot(null); }}>
              Anular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
