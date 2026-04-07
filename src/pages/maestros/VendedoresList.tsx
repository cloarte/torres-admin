import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ── Data ──────────────────────────────────────────────
const CANALES = ["Corporativo", "Moderno", "Tradicional", "Directa"] as const;

const RUTAS = [
  { id: "LIM-01", nombre: "Miraflores - San Isidro", canal: "Tradicional" },
  { id: "LIM-02", nombre: "La Victoria - Cercado", canal: "Tradicional" },
  { id: "LIM-03", nombre: "San Borja - Surco", canal: "Tradicional" },
  { id: "PRV-01", nombre: "Arequipa Centro", canal: "Tradicional" },
  { id: "PRV-02", nombre: "Trujillo Norte", canal: "Tradicional" },
  { id: "MOD-01", nombre: "Plaza Vea Lima Norte", canal: "Moderno" },
  { id: "MOD-02", nombre: "Wong Miraflores", canal: "Moderno" },
  { id: "DIR-01", nombre: "Distribuidores Lima Este", canal: "Directa" },
];

const CANAL_COLORS: Record<string, string> = {
  Tradicional: "bg-amber-100 text-amber-700",
  Moderno: "bg-blue-100 text-blue-700",
  Corporativo: "bg-purple-100 text-purple-700",
  Directa: "bg-green-100 text-green-700",
};

type Vendedor = {
  id: number;
  nombre: string;
  codigo: string;
  email: string;
  canales: string[];
  rutas: string[];
  estado: "ACTIVO" | "INACTIVO";
};

const INITIAL_VENDEDORES: Vendedor[] = [
  { id: 1, nombre: "Juan López", codigo: "V-001", email: "jlopez@torres.com", canales: ["Tradicional"], rutas: ["LIM-01"], estado: "ACTIVO" },
  { id: 2, nombre: "Pedro Soto", codigo: "V-002", email: "psoto@torres.com", canales: ["Moderno", "Corporativo"], rutas: ["MOD-01"], estado: "ACTIVO" },
  { id: 3, nombre: "María Torres", codigo: "V-003", email: "mtorres@torres.com", canales: ["Tradicional"], rutas: ["PRV-01", "PRV-02"], estado: "ACTIVO" },
];

// ── Schema ────────────────────────────────────────────
const schema = z.object({
  canales: z.array(z.string()).min(1, "Selecciona al menos un canal"),
  rutas: z.array(z.string()),
});
type FormValues = z.infer<typeof schema>;

// ── Component ─────────────────────────────────────────
export default function VendedoresPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>(INITIAL_VENDEDORES);
  const [open, setOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<Vendedor | null>(null);
  const [search, setSearch] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { canales: [], rutas: [] },
  });

  const watchedCanales = form.watch("canales");
  const rutasDisponibles = RUTAS.filter((r) => watchedCanales.includes(r.canal));

  const filtered = vendedores.filter(
    (v) =>
      v.nombre.toLowerCase().includes(search.toLowerCase()) ||
      v.codigo.toLowerCase().includes(search.toLowerCase())
  );

  function openEdit(v: Vendedor) {
    setSelected(v);
    form.reset({ canales: v.canales, rutas: v.rutas });
    setOpen(true);
  }

  function onSubmit(data: FormValues) {
    if (!selected) return;
    setVendedores((prev) =>
      prev.map((v) =>
        v.id === selected.id ? { ...v, canales: data.canales, rutas: data.rutas } : v
      )
    );
    toast.success(`Vendedor ${selected.nombre} actualizado`);
    setOpen(false);
  }

  function handleCanalChange(
    canal: string,
    checked: boolean,
    field: { value: string[]; onChange: (v: string[]) => void }
  ) {
    const newCanales = checked
      ? [...field.value, canal]
      : field.value.filter((c) => c !== canal);
    field.onChange(newCanales);

    const currentRutas = form.getValues("rutas");
    const validRutas = currentRutas.filter((rId) => {
      const ruta = RUTAS.find((r) => r.id === rId);
      return ruta && newCanales.includes(ruta.canal);
    });
    form.setValue("rutas", validRutas);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Vendedores</h2>
          <p className="text-sm text-muted-foreground">
            Gestión de canales y rutas asignadas. Para crear un vendedor, hazlo desde Usuarios.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar vendedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nombre</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Código</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Canales</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rutas</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((v) => (
              <TableRow key={v.id} className="hover:bg-muted/30">
                <TableCell>
                  <p className="font-medium text-foreground">{v.nombre}</p>
                  <p className="text-xs text-muted-foreground">{v.email}</p>
                </TableCell>
                <TableCell>{v.codigo}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {v.canales.map((c) => (
                      <Badge key={c} variant="secondary" className={CANAL_COLORS[c] || ""}>
                        {c}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {v.rutas.length === 0 ? (
                    <span className="text-muted-foreground">Sin rutas</span>
                  ) : (
                    <div className="space-y-0.5">
                      {v.rutas.map((rId) => {
                        const ruta = RUTAS.find((r) => r.id === rId);
                        return ruta ? (
                          <p key={rId} className="text-sm">
                            • {ruta.id} {ruta.nombre}
                          </p>
                        ) : null;
                      })}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={v.estado === "ACTIVO" ? "default" : "secondary"}
                    className={
                      v.estado === "ACTIVO"
                        ? "bg-success/10 text-success border border-success/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                    }
                  >
                    {v.estado}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => openEdit(v)}>
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar Vendedor</SheetTitle>
            <SheetDescription>
              {selected?.nombre} — {selected?.codigo}
            </SheetDescription>
          </SheetHeader>

          {/* Read-only info */}
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <p>Nombre: {selected?.nombre}</p>
            <p>Email: {selected?.email}</p>
            <p>Código: {selected?.codigo}</p>
          </div>

          {open && selected && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
                {/* Canales */}
                <FormField
                  control={form.control}
                  name="canales"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canales *</FormLabel>
                      <div className="space-y-2">
                        {CANALES.map((canal) => (
                          <div key={canal} className="flex items-center gap-2">
                            <Checkbox
                              checked={field.value.includes(canal)}
                              onCheckedChange={(checked) =>
                                handleCanalChange(canal, !!checked, field)
                              }
                            />
                            <span className="text-sm">{canal}</span>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Rutas */}
                {watchedCanales.length > 0 && (
                  <FormField
                    control={form.control}
                    name="rutas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rutas asignadas</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Solo se muestran rutas de los canales seleccionados. Un vendedor puede tener múltiples rutas.
                        </p>
                        {rutasDisponibles.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">
                            No hay rutas disponibles para los canales seleccionados.
                          </p>
                        ) : (
                          <div className="space-y-2 mt-2">
                            {rutasDisponibles.map((ruta) => (
                              <div key={ruta.id} className="flex items-center gap-2">
                                <Checkbox
                                  checked={field.value.includes(ruta.id)}
                                  onCheckedChange={(checked) => {
                                    const next = checked
                                      ? [...field.value, ruta.id]
                                      : field.value.filter((id) => id !== ruta.id);
                                    field.onChange(next);
                                  }}
                                />
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">
                                    {ruta.id} — {ruta.nombre}
                                  </span>
                                  <Badge variant="secondary" className={CANAL_COLORS[ruta.canal] || ""}>
                                    {ruta.canal}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar cambios</Button>
                </div>
              </form>
            </Form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
