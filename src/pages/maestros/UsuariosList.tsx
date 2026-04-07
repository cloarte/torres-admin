import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  nombre: z.string().min(3, "Mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  rol: z.string().min(1, "Selecciona un rol"),
  estado: z.string().min(1, "Selecciona un estado"),
});

type FormValues = z.infer<typeof schema>;

const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "GERENTE_GENERAL", label: "Gerente General" },
  { value: "ALMACEN", label: "Almacén" },
  { value: "CONSOLIDADOR", label: "Consolidador" },
  { value: "VENDEDOR", label: "Vendedor" },
  { value: "INSPECTOR", label: "Inspector" },
  { value: "CAJERO", label: "Cajero" },
];

const ROL_COLORS: Record<string, string> = {
  ADMIN: "bg-primary text-primary-foreground",
  GERENTE_GENERAL: "bg-accent text-accent-foreground",
  ALMACEN: "bg-success/10 text-success",
  CONSOLIDADOR: "bg-muted text-muted-foreground",
  VENDEDOR: "bg-warning/10 text-warning",
  INSPECTOR: "bg-destructive/10 text-destructive",
  CAJERO: "bg-secondary text-secondary-foreground",
};

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
  ultimoAcceso: string;
};

const INITIAL_USERS: Usuario[] = [
  { id: 1, nombre: "María García", email: "maria@torres.com", rol: "ADMIN", estado: "ACTIVO", ultimoAcceso: "hace 2 horas" },
  { id: 2, nombre: "Juan López", email: "jlopez@torres.com", rol: "VENDEDOR", estado: "ACTIVO", ultimoAcceso: "hace 1 día" },
  { id: 3, nombre: "Rosnelli Flores", email: "rosnelli@torres.com", rol: "ALMACEN", estado: "ACTIVO", ultimoAcceso: "hace 3 horas" },
];

export default function UsuariosPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: "", email: "", password: "", rol: "", estado: "ACTIVO" },
  });

  function onSubmit(data: FormValues) {
    const nuevo: Usuario = {
      id: Date.now(),
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
      estado: data.estado,
      ultimoAcceso: "ahora",
    };
    setUsers((prev) => [nuevo, ...prev]);
    toast.success("Usuario creado exitosamente");
    form.reset();
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Usuarios</h2>
          <p className="text-sm text-muted-foreground">Gestión de usuarios y permisos del sistema</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ Nuevo Usuario</Button>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Rol</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Estado</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Último Acceso</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{u.nombre}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge className={ROL_COLORS[u.rol] || ""}>{u.rol}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.estado === "ACTIVO" ? "default" : "secondary"}>
                    {u.estado}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.ultimoAcceso}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nuevo Usuario</SheetTitle>
            <SheetDescription>Completa los campos para crear un nuevo usuario del sistema.</SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
              <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl><Input type="email" placeholder="usuario@torres.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña *</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="rol" render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol *</FormLabel>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccionar rol..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent position="popper" className="z-[9999]">
                      {ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="estado" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccionar estado..." /></SelectTrigger>
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
                <Button type="button" variant="outline" onClick={() => { form.reset(); setOpen(false); }}>Cancelar</Button>
                <Button type="submit">Crear Usuario</Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
