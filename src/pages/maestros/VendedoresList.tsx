import { useState } from "react";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  flexRender, createColumnHelper,
} from "@tanstack/react-table";
import { Search, Plus, Filter, MoreHorizontal, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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

interface Vendedor {
  id: number;
  nombre: string;
  codigo: string;
  canales: string[];
  ruta: string | null;
  status: "ACTIVO" | "INACTIVO";
}

const mockVendedores: Vendedor[] = [
  { id: 1, nombre: "Juan López", codigo: "V-001", canales: ["Tradicional"], ruta: "Ruta LIM-01", status: "ACTIVO" },
  { id: 2, nombre: "Pedro Soto", codigo: "V-002", canales: ["Moderno", "Corporativo"], ruta: null, status: "ACTIVO" },
  { id: 3, nombre: "María Torres", codigo: "V-003", canales: ["Tradicional"], ruta: "Ruta PRV-01", status: "ACTIVO" },
];

const CANALES = ["Corporativo", "Moderno", "Tradicional", "Directa"];

const columnHelper = createColumnHelper<Vendedor>();
const columns = [
  columnHelper.accessor("nombre", {
    header: "Nombre",
    cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor("codigo", { header: "Código" }),
  columnHelper.accessor("canales", {
    header: "Canales",
    cell: (info) => (
      <div className="flex gap-1 flex-wrap">
        {info.getValue().map((c) => (
          <Badge key={c} variant="secondary" className="text-[11px]">{c}</Badge>
        ))}
      </div>
    ),
  }),
  columnHelper.accessor("ruta", {
    header: "Ruta",
    cell: (info) => info.getValue() ? (
      <span className="flex items-center gap-1 text-sm"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{info.getValue()}</span>
    ) : <span className="text-muted-foreground">—</span>,
  }),
  columnHelper.accessor("status", {
    header: "Estado",
    cell: (info) => (
      <Badge variant={info.getValue() === "ACTIVO" ? "default" : "secondary"}
        className={info.getValue() === "ACTIVO" ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"}>
        <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${info.getValue() === "ACTIVO" ? "bg-success" : "bg-destructive"}`} />
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: ({ row }) => <ActionsCell vendedor={row.original} />,
  }),
];

function ActionsCell({ vendedor }: { vendedor: Vendedor }) {
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
        title={`¿Desactivar a ${vendedor.nombre}?`}
        onConfirm={() => { toast.success("Vendedor desactivado"); setShowDeactivate(false); }} />
    </>
  );
}

const vendedorSchema = z.object({
  usuario: z.string().min(1, "Selecciona un usuario"),
  codigo: z.string().min(1, "Requerido"),
  canales: z.array(z.string()).min(1, "Selecciona al menos un canal"),
  ruta: z.string().optional(),
});

type VendedorForm = z.infer<typeof vendedorSchema>;

export default function VendedoresList() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [canalFilter, setCanalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);

  const filteredData = mockVendedores.filter((v) => {
    if (canalFilter !== "all" && !v.canales.includes(canalFilter)) return false;
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    return true;
  });

  const table = useReactTable({
    data: filteredData, columns, state: { globalFilter }, onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: 20 } },
  });

  const form = useForm<VendedorForm>({
    resolver: zodResolver(vendedorSchema),
    defaultValues: { usuario: "", codigo: "", canales: [], ruta: "" },
    mode: "onBlur",
  });

  const watchCanales = form.watch("canales");
  const showRuta = watchCanales?.includes("Tradicional");

  const onSubmit = (data: VendedorForm) => {
    console.log(data);
    toast.success("Vendedor creado exitosamente");
    setSheetOpen(false);
    form.reset();
  };

  const activeFilters = (canalFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Vendedores</h2>
          <p className="text-sm text-muted-foreground">Gestión de vendedores y asignación de canales</p>
        </div>
        <Button onClick={() => setSheetOpen(true)}><Plus className="mr-2 h-4 w-4" />Nuevo Vendedor</Button>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar vendedor..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9" />
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
                <label className="text-xs font-medium text-muted-foreground">Canal</label>
                <Select value={canalFilter} onValueChange={setCanalFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent position="popper">
                    <SelectItem value="all">Todos</SelectItem>
                    {CANALES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Estado</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent position="popper">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ACTIVO">Activo</SelectItem>
                    <SelectItem value="INACTIVO">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => { setCanalFilter("all"); setStatusFilter("all"); }}>Limpiar filtros</Button>
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
              <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">No se encontraron vendedores.</TableCell></TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">{filteredData.length} vendedor{filteredData.length !== 1 ? "es" : ""}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
            <span className="text-sm text-muted-foreground">Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</Button>
          </div>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          <SheetHeader><SheetTitle>Nuevo Vendedor</SheetTitle></SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
              <FormField control={form.control} name="usuario" render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario (rol Vendedor) *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona usuario" /></SelectTrigger></FormControl>
                    <SelectContent position="popper">
                      <SelectItem value="Juan López">Juan López</SelectItem>
                      <SelectItem value="Pedro Soto">Pedro Soto</SelectItem>
                      <SelectItem value="María Torres">María Torres</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="codigo" render={({ field }) => (
                <FormItem><FormLabel>Código vendedor *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="canales" render={() => (
                <FormItem>
                  <FormLabel>Canales asignados *</FormLabel>
                  <div className="space-y-2">
                    {CANALES.map((canal) => (
                      <div key={canal} className="flex items-center gap-2">
                        <Checkbox
                          checked={watchCanales?.includes(canal)}
                          onCheckedChange={(checked) => {
                            const current = form.getValues("canales");
                            form.setValue("canales", checked ? [...current, canal] : current.filter((c) => c !== canal), { shouldValidate: true });
                          }}
                        />
                        <Label className="text-sm font-normal">{canal}</Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              {showRuta && (
                <FormField control={form.control} name="ruta" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ruta</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecciona ruta" /></SelectTrigger></FormControl>
                      <SelectContent position="popper">
                        <SelectItem value="LIM-01">Ruta LIM-01</SelectItem>
                        <SelectItem value="LIM-02">Ruta LIM-02</SelectItem>
                        <SelectItem value="PRV-01">Ruta PRV-01</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

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
