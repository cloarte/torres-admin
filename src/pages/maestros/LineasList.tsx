import { useState } from "react";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  flexRender, createColumnHelper,
} from "@tanstack/react-table";
import { Search, Plus, MoreHorizontal, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DeactivateDialog } from "@/components/maestros/DeactivateDialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

interface Linea {
  id: number;
  nombre: string;
  numProductos: number;
  descripcion: string;
  status: "ACTIVO" | "INACTIVO";
}

const mockLineas: Linea[] = [
  { id: 1, nombre: "Panetones", numProductos: 8, descripcion: "Panetones clásicos y especiales", status: "ACTIVO" },
  { id: 2, nombre: "Pan de Molde", numProductos: 12, descripcion: "Pan de molde en diversas presentaciones", status: "ACTIVO" },
  { id: 3, nombre: "Empanadas", numProductos: 6, descripcion: "Empanadas rellenas congeladas", status: "ACTIVO" },
  { id: 4, nombre: "Tortas", numProductos: 10, descripcion: "Tortas para celebraciones", status: "ACTIVO" },
  { id: 5, nombre: "Kekos", numProductos: 7, descripcion: "Kekes y queques variados", status: "ACTIVO" },
];

const columnHelper = createColumnHelper<Linea>();

function ActionsCell({ linea }: { linea: Linea }) {
  const [showDeactivate, setShowDeactivate] = useState(false);
  const hasActiveProducts = linea.numProductos > 0;
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
        title={`¿Desactivar línea "${linea.nombre}"?`}
        description={hasActiveProducts
          ? `Esta línea tiene ${linea.numProductos} productos activos. ¿Desactivar de todas formas?`
          : "Esta acción cambiará el estado a inactivo."}
        onConfirm={() => { toast.success("Línea desactivada"); setShowDeactivate(false); }} />
    </>
  );
}

const columns = [
  columnHelper.accessor("nombre", {
    header: "Nombre",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor("numProductos", {
    header: "N° de productos",
    cell: (info) => <Badge variant="secondary">{info.getValue()}</Badge>,
  }),
  columnHelper.accessor("descripcion", { header: "Descripción" }),
  columnHelper.accessor("status", {
    header: "Estado",
    cell: (info) => (
      <Badge className={info.getValue() === "ACTIVO" ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"}>
        <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${info.getValue() === "ACTIVO" ? "bg-success" : "bg-destructive"}`} />
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.display({ id: "actions", cell: ({ row }) => <ActionsCell linea={row.original} /> }),
];

const lineaSchema = z.object({
  nombre: z.string().min(1, "Requerido").max(100),
  descripcion: z.string().max(300).optional().or(z.literal("")),
  activo: z.boolean(),
});

type LineaForm = z.infer<typeof lineaSchema>;

export default function LineasList() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const table = useReactTable({
    data: mockLineas, columns, state: { globalFilter }, onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: 20 } },
  });

  const form = useForm<LineaForm>({
    resolver: zodResolver(lineaSchema),
    defaultValues: { nombre: "", descripcion: "", activo: true },
    mode: "onBlur",
  });

  const onSubmit = (data: LineaForm) => {
    console.log(data);
    toast.success("Línea creada exitosamente");
    setDialogOpen(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Líneas de Producto</h2>
          <p className="text-sm text-muted-foreground">Categorías de productos</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Nueva Línea</Button>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center border-b border-border px-4 py-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar línea..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9" />
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
              <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">No se encontraron líneas.</TableCell></TableRow>
            ) : table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30">
                {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">{mockLineas.length} línea{mockLineas.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Línea de Producto</DialogTitle>
            <DialogDescription>Crea una nueva categoría para agrupar productos.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem><FormLabel>Nombre *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="descripcion" render={({ field }) => (
                <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="activo" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                  <FormLabel className="cursor-pointer">Activo</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={!form.formState.isValid}>Guardar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
