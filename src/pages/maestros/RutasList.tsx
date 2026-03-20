import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  flexRender, createColumnHelper,
} from "@tanstack/react-table";
import { Search, Plus, MoreHorizontal, MapPin, Calendar, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DeactivateDialog } from "@/components/maestros/DeactivateDialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

export interface Ruta {
  id: number;
  codigo: string;
  nombre: string;
  zona: "Lima" | "Provincias";
  vendedor: string;
  dias: string[];
  numClientes: number;
  status: "ACTIVO" | "INACTIVO";
}

export const mockRutas: Ruta[] = [
  { id: 1, codigo: "LIM-01", nombre: "Miraflores - San Isidro", zona: "Lima", vendedor: "Juan López", dias: ["L", "M", "X", "J", "V"], numClientes: 12, status: "ACTIVO" },
  { id: 2, codigo: "LIM-02", nombre: "La Victoria - Cercado", zona: "Lima", vendedor: "Pedro Soto", dias: ["L", "M", "X", "J", "V"], numClientes: 9, status: "ACTIVO" },
  { id: 3, codigo: "PRV-01", nombre: "Arequipa Centro", zona: "Provincias", vendedor: "María Torres", dias: ["L", "X", "V"], numClientes: 18, status: "ACTIVO" },
];

const DIAS = [
  { value: "L", label: "Lunes" },
  { value: "M", label: "Martes" },
  { value: "X", label: "Miércoles" },
  { value: "J", label: "Jueves" },
  { value: "V", label: "Viernes" },
  { value: "S", label: "Sábado" },
];

const columnHelper = createColumnHelper<Ruta>();

function RutaActions({ ruta }: { ruta: Ruta }) {
  const navigate = useNavigate();
  const [showDeactivate, setShowDeactivate] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate(`/maestros/rutas/${ruta.id}/clientes`)}>
            <Users className="mr-2 h-4 w-4" />Ver clientes
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(`/maestros/rutas/${ruta.id}/programacion`)}>
            <Calendar className="mr-2 h-4 w-4" />Programación
          </DropdownMenuItem>
          <DropdownMenuItem>Editar</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={() => setShowDeactivate(true)}>Desactivar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeactivateDialog open={showDeactivate} onOpenChange={setShowDeactivate}
        title={`¿Desactivar ruta ${ruta.codigo}?`}
        onConfirm={() => { toast.success("Ruta desactivada"); setShowDeactivate(false); }} />
    </>
  );
}

const columns = [
  columnHelper.accessor("codigo", {
    header: "Código",
    cell: (info) => <span className="font-mono text-sm font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("nombre", {
    header: "Nombre",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor("zona", {
    header: "Zona",
    cell: (info) => (
      <Badge variant="outline" className={info.getValue() === "Lima" ? "bg-primary/10 text-primary border-primary/20" : "bg-accent/10 text-accent border-accent/20"}>
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor("vendedor", { header: "Vendedor" }),
  columnHelper.accessor("dias", {
    header: "Días operación",
    cell: (info) => (
      <div className="flex gap-1">
        {info.getValue().map((d) => (
          <span key={d} className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-medium">{d}</span>
        ))}
      </div>
    ),
  }),
  columnHelper.accessor("numClientes", {
    header: "N° clientes",
    cell: (info) => <Badge variant="secondary">{info.getValue()}</Badge>,
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
  columnHelper.display({ id: "actions", cell: ({ row }) => <RutaActions ruta={row.original} /> }),
];

const rutaSchema = z.object({
  codigo: z.string().min(1, "Requerido"),
  nombre: z.string().min(1, "Requerido"),
  zona: z.string().min(1, "Selecciona zona"),
  vendedor: z.string().min(1, "Selecciona vendedor"),
  dias: z.array(z.string()).min(1, "Selecciona al menos un día"),
  descripcion: z.string().max(300).optional().or(z.literal("")),
});

type RutaForm = z.infer<typeof rutaSchema>;

export default function RutasList() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const table = useReactTable({
    data: mockRutas, columns, state: { globalFilter }, onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: 20 } },
  });

  const form = useForm<RutaForm>({
    resolver: zodResolver(rutaSchema),
    defaultValues: { codigo: "", nombre: "", zona: "", vendedor: "", dias: [], descripcion: "" },
    mode: "onBlur",
  });

  const watchDias = form.watch("dias");

  const onSubmit = (data: RutaForm) => {
    console.log(data);
    toast.success("Ruta creada exitosamente");
    setSheetOpen(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Rutas</h2>
          <p className="text-sm text-muted-foreground">Gestión de rutas de distribución</p>
        </div>
        <Button onClick={() => setSheetOpen(true)}><Plus className="mr-2 h-4 w-4" />Nueva Ruta</Button>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center border-b border-border px-4 py-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar ruta..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9" />
          </div>
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
              <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">No se encontraron rutas.</TableCell></TableRow>
            ) : table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30">
                {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">{mockRutas.length} ruta{mockRutas.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          <SheetHeader><SheetTitle>Nueva Ruta</SheetTitle></SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="codigo" render={({ field }) => (
                  <FormItem><FormLabel>Código *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="nombre" render={({ field }) => (
                  <FormItem><FormLabel>Nombre *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="zona" render={({ field }) => (
                <FormItem>
                  <FormLabel>Zona *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona zona" /></SelectTrigger></FormControl>
                    <SelectContent position="popper">
                      <SelectItem value="Lima">Lima</SelectItem>
                      <SelectItem value="Provincias">Provincias</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="vendedor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendedor * (canal Tradicional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona vendedor" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Juan López">Juan López</SelectItem>
                      <SelectItem value="María Torres">María Torres</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="dias" render={() => (
                <FormItem>
                  <FormLabel>Días de operación *</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {DIAS.map((dia) => (
                      <div key={dia.value} className="flex items-center gap-1.5">
                        <Checkbox
                          checked={watchDias?.includes(dia.value)}
                          onCheckedChange={(checked) => {
                            const current = form.getValues("dias");
                            form.setValue("dias", checked ? [...current, dia.value] : current.filter((d) => d !== dia.value), { shouldValidate: true });
                          }}
                        />
                        <Label className="text-sm font-normal">{dia.label}</Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="descripcion" render={({ field }) => (
                <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
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
