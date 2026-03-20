import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  flexRender, createColumnHelper,
} from "@tanstack/react-table";
import { Search, Plus, Filter, MoreHorizontal, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

export interface Cliente {
  id: number;
  razonSocial: string;
  ruc: string;
  canal: string;
  diasCredito: number;
  portalAccess: boolean;
  status: "ACTIVO" | "INACTIVO";
  direccion: string;
  telefono: string;
  email: string;
  contactoNombre: string;
  contactoCargo: string;
  observaciones: string;
  portalEmail?: string;
  portalLastLogin?: string;
}

export const mockClientes: Cliente[] = [
  { id: 1, razonSocial: "Supermercados Plaza", ruc: "20512345678", canal: "Moderno", diasCredito: 30, portalAccess: true, status: "ACTIVO", direccion: "Av. Javier Prado 1234, San Isidro", telefono: "01-4567890", email: "compras@plaza.pe", contactoNombre: "Ana Vargas", contactoCargo: "Jefe de Compras", observaciones: "", portalEmail: "compras@plaza.pe", portalLastLogin: "hace 3 horas" },
  { id: 2, razonSocial: "Bodega San Martín", ruc: "10234567890", canal: "Tradicional", diasCredito: 0, portalAccess: false, status: "ACTIVO", direccion: "Jr. Huallaga 567, Cercado de Lima", telefono: "01-3456789", email: "bodega.sm@gmail.com", contactoNombre: "Carlos Ramos", contactoCargo: "Propietario", observaciones: "Atención solo por las mañanas" },
  { id: 3, razonSocial: "Distribuidora Lima", ruc: "20387654321", canal: "Directa", diasCredito: 15, portalAccess: true, status: "ACTIVO", direccion: "Calle Los Olivos 890, Los Olivos", telefono: "01-5678901", email: "info@distlima.pe", contactoNombre: "Luis Pérez", contactoCargo: "Gerente General", observaciones: "", portalEmail: "info@distlima.pe", portalLastLogin: "hace 2 días" },
];

const CANALES = ["Corporativo", "Moderno", "Tradicional", "Directa"];

const columnHelper = createColumnHelper<Cliente>();

function ClienteActions({ cliente }: { cliente: Cliente }) {
  const navigate = useNavigate();
  const [showDeactivate, setShowDeactivate] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate(`/maestros/clientes/${cliente.id}`)}>Ver ficha</DropdownMenuItem>
          <DropdownMenuItem>Editar</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={() => setShowDeactivate(true)}>Desactivar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeactivateDialog open={showDeactivate} onOpenChange={setShowDeactivate}
        title={`¿Desactivar a ${cliente.razonSocial}?`}
        onConfirm={() => { toast.success("Cliente desactivado"); setShowDeactivate(false); }} />
    </>
  );
}

const columns = [
  columnHelper.accessor("razonSocial", {
    header: "Razón social",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor("ruc", { header: "RUC", cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span> }),
  columnHelper.accessor("canal", {
    header: "Canal",
    cell: (info) => <Badge variant="secondary">{info.getValue()}</Badge>,
  }),
  columnHelper.accessor("diasCredito", {
    header: "Días crédito",
    cell: (info) => <span className="text-sm">{info.getValue() === 0 ? "Pago inmediato" : `${info.getValue()} días`}</span>,
  }),
  columnHelper.accessor("portalAccess", {
    header: "Portal",
    cell: (info) => (
      <Badge className={info.getValue() ? "bg-success/10 text-success border border-success/20" : "bg-muted text-muted-foreground"}>
        {info.getValue() ? "Sí" : "No"}
      </Badge>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Estado",
    cell: (info) => (
      <Badge className={info.getValue() === "ACTIVO" ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"}>
        <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${info.getValue() === "ACTIVO" ? "bg-success" : "bg-destructive"}`} />
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.display({ id: "actions", cell: ({ row }) => <ClienteActions cliente={row.original} /> }),
];

const clienteSchema = z.object({
  razonSocial: z.string().min(1, "Requerido").max(200),
  ruc: z.string().regex(/^\d{11}$/, "El RUC debe tener 11 dígitos"),
  canal: z.string().min(1, "Selecciona un canal"),
  direccion: z.string().min(1, "Requerido").max(300),
  telefono: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  contactoNombre: z.string().max(100).optional().or(z.literal("")),
  contactoCargo: z.string().max(100).optional().or(z.literal("")),
  diasCredito: z.string().min(1, "Selecciona"),
  observaciones: z.string().max(500).optional().or(z.literal("")),
  activo: z.boolean(),
});

type ClienteForm = z.infer<typeof clienteSchema>;

export default function ClientesList() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [canalFilter, setCanalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [creditoFilter, setCreditoFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);

  const filteredData = mockClientes.filter((c) => {
    if (canalFilter !== "all" && c.canal !== canalFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (creditoFilter === "con" && c.diasCredito === 0) return false;
    if (creditoFilter === "sin" && c.diasCredito > 0) return false;
    return true;
  });

  const table = useReactTable({
    data: filteredData, columns, state: { globalFilter }, onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: 20 } },
  });

  const form = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { razonSocial: "", ruc: "", canal: "", direccion: "", telefono: "", email: "", contactoNombre: "", contactoCargo: "", diasCredito: "", observaciones: "", activo: true },
    mode: "onBlur",
  });

  const onSubmit = (data: ClienteForm) => {
    console.log(data);
    toast.success("Cliente creado exitosamente");
    setSheetOpen(false);
    form.reset();
  };

  const activeFilters = (canalFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0) + (creditoFilter !== "all" ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Clientes</h2>
          <p className="text-sm text-muted-foreground">Gestión de clientes y acceso al portal</p>
        </div>
        <Button onClick={() => setSheetOpen(true)}><Plus className="mr-2 h-4 w-4" />Nuevo Cliente</Button>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar cliente..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9" />
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
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Crédito</label>
                <Select value={creditoFilter} onValueChange={setCreditoFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent position="popper">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="con">Con crédito</SelectItem>
                    <SelectItem value="sin">Sin crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => { setCanalFilter("all"); setStatusFilter("all"); setCreditoFilter("all"); }}>Limpiar filtros</Button>
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
              <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">No se encontraron clientes.</TableCell></TableRow>
            ) : table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30">
                {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">{filteredData.length} cliente{filteredData.length !== 1 ? "s" : ""}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
            <span className="text-sm text-muted-foreground">Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</Button>
          </div>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto">
          <SheetHeader><SheetTitle>Nuevo Cliente</SheetTitle></SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="razonSocial" render={({ field }) => (
                  <FormItem><FormLabel>Razón social *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="ruc" render={({ field }) => (
                  <FormItem><FormLabel>RUC *</FormLabel><FormControl><Input {...field} maxLength={11} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="canal" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canal *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                      <SelectContent position="popper">{CANALES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="direccion" render={({ field }) => (
                  <FormItem><FormLabel>Dirección *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="telefono" render={({ field }) => (
                  <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="contactoNombre" render={({ field }) => (
                  <FormItem><FormLabel>Contacto nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="contactoCargo" render={({ field }) => (
                  <FormItem><FormLabel>Contacto cargo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="diasCredito" render={({ field }) => (
                <FormItem>
                  <FormLabel>Días de crédito</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                    <SelectContent position="popper">
                      <SelectItem value="0">Pago inmediato</SelectItem>
                      <SelectItem value="15">15 días</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                      <SelectItem value="60">60 días</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="observaciones" render={({ field }) => (
                <FormItem><FormLabel>Observaciones</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="activo" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                  <FormLabel className="cursor-pointer">Activo</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
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
