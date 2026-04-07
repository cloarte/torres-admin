import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Copy, KeyRound, Mail, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeactivateDialog } from "@/components/maestros/DeactivateDialog";
import { toast } from "sonner";
import { mockClientes } from "./ClientesList";

const mockHistory = [
  { id: 1, campo: "Canal", antes: "Tradicional", despues: "Moderno", fecha: "15/03/2026 10:30", usuario: "María García" },
  { id: 2, campo: "Días crédito", antes: "0", despues: "30", fecha: "10/03/2026 14:15", usuario: "María García" },
  { id: 3, campo: "Contacto nombre", antes: "Pedro Gómez", despues: "Ana Vargas", fecha: "01/03/2026 09:00", usuario: "Admin" },
];

export default function ClienteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cliente = mockClientes.find((c) => c.id === Number(id));
  const [portalDialogOpen, setPortalDialogOpen] = useState(false);
  const [deactivatePortalOpen, setDeactivatePortalOpen] = useState(false);
  const [portalEmail, setPortalEmail] = useState("");
  const tempPassword = "Torres2026!tmp";

  if (!cliente) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Cliente no encontrado</p>
        <Button variant="outline" onClick={() => navigate("/maestros/clientes")}>Volver a Clientes</Button>
      </div>
    );
  }

  const handleCreatePortal = () => {
    toast.success(`Acceso creado. Contraseña temporal: ${tempPassword} (cópiala ahora)`);
    setPortalDialogOpen(false);
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="grid grid-cols-3 gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="col-span-2 text-sm text-foreground">{value || "—"}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/maestros/clientes")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{cliente.razonSocial}</h2>
          <p className="text-sm text-muted-foreground">RUC: {cliente.ruc}</p>
        </div>
        <Badge className={`ml-auto ${cliente.status === "ACTIVO" ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
          <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${cliente.status === "ACTIVO" ? "bg-success" : "bg-destructive"}`} />
          {cliente.status}
        </Badge>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Información General</TabsTrigger>
          <TabsTrigger value="portal">Acceso Portal</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Building2 className="h-4 w-4" />Datos del cliente</CardTitle></CardHeader>
            <CardContent>
              <InfoRow label="Razón social" value={cliente.razonSocial} />
              <InfoRow label="RUC" value={cliente.ruc} />
              <InfoRow label="Canal" value={cliente.canal} />
              <InfoRow label="Dirección" value={cliente.direccion} />
              <InfoRow label="Teléfono" value={cliente.telefono} />
              <InfoRow label="Email" value={cliente.email} />
              <InfoRow label="Contacto" value={`${cliente.contactoNombre} — ${cliente.contactoCargo}`} />
              <InfoRow label="Días de crédito" value={cliente.diasCredito === "0" ? "Pago inmediato" : `${cliente.diasCredito} días`} />
              <InfoRow label="Observaciones" value={cliente.observaciones || "Sin observaciones"} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portal" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><KeyRound className="h-4 w-4" />Acceso al Portal</CardTitle></CardHeader>
            <CardContent>
              {cliente.portalAccess ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="flex items-center gap-2 font-medium text-foreground">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {cliente.portalEmail}
                      </p>
                      <p className="text-sm text-muted-foreground">Último acceso: {cliente.portalLastLogin}</p>
                    </div>
                    <Badge className="bg-success/10 text-success border border-success/20">
                      <ShieldCheck className="mr-1 h-3 w-3" />ACTIVO
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast.success("Contraseña reseteada")}>Resetear contraseña</Button>
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeactivatePortalOpen(true)}>Desactivar acceso</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <KeyRound className="mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Este cliente no tiene acceso al portal</p>
                  <Button className="mt-4" onClick={() => setPortalDialogOpen(true)}>Crear acceso portal</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Historial de cambios</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-semibold uppercase">Campo</TableHead>
                    <TableHead className="text-xs font-semibold uppercase">Antes</TableHead>
                    <TableHead className="text-xs font-semibold uppercase">Después</TableHead>
                    <TableHead className="text-xs font-semibold uppercase">Fecha</TableHead>
                    <TableHead className="text-xs font-semibold uppercase">Usuario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockHistory.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium">{h.campo}</TableCell>
                      <TableCell className="text-muted-foreground">{h.antes}</TableCell>
                      <TableCell>{h.despues}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{h.fecha}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{h.usuario}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={portalDialogOpen} onOpenChange={setPortalDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear acceso portal</DialogTitle>
            <DialogDescription>Se generará una contraseña temporal para el cliente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email de acceso *</Label>
              <Input type="email" value={portalEmail} onChange={(e) => setPortalEmail(e.target.value)} placeholder="email@empresa.com" />
            </div>
            <div className="space-y-2">
              <Label>Contraseña temporal</Label>
              <div className="flex gap-2">
                <Input value={tempPassword} readOnly className="font-mono" />
                <Button type="button" variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(tempPassword); toast.info("Contraseña copiada"); }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPortalDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreatePortal} disabled={!portalEmail}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeactivateDialog open={deactivatePortalOpen} onOpenChange={setDeactivatePortalOpen}
        title="¿Desactivar acceso al portal?"
        description="El cliente ya no podrá iniciar sesión en el portal."
        onConfirm={() => { toast.success("Acceso al portal desactivado"); setDeactivatePortalOpen(false); }} />
    </div>
  );
}
