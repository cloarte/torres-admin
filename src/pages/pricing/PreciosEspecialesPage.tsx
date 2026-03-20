import { useState } from "react";
import { toast } from "sonner";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, flexRender, createColumnHelper,
} from "@tanstack/react-table";
import { Search, PlusCircle, Eye, Trash2, X, ChevronRight, Check } from "lucide-react";
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
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";

/* ── Types ── */
interface SpecialPriceClient {
  id: number;
  cliente: string;
  canal: string;
  productos: number;
  ultimaMod: string;
}

interface ProductLine {
  sku: string;
  nombre: string;
  precioCanal: number;
  precioEspecial: number;
  motivo: string;
}

/* ── Mock ── */
const mockClients: SpecialPriceClient[] = [
  { id: 1, cliente: "Supermercados Plaza", canal: "Moderno", productos: 5, ultimaMod: "10/01/2026" },
  { id: 2, cliente: "Distribuidora Lima", canal: "Directa", productos: 2, ultimaMod: "05/01/2026" },
];

const allClients = [
  { id: 1, nombre: "Supermercados Plaza", ruc: "20512345678", canal: "Moderno" },
  { id: 2, nombre: "Bodega San Martín", ruc: "10234567890", canal: "Tradicional" },
  { id: 3, nombre: "Distribuidora Lima", ruc: "20387654321", canal: "Directa" },
];

const allProducts = [
  { sku: "PAX-001", nombre: "Panetón Clásico 900g", precioCanal: 12.50 },
  { sku: "PAX-002", nombre: "Panetón Chocolate 900g", precioCanal: 14.00 },
  { sku: "MOL-001", nombre: "Pan Molde Blanco 500g", precioCanal: 4.00 },
  { sku: "EMP-001", nombre: "Empanada Pollo x12", precioCanal: 10.00 },
];

const detailProducts: ProductLine[] = [
  { sku: "PAX-001", nombre: "Panetón Clásico 900g", precioCanal: 11.50, precioEspecial: 10.80, motivo: "Volumen alto" },
  { sku: "PAX-002", nombre: "Panetón Chocolate 900g", precioCanal: 13.00, precioEspecial: 12.20, motivo: "Contrato anual" },
  { sku: "MOL-001", nombre: "Pan Molde Blanco 500g", precioCanal: 3.75, precioEspecial: 3.50, motivo: "Negociación" },
  { sku: "EMP-001", nombre: "Empanada Pollo x12", precioCanal: 9.50, precioEspecial: 9.00, motivo: "Volumen" },
  { sku: "PAX-001", nombre: "Panetón Clásico 900g", precioCanal: 12.00, precioEspecial: 11.50, motivo: "Contrato" },
];

const canalBadge: Record<string, string> = {
  Corporativo: "bg-primary/10 text-primary border border-primary/20",
  Moderno: "bg-accent/10 text-accent border border-accent/20",
  Tradicional: "bg-success/10 text-success border border-success/20",
  Directa: "bg-warning/10 text-warning border border-warning/20",
};

const col = createColumnHelper<SpecialPriceClient>();
const fmt = (n: number) => `S/ ${n.toFixed(2)}`;

export default function PreciosEspecialesPage() {
  const [search, setSearch] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewClient, setViewClient] = useState<SpecialPriceClient | null>(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [clientOpen, setClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<typeof allClients[0] | null>(null);
  const [wizardRows, setWizardRows] = useState<Array<{ productIdx: number; precio: string; motivo: string }>>([]);

  const columns = [
    col.accessor("cliente", { header: "Cliente" }),
    col.accessor("canal", {
      header: "Canal",
      cell: i => <Badge className={canalBadge[i.getValue()] || ""}>{i.getValue()}</Badge>,
    }),
    col.accessor("productos", {
      header: "Productos con precio especial",
      cell: i => <span className="font-medium">{i.getValue()}</span>,
    }),
    col.accessor("ultimaMod", { header: "Última modificación" }),
    col.display({
      id: "actions",
      header: "",
      cell: info => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setViewClient(info.row.original); setViewOpen(true); }}>
            <Eye className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar precios especiales?</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Eliminar todos los precios especiales de {info.row.original.cliente}? El cliente volverá a usar los precios de su canal.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => toast.success("Precios especiales eliminados")}>
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    }),
  ];

  const filtered = mockClients.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.cliente.toLowerCase().includes(q);
  });

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const openWizard = () => {
    setStep(1);
    setSelectedClient(null);
    setWizardRows([]);
    setWizardOpen(true);
  };

  const addProductRow = () => {
    setWizardRows([...wizardRows, { productIdx: -1, precio: "", motivo: "" }]);
  };

  const updateRow = (idx: number, field: string, val: string | number) => {
    const copy = [...wizardRows];
    (copy[idx] as any)[field] = val;
    setWizardRows(copy);
  };

  const removeRow = (idx: number) => {
    setWizardRows(wizardRows.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Precios Especiales por Cliente</h2>
          <p className="text-sm text-muted-foreground">Los clientes que no aparecen usan el precio de su canal.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={openWizard}>
          <PlusCircle className="mr-2 h-4 w-4" /> Agregar Precio Especial
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center border-b border-border px-4 py-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
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
              <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">No hay precios especiales configurados.</TableCell></TableRow>
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
          <p className="text-sm text-muted-foreground">{filtered.length} cliente{filtered.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* View Detail Sheet */}
      <Sheet open={viewOpen} onOpenChange={setViewOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Precios Especiales</SheetTitle>
            <SheetDescription>{viewClient?.cliente} — Canal: {viewClient?.canal}</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Producto</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">P. Canal</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">P. Especial</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailProducts.slice(0, viewClient?.productos || 0).map((p, i) => {
                  const diff = p.precioEspecial - p.precioCanal;
                  return (
                    <TableRow key={i} className="hover:bg-muted/30">
                      <TableCell className="text-sm">{p.nombre}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">{fmt(p.precioCanal)}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums font-semibold">{fmt(p.precioEspecial)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.motivo}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setViewOpen(false)}>Cerrar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Wizard Sheet */}
      <Sheet open={wizardOpen} onOpenChange={setWizardOpen}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Agregar Precio Especial</SheetTitle>
            <SheetDescription>
              <div className="flex items-center gap-2 mt-2">
                <span className={`flex items-center gap-1.5 text-xs font-medium ${step === 1 ? "text-accent" : "text-muted-foreground"}`}>
                  {step > 1 ? <Check className="h-3.5 w-3.5 text-success" /> : <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px]">1</span>}
                  Cliente
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className={`flex items-center gap-1.5 text-xs font-medium ${step === 2 ? "text-accent" : "text-muted-foreground"}`}>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step === 2 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>2</span>
                  Precios
                </span>
              </div>
            </SheetDescription>
          </SheetHeader>

          {step === 1 && (
            <div className="mt-6 space-y-4">
              <Popover open={clientOpen} onOpenChange={setClientOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {selectedClient ? selectedClient.nombre : "Buscar cliente por nombre o RUC..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandList>
                      <CommandEmpty>No se encontró cliente.</CommandEmpty>
                      <CommandGroup>
                        {allClients.map(c => (
                          <CommandItem key={c.id} value={`${c.nombre} ${c.ruc}`} onSelect={() => { setSelectedClient(c); setClientOpen(false); }}>
                            <span>{c.nombre}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{c.ruc}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedClient && (
                <div className="rounded-lg bg-muted/50 p-4 space-y-1">
                  <p className="font-medium">{selectedClient.nombre}</p>
                  <p className="text-sm text-muted-foreground">RUC: {selectedClient.ruc}</p>
                  <Badge className={canalBadge[selectedClient.canal] || ""}>{selectedClient.canal}</Badge>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="mt-6 space-y-4">
              <Button variant="outline" size="sm" onClick={addProductRow}>+ Agregar Producto</Button>
              <div className="space-y-3">
                {wizardRows.map((row, idx) => {
                  const prod = row.productIdx >= 0 ? allProducts[row.productIdx] : null;
                  const diff = prod && row.precio ? parseFloat(row.precio) - prod.precioCanal : 0;
                  return (
                    <div key={idx} className="rounded-lg border border-border p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <select
                          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={row.productIdx}
                          onChange={e => updateRow(idx, "productIdx", parseInt(e.target.value))}
                        >
                          <option value={-1}>Seleccionar producto...</option>
                          {allProducts.map((p, pi) => <option key={pi} value={pi}>{p.sku} — {p.nombre}</option>)}
                        </select>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeRow(idx)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {prod && (
                        <div className="grid grid-cols-3 gap-2 items-end">
                          <div>
                            <label className="text-xs text-muted-foreground">P. Canal</label>
                            <p className="font-mono text-sm text-muted-foreground">{fmt(prod.precioCanal)}</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">P. Especial c/IGV</label>
                            <Input type="number" step="0.01" value={row.precio} onChange={e => updateRow(idx, "precio", e.target.value)} className="font-mono h-8" />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Diferencia</label>
                            <p className={`font-mono text-sm font-medium ${diff < 0 ? "text-success" : diff > 0 ? "text-destructive" : ""}`}>
                              {diff !== 0 ? `${diff > 0 ? "+" : ""}${fmt(diff)}` : "—"}
                            </p>
                          </div>
                        </div>
                      )}
                      <Input placeholder="Motivo..." value={row.motivo} onChange={e => updateRow(idx, "motivo", e.target.value)} className="h-8 text-sm" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <SheetFooter className="mt-6">
            {step === 1 && (
              <>
                <Button variant="outline" onClick={() => setWizardOpen(false)}>Cancelar</Button>
                <Button disabled={!selectedClient} onClick={() => setStep(2)}>Siguiente →</Button>
              </>
            )}
            {step === 2 && (
              <>
                <Button variant="outline" onClick={() => setStep(1)}>← Anterior</Button>
                <Button disabled={wizardRows.length === 0} onClick={() => {
                  toast.success(`Precios especiales guardados para ${selectedClient?.nombre}.`);
                  setWizardOpen(false);
                }}>
                  Guardar Precios
                </Button>
              </>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
