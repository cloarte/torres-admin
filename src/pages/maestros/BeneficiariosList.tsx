import { useState } from "react";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  flexRender, createColumnHelper,
} from "@tanstack/react-table";
import { Search, Plus, MoreHorizontal, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DeactivateDialog } from "@/components/maestros/DeactivateDialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

interface Beneficiario {
  id: number;
  razonSocial: string;
  ruc: string;
  contacto: string;
  perceptor: boolean;
  status: "ACTIVO" | "INACTIVO";
}

const mockBeneficiarios: Beneficiario[] = [
  { id: 1, razonSocial: "Comedor Santa Rosa", ruc: "20112233445", contacto: "Hermana Carmen", perceptor: true, status: "ACTIVO" },
  { id: 2, razonSocial: "Albergue Los Niños", ruc: "20556677889", contacto: "Jorge Mamani", perceptor: false, status: "ACTIVO" },
];

const columnHelper = createColumnHelper<Beneficiario>();

function BenefActions({ beneficiario }: { beneficiario: Beneficiario }) {
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
        title={`¿Desactivar a ${beneficiario.razonSocial}?`}
        onConfirm={() => { toast.success("Beneficiario desactivado"); setShowDeactivate(false); }} />
    </>
  );
}

const columns = [
  columnHelper.accessor("razonSocial", {
    header: "Razón social",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor("ruc", {
    header: "RUC",
    cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
  }),
  columnHelper.accessor("contacto", { header: "Contacto" }),
  columnHelper.accessor("perceptor", {
    header: "Perceptor SUNAT",
    cell: (info) => (
      <Tooltip>
        <TooltipTrigger>
          <Badge className={info.getValue() ? "bg-success/10 text-success border border-success/20" : "bg-muted text-muted-foreground"}>
            {info.getValue() ? "Sí" : "No"}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {info.getValue()
            ? "Las donaciones a esta entidad son deducibles del Impuesto a la Renta (Art. 37 LIR)"
            : "No califica como perceptor de donaciones SUNAT"}
        </TooltipContent>
      </Tooltip>
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
  columnHelper.display({ id: "actions", cell: ({ row }) => <BenefActions beneficiario={row.original} /> }),
];

const beneficiarioSchema = z.object({
  razonSocial: z.string().min(1, "Requerido").max(200),
  ruc: z.string().regex(/^\d{11}$/, "RUC debe tener 11 dígitos"),
  direccion: z.string().min(1, "Requerido").max(300),
  contactoNombre: z.string().min(1, "Requerido").max(100),
  telefono: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  perceptor: z.boolean(),
  observaciones: z.string().max(500).optional().or(z.literal("")),
});

type BeneficiarioForm = z.infer<typeof beneficiarioSchema>;

export default function BeneficiariosList() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const table = useReactTable({
    data: mockBeneficiarios, columns, state: { globalFilter }, onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: 20 } },
  });

  const form = useForm<BeneficiarioForm>({
    resolver: zodResolver(beneficiarioSchema),
    defaultValues: { razonSocial: "", ruc: "", direccion: "", contactoNombre: "", telefono: "", email: "", perceptor: false, observaciones: "" },
    mode: "onBlur",
  });

  const onSubmit = (data: BeneficiarioForm) => {
    console.log(data);
    toast.success("Beneficiario creado exitosamente");
    setDialogOpen(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Beneficiarios</h2>
          <p className="text-sm text-muted-foreground">Entidades receptoras de donaciones</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Nuevo Beneficiario</Button>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center border-b border-border px-4 py-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar beneficiario..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9" />
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
              <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">No se encontraron beneficiarios.</TableCell></TableRow>
            ) : table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30">
                {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">{mockBeneficiarios.length} beneficiario{mockBeneficiarios.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo Beneficiario</DialogTitle>
            <DialogDescription>Registrar una nueva entidad receptora de donaciones.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="razonSocial" render={({ field }) => (
                <FormItem><FormLabel>Razón social *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="ruc" render={({ field }) => (
                <FormItem><FormLabel>RUC *</FormLabel><FormControl><Input {...field} maxLength={11} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="direccion" render={({ field }) => (
                <FormItem><FormLabel>Dirección *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="contactoNombre" render={({ field }) => (
                <FormItem><FormLabel>Contacto nombre *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="telefono" render={({ field }) => (
                  <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="perceptor" render={({ field }) => (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <FormLabel className="cursor-pointer">Perceptor SUNAT</FormLabel>
                        <FormDescription className="text-xs">Deducible del IR (Art. 37 LIR)</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">Si está activo, las donaciones a esta entidad son deducibles del Impuesto a la Renta (Art. 37 LIR)</TooltipContent>
                </Tooltip>
              )} />
              <FormField control={form.control} name="observaciones" render={({ field }) => (
                <FormItem><FormLabel>Observaciones</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
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
