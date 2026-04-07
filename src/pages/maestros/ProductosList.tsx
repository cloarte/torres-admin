import { useState } from "react";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  flexRender, createColumnHelper,
} from "@tanstack/react-table";
import { Search, Plus, Filter, MoreHorizontal, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DeactivateDialog } from "@/components/maestros/DeactivateDialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

interface Producto {
  id: number;
  sku: string;
  nombre: string;
  linea: string;
  presentacion: string;
  status: "ACTIVO" | "INACTIVO";
}

const initialProductos: Producto[] = [
  { id: 1, sku: "PAX-001", nombre: "Panetón Clásico 900g", linea: "Panetones", presentacion: "Caja x6", status: "ACTIVO" },
  { id: 2, sku: "PAX-002", nombre: "Panetón Chocolate 900g", linea: "Panetones", presentacion: "Caja x6", status: "ACTIVO" },
  { id: 3, sku: "MOL-001", nombre: "Pan de Molde Blanco 500g", linea: "Pan de Molde", presentacion: "Bolsa", status: "ACTIVO" },
  { id: 4, sku: "EMP-001", nombre: "Empanada Pollo x12", linea: "Empanadas", presentacion: "Bandeja", status: "ACTIVO" },
];

const LINEAS = ["Panetones", "Pan de Molde", "Empanadas", "Tortas", "Kekos"];

const lineaColors: Record<string, string> = {
  Panetones: "bg-accent/10 text-accent border-accent/20",
  "Pan de Molde": "bg-primary/10 text-primary border-primary/20",
  Empanadas: "bg-success/10 text-success border-success/20",
  Tortas: "bg-warning/10 text-warning border-warning/20",
  Kekos: "bg-muted text-muted-foreground",
};

const columnHelper = createColumnHelper<Producto>();
const columns = [
  columnHelper.accessor("sku", {
    header: "SKU",
    cell: (info) => <span className="font-mono text-sm font-medium text-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor("nombre", {
    header: "Nombre",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor("linea", {
    header: "Línea",
    cell: (info) => <Badge variant="outline" className={`${lineaColors[info.getValue()] || ""} text-[11px]`}>{info.getValue()}</Badge>,
  }),
  columnHelper.accessor("presentacion", { header: "Presentación" }),
  columnHelper.accessor("status", {
    header: "Estado",
    cell: (info) => (
      <Badge className={info.getValue() === "ACTIVO" ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"}>
        <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${info.getValue() === "ACTIVO" ? "bg-success" : "bg-destructive"}`} />
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => <ProductoActions producto={row.original} />,
  }),
];

function ProductoActions({ producto }: { producto: Producto }) {
  const [showDeactivate, setShowDeactivate] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Editar</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={() => setShowDeactivate(true)}>Desactivar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeactivateDialog open={showDeactivate} onOpenChange={setShowDeactivate}
        title={`¿Desactivar ${producto.nombre}?`}
        onConfirm={() => { toast.success("Producto desactivado"); setShowDeactivate(false); }} />
    </>
  );
}

const productoSchema = z.object({
  sku: z.string().min(1, "Requerido"),
  nombre: z.string().min(1, "Requerido").max(200),
  descripcion: z.string().max(500).optional().or(z.literal("")),
  linea: z.string().min(1, "Selecciona una línea"),
  presentacion: z.string().min(1, "Requerido"),
  estado: z.string().min(1, "Requerido"),
});

type ProductoForm = z.infer<typeof productoSchema>;

export default function ProductosList() {
  const [productos, setProductos] = useState<Producto[]>(initialProductos);
  const [globalFilter, setGlobalFilter] = useState("");
  const [lineaFilter, setLineaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);

  const filteredData = productos.filter((p) => {
    if (lineaFilter !== "all" && p.linea !== lineaFilter) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  const table = useReactTable({
    data: filteredData, columns, state: { globalFilter }, onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: 20 } },
  });

  const form = useForm<ProductoForm>({
    resolver: zodResolver(productoSchema),
    defaultValues: { sku: "", nombre: "", descripcion: "", linea: "", presentacion: "", estado: "ACTIVO" },
    mode: "onChange",
  });

  const onSubmit = (data: ProductoForm) => {
    setProductos(prev => [...prev, {
      id: prev.length + 1,
      sku: data.sku,
      nombre: data.nombre,
      linea: data.linea,
      presentacion: data.presentacion,
      status: data.estado as "ACTIVO" | "INACTIVO",
    }]);
    toast.success("Producto creado exitosamente");
    setSheetOpen(false);
    form.reset();
  };

  const activeFilters = (lineaFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Productos</h2>
          <p className="text-sm text-muted-foreground">Catálogo de productos y presentaciones</p>
        </div>
        <Button onClick={() => setSheetOpen(true)}><Plus className="mr-2 h-4 w-4" />Nuevo Producto</Button>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por SKU o nombre..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9" />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />Filtros
                {activeFilters > 0 && <Badge className="ml-1 h-5 w-5 rounded-full bg-accent p-0 text-[10px] text-accent-foreground">{activeFilters}</Badge>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-4" align="end">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Línea</label>
                <Select value={lineaFilter} onValueChange={setLineaFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent position="popper" className="z-[9999]">
                    <SelectItem value="all">Todas</SelectItem>
                    {LINEAS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Estado</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent position="popper" className="z-[9999]">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ACTIVO">Activo</SelectItem>
                    <SelectItem value="INACTIVO">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => { setLineaFilter("all"); setStatusFilter("all"); }}>Limpiar filtros</Button>
            </PopoverContent>
          </Popover>
        </div>

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/50 hover:bg-muted/50">
                {hg.headers.map((h) => <TableHead key={h.id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">No se encontraron productos.</TableCell></TableRow>
            ) : table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30">
                {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">{filteredData.length} producto{filteredData.length !== 1 ? "s" : ""}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
            <span className="text-sm text-muted-foreground">Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</Button>
          </div>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto" aria-describedby="producto-form-desc">
          <SheetHeader>
            <SheetTitle>Nuevo Producto</SheetTitle>
            <p id="producto-form-desc" className="text-sm text-muted-foreground">Completa los datos del nuevo producto</p>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
              <FormField control={form.control} name="sku" render={({ field }) => (
                <FormItem><FormLabel>SKU *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem><FormLabel>Nombre *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="descripcion" render={({ field }) => (
                <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="linea" render={({ field }) => (
                <FormItem>
                  <FormLabel>Línea *</FormLabel>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona línea" /></SelectTrigger></FormControl>
                    <SelectContent position="popper" className="z-[9999]">{LINEAS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="presentacion" render={({ field }) => (
                <FormItem><FormLabel>Presentación *</FormLabel><FormControl><Input placeholder="900g, x12 unidades..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="estado" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl>
                    <SelectContent position="popper" className="z-[9999]">
                      <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                      <SelectItem value="INACTIVO">INACTIVO</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <SheetFooter className="pt-4 gap-2">
                <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={!form.formState.isValid}>Guardar</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
