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
const CANALES = ["Corporativo", "Moderno", "Tradicional", "Directa"] as const;

const CANAL_COLORS: Record<string, string> = {
  Corporativo: "bg-purple-100 text-purple-700",
  Moderno: "bg-blue-100 text-blue-700",
  Tradicional: "bg-amber-100 text-amber-700",
  Directa: "bg-green-100 text-green-700",
};

const CREDITO_LABELS: Record<string, string> = {
  "0": "Sin crédito",
  "15": "15 días",
  "30": "30 días",
  "60": "60 días",
};

const GEO_PERU: Record<string, Record<string, string[]>> = {
  "Lima": {
    "Lima":      ["Miraflores","San Isidro","Surco","La Molina","San Borja","Barranco","Chorrillos","Lince","Pueblo Libre","Jesús María","Magdalena","San Miguel","Breña","Rímac","SMP","Independencia","Los Olivos","Comas","Carabayllo","Ate","Santa Anita","El Agustino","San Juan de Lurigancho","Villa El Salvador","Villa María del Triunfo","Lurín","Pachacámac"],
    "Callao":    ["Callao","Bellavista","La Perla","La Punta","Carmen de la Legua","Ventanilla"],
    "Huaral":    ["Huaral","Chancay","Aucallama"],
    "Cañete":    ["San Vicente de Cañete","Imperial","Mala","Asia"],
  },
  "Arequipa": {
    "Arequipa":  ["Arequipa","Alto Selva Alegre","Cayma","Cerro Colorado","Jacobo Hunter","José Luis Bustamante","Mariano Melgar","Miraflores","Paucarpata","Sachaca","Socabaya","Tiabaya","Uchumayo","Yanahuara"],
    "Camaná":    ["Camaná","Samuel Pastor","Mariscal Cáceres","Nicolás de Pierola"],
  },
  "La Libertad": {
    "Trujillo":  ["Trujillo","El Porvenir","Florencia de Mora","Huanchaco","La Esperanza","Laredo","Moche","Salaverry","Simbal","Víctor Larco Herrera"],
    "Ascope":    ["Ascope","Chicama","Chocope","Magdalena de Cao","Paiján","Rázuri","Santiago de Cao"],
  },
  "Piura": {
    "Piura":     ["Piura","Castilla","Catacaos","Cura Mori","El Tallan","La Arena","La Unión","Las Lomas","Tambo Grande","Veintiséis de Octubre"],
    "Sullana":   ["Sullana","Bellavista","Ignacio Escudero","Lancones","Marcavelica","Miguel Checa","Querecotillo","Salitral"],
  },
  "Cusco": {
    "Cusco":     ["Cusco","Ccorca","Poroy","San Jerónimo","San Sebastián","Santiago","Saylla","Wanchaq"],
    "Urubamba":  ["Urubamba","Chinchero","Huayllabamba","Machupicchu","Maras","Ollantaytambo","Yucay"],
  },
  "Junín": {
    "Huancayo":  ["Huancayo","Carhuacallanga","Chacapampa","Chicche","Chilca","Chongos Alto","Chupuro","Colca","Cullhuas","El Tambo","Huacrapuquio","Hualhuas","Huancan","Huasicancha","Huayucachi","Ingenio","Pariahuanca","Pilcomayo","Pucará","Quichuay","Quilcas","San Agustín de Cajas","San Jerónimo de Tunán","Saño","Sapallanga","Sicaya","Santo Domingo de Acobamba","Viques"],
  },
  "Lambayeque": {
    "Chiclayo":  ["Chiclayo","Chongoyape","Eten","Eten Puerto","José Leonardo Ortiz","La Victoria","Lagunas","Monsefú","Nueva Arica","Oyotún","Picsi","Pimentel","Reque","Santa Rosa","Saña","Cayaltí","Tumán","Pomalca","Pátapo","Zaña"],
  },
  "Ica": {
    "Ica":       ["Ica","La Tinguiña","Los Aquijes","Ocucaje","Pachacútec","Parcona","Pueblo Nuevo","Salas","San José de los Molinos","San Juan Bautista","Santiago","Subtanjalla","Tate","Yauca del Rosario"],
    "Pisco":     ["Pisco","Huancano","Humay","Independencia","Paracas","San Andrés","San Clemente","Túpac Amaru Inca"],
  },
};

export type Cliente = {
  id: number;
  razonSocial: string;
  ruc: string;
  canal: string;
  direccion: string;
  telefono: string;
  email: string;
  diasCredito: string;
  tienePortal: boolean;
  estado: "ACTIVO" | "INACTIVO";
  status: "ACTIVO" | "INACTIVO";
  contactoNombre: string;
  contactoCargo: string;
  observaciones: string;
  portalAccess: boolean;
  portalEmail: string;
  portalLastLogin: string;
  departamento: string;
  provincia: string;
  distrito: string;
  geoX: string;
  geoY: string;
};

export const mockClientes: Cliente[] = [
  { id: 1, razonSocial: "Supermercados Plaza", ruc: "20512345678", canal: "Moderno", direccion: "Av. Javier Prado 1234", telefono: "01-4567890", email: "compras@plaza.com", diasCredito: "30", tienePortal: true, estado: "ACTIVO", status: "ACTIVO", contactoNombre: "Ana Pérez", contactoCargo: "Jefe de Compras", observaciones: "", portalAccess: true, portalEmail: "compras@plaza.com", portalLastLogin: "hace 2 días", departamento: "", provincia: "", distrito: "", geoX: "", geoY: "" },
  { id: 2, razonSocial: "Bodega San Martín", ruc: "10234567890", canal: "Tradicional", direccion: "Jr. San Martín 456", telefono: "987654321", email: "", diasCredito: "0", tienePortal: false, estado: "ACTIVO", status: "ACTIVO", contactoNombre: "Carlos Ruiz", contactoCargo: "Propietario", observaciones: "", portalAccess: false, portalEmail: "", portalLastLogin: "", departamento: "", provincia: "", distrito: "", geoX: "", geoY: "" },
  { id: 3, razonSocial: "Distribuidora Lima", ruc: "20387654321", canal: "Directa", direccion: "Av. Argentina 789", telefono: "01-3456789", email: "lima@distrib.com", diasCredito: "15", tienePortal: true, estado: "ACTIVO", status: "ACTIVO", contactoNombre: "Luis Torres", contactoCargo: "Gerente", observaciones: "", portalAccess: true, portalEmail: "lima@distrib.com", portalLastLogin: "hace 5 días", departamento: "", provincia: "", distrito: "", geoX: "", geoY: "" },
];

// ── Schema ────────────────────────────────────────────
const schema = z.object({
  razonSocial: z.string().min(3, "Razón social requerida"),
  ruc: z.string().length(11, "El RUC debe tener 11 dígitos").regex(/^\d+$/, "Solo números"),
  canal: z.string().min(1, "Selecciona un canal"),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.union([z.string().email("Email inválido"), z.literal("")]).optional(),
  diasCredito: z.string().min(1, "Selecciona una opción"),
  estado: z.enum(["ACTIVO", "INACTIVO"]),
});

type FormValues = z.infer<typeof schema>;

// ── Component ─────────────────────────────────────────
export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [search, setSearch] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      razonSocial: "", ruc: "", canal: "", direccion: "",
      telefono: "", email: "", diasCredito: "0", estado: "ACTIVO",
    },
  });

  const filtered = clientes.filter(
    (c) =>
      c.razonSocial.toLowerCase().includes(search.toLowerCase()) ||
      c.ruc.includes(search)
  );

  function openNew() {
    setEditing(null);
    form.reset({
      razonSocial: "", ruc: "", canal: "", direccion: "",
      telefono: "", email: "", diasCredito: "0", estado: "ACTIVO",
    });
    setOpen(true);
  }

  function openEdit(c: Cliente) {
    setEditing(c);
    form.reset({
      razonSocial: c.razonSocial,
      ruc: c.ruc,
      canal: c.canal,
      direccion: c.direccion,
      telefono: c.telefono,
      email: c.email,
      diasCredito: c.diasCredito,
      estado: c.estado,
    });
    setOpen(true);
  }

  function onSubmit(data: FormValues) {
    if (editing) {
      setClientes((prev) =>
        prev.map((c) =>
          c.id === editing.id
            ? { ...c, ...data, diasCredito: data.diasCredito, email: data.email ?? "" }
            : c
        )
      );
      toast.success("Cliente actualizado exitosamente");
    } else {
      const nuevo: Cliente = {
        id: Date.now(),
        razonSocial: data.razonSocial,
        ruc: data.ruc,
        canal: data.canal,
        direccion: data.direccion ?? "",
        telefono: data.telefono ?? "",
        email: data.email ?? "",
        diasCredito: data.diasCredito,
        tienePortal: false,
        estado: data.estado,
        status: data.estado,
        contactoNombre: "",
        contactoCargo: "",
        observaciones: "",
        portalAccess: false,
        portalEmail: "",
        portalLastLogin: "",
      };
      setClientes((prev) => [nuevo, ...prev]);
      toast.success("Cliente creado exitosamente");
    }
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Clientes</h2>
          <p className="text-sm text-muted-foreground">Gestión de clientes y acceso al portal</p>
        </div>
        <Button onClick={openNew}>+ Nuevo Cliente</Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por razón social o RUC..."
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
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Razón Social</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">RUC</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Canal</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Días Crédito</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Portal</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Estado</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-border hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="font-medium">{c.razonSocial}</p>
                  {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                </td>
                <td className="px-4 py-3 font-mono">{c.ruc}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={CANAL_COLORS[c.canal] || ""}>
                    {c.canal}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {CREDITO_LABELS[c.diasCredito] ?? c.diasCredito}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={c.tienePortal ? "bg-blue-50 text-blue-700" : ""}>
                    {c.tienePortal ? "Sí" : "No"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={c.estado === "ACTIVO" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {c.estado}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                    Editar
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No se encontraron clientes
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {filtered.length} cliente{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Sheet — Nuevo / Editar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editing ? "Editar Cliente" : "Nuevo Cliente"}
            </SheetTitle>
            <SheetDescription>
              {editing
                ? `Modificando: ${editing.razonSocial}`
                : "Completa los campos para registrar un nuevo cliente."}
            </SheetDescription>
          </SheetHeader>

          {open && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
                <FormField control={form.control} name="razonSocial" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razón Social *</FormLabel>
                    <FormControl><Input placeholder="Empresa S.A.C." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="ruc" render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUC *</FormLabel>
                    <FormControl><Input placeholder="20512345678" maxLength={11} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="canal" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canal *</FormLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar canal..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" className="z-[9999]">
                        {CANALES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="diasCredito" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días de crédito *</FormLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" className="z-[9999]">
                        <SelectItem value="0">Sin crédito</SelectItem>
                        <SelectItem value="15">15 días</SelectItem>
                        <SelectItem value="30">30 días</SelectItem>
                        <SelectItem value="60">60 días</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="direccion" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl><Input placeholder="Av. Principal 123" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="telefono" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl><Input placeholder="01-4567890" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input placeholder="contacto@empresa.com" {...field} /></FormControl>
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
                    {editing ? "Guardar cambios" : "Crear Cliente"}
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
