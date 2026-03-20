import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Info, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { mockRutas } from "./RutasList";

interface Excepcion {
  id: number;
  semana: number;
  anio: number;
  motivo: string;
  registradoPor: string;
}

const initialExcepciones: Excepcion[] = [
  { id: 1, semana: 52, anio: 2025, motivo: "Fiestas de fin de año", registradoPor: "María García" },
  { id: 2, semana: 1, anio: 2026, motivo: "Semana de inventario", registradoPor: "Admin" },
];

export default function RutaProgramacion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ruta = mockRutas.find((r) => r.id === Number(id));
  const [excepciones, setExcepciones] = useState(initialExcepciones);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [semana, setSemana] = useState("");
  const [anio, setAnio] = useState("2026");
  const [motivo, setMotivo] = useState("");

  const addExcepcion = () => {
    if (!semana || !anio || !motivo) return;
    setExcepciones([...excepciones, {
      id: Date.now(),
      semana: Number(semana),
      anio: Number(anio),
      motivo,
      registradoPor: "Admin",
    }]);
    toast.success("Semana marcada como inactiva");
    setDialogOpen(false);
    setSemana(""); setMotivo("");
  };

  const reactivar = (excId: number) => {
    setExcepciones((prev) => prev.filter((e) => e.id !== excId));
    toast.success("Semana reactivada");
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/maestros/rutas">Rutas</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{ruta?.nombre || "Ruta"}</BreadcrumbPage></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Programación</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/maestros/rutas")}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Programación de {ruta?.codigo}</h2>
            <p className="text-sm text-muted-foreground">{ruta?.nombre} — Excepciones semanales</p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Marcar semana inactiva</Button>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <Info className="mt-0.5 h-5 w-5 text-primary" />
        <p className="text-sm text-foreground">
          Por defecto todas las semanas están activas. Solo se registran las semanas desactivadas como excepción.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Semana</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Año</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Motivo</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registrado por</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {excepciones.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No hay excepciones registradas. Todas las semanas están activas.</TableCell></TableRow>
            ) : excepciones.map((exc) => (
              <TableRow key={exc.id} className="hover:bg-muted/30">
                <TableCell><Badge variant="secondary">Semana {exc.semana}</Badge></TableCell>
                <TableCell>{exc.anio}</TableCell>
                <TableCell>{exc.motivo}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{exc.registradoPor}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => reactivar(exc.id)}>
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />Reactivar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">{excepciones.length} excepcion{excepciones.length !== 1 ? "es" : ""}</p>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Marcar semana inactiva</DialogTitle>
            <DialogDescription>La ruta no operará durante esta semana.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Semana *</Label>
                <Input type="number" min={1} max={53} value={semana} onChange={(e) => setSemana(e.target.value)} placeholder="1-53" />
              </div>
              <div className="space-y-2">
                <Label>Año *</Label>
                <Input type="number" min={2025} max={2030} value={anio} onChange={(e) => setAnio(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Motivo *</Label>
              <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Razón de la inactividad" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={addExcepcion} disabled={!semana || !motivo}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
