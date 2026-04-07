import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Data ──────────────────────────────────────────────
const LINEAS_INICIAL = [
  { id: "1", nombre: "Panetones" },
  { id: "2", nombre: "Pan de Molde" },
  { id: "3", nombre: "Empanadas" },
  { id: "4", nombre: "Tortas" },
  { id: "5", nombre: "Galletas" },
];

const LINEA_COLORS: Record<string, string> = {
  Panetones: "bg-amber-100 text-amber-700",
  "Pan de Molde": "bg-slate-100 text-slate-700",
  Empanadas: "bg-orange-100 text-orange-700",
  Tortas: "bg-pink-100 text-pink-700",
  Galletas: "bg-yellow-100 text-yellow-700",
};

type Producto = {
  id: number;
  sku: string;
  nombre: string;
  lineaId: string;
  lineaNombre: string;
  presentacion: string;
  descripcion: string;
  estado: "ACTIVO" | "INACTIVO";
};

const INITIAL_PRODUCTOS: Producto[] = [
  { id: 1, sku: "PAX-001", nombre: "Panetón Clásico 900g", lineaId: "1", lineaNombre: "Panetones", presentacion: "Caja x6", descripcion: "", estado: "ACTIVO" },
  { id: 2, sku: "PAX-002", nombre: "Panetón Chocolate 900g", lineaId: "1", lineaNombre: "Panetones", presentacion: "Caja x6", descripcion: "", estado: "ACTIVO" },
  { id: 3, sku: "MOL-001", nombre: "Pan de Molde Blanco 500g", lineaId: "2", lineaNombre: "Pan de Molde", presentacion: "Bolsa", descripcion: "", estado: "ACTIVO" },
  { id: 4, sku: "EMP-001", nombre: "Empanada Pollo x12", lineaId: "3", lineaNombre: "Empanadas", presentacion: "Caja x12", descripcion: "", estado: "ACTIVO" },
  { id: 5, sku: "TOR-001", nombre: "Torta Tres Leches 1kg", lineaId: "4", lineaNombre: "Tortas", presentacion: "Unidad", descripcion: "", estado: "ACTIVO" },
];

// ── Schema ────────────────────────────────────────────
const schema = z.object({
  sku: z.string().min(2, "SKU requerido"),
  nombre: z.string().min(3, "Nombre requerido"),
  lineaId: z.string().min(1, "Selecciona una línea"),
  presentacion: z.string().min(1, "Presentación requerida"),
  descripcion: z.string().optional(),
  estado: z.enum(["ACTIVO", "INACTIVO"]),
});

type FormValues = z.infer<typeof schema>;

// ── Component ─────────────────────────────────────────
export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>(INITIAL_PRODUCTOS);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [search, setSearch] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { sku: "", nombre: "", lineaId: "", presentacion: "", descripcion: "", estado: "ACTIVO" },
  });

  function openNew() {
    setEditing(null);
    form.reset({ sku: "", nombre: "", lineaId: "", presentacion: "", descripcion: "", estado: "ACTIVO" });
    setOpen(true);
  }

  function openEdit(p: Producto) {
    setEditing(p);
    form.reset({
      sku: p.sku,
      nombre: p.nombre,
      lineaId: p.lineaId,
      presentacion: p.presentacion,
      descripcion: p.descripcion,
      estado: p.estado,
    });
    setOpen(true);
  }

  function onSubmit(data: FormValues) {
    const linea = LINEAS_INICIAL.find((l) => l.id === data.lineaId);
    const lineaNombre = linea?.nombre ?? "";

    if (editing) {
      setProductos((prev) =>
        prev.map((p) =>
          p.id === editing.id ? { ...p, ...data, lineaNombre } : p
        )
      );
      toast.success("Producto actualizado exitosamente");
    } else {
      const nuevo: Producto = {
        id: Date.now(),
        sku: data.sku,
        nombre: data.nombre,
        lineaId: data.lineaId,
        lineaNombre,
        presentacion: data.presentacion,
        descripcion: data.descripcion ?? "",
        estado: data.estado,
      };
      setProductos((prev) => [nuevo, ...prev]);
      toast.success("Producto creado exitosamente");
    }
    setOpen(false);
  }

  const filtered = productos.filter(
    (p) =>
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Productos</h2>
          <p className="text-sm text-muted-foreground">Catálogo de productos y presentaciones</p>
        </div>
        <Button onClick={openNew}>+ Nuevo Producto</Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por SKU o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">SKU</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Línea</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Presentación</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Estado</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border hover:bg-muted/30">
                <td className="px-4 py-3 font-mono font-medium">{p.sku}</td>
                <td className="px-4 py-3">{p.nombre}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={LINEA_COLORS[p.lineaNombre] || ""}>
                    {p.lineaNombre}
                  </Badge>
                </td>
                <td className="px-4 py-3">{p.presentacion}</td>
                <td className="px-4 py-3">
                  <Badge className={p.estado === "ACTIVO" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {p.estado}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                    Editar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet — Nuevo / Editar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editing ? "Editar Producto" : "Nuevo Producto"}
            </SheetTitle>
            <SheetDescription>
              {editing
                ? `Modificando: ${editing.sku} — ${editing.nombre}`
                : "Completa los campos para registrar un nuevo producto."}
            </SheetDescription>
          </SheetHeader>

          {open && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
                <FormField control={form.control} name="sku" render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU *</FormLabel>
                    <FormControl><Input placeholder="PAX-001" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="nombre" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl><Input placeholder="Panetón Clásico 900g" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="lineaId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Línea de producto *</FormLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar línea..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" className="z-[9999]">
                        {LINEAS_INICIAL.map((l) => (
                          <SelectItem key={l.id} value={l.id}>{l.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="presentacion" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presentación *</FormLabel>
                    <FormControl><Input placeholder="Caja x6, Bolsa, Unidad..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="descripcion" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl><Input placeholder="Descripción opcional" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="estado" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" className="z-[9999]">
                        <SelectItem value="ACTIVO">Activo</SelectItem>
                        <SelectItem value="INACTIVO">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editing ? "Guardar cambios" : "Crear Producto"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
