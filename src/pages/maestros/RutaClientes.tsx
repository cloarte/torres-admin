import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowUp, ArrowDown, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { mockRutas } from "./RutasList";

interface RutaCliente {
  id: number;
  orden: number;
  cliente: string;
  direccion: string;
  telefono: string;
}

const initialClientes: RutaCliente[] = [
  { id: 1, orden: 1, cliente: "Supermercados Plaza", direccion: "Av. Javier Prado 1234, San Isidro", telefono: "01-4567890" },
  { id: 2, orden: 2, cliente: "Bodega San Martín", direccion: "Jr. Huallaga 567, Cercado de Lima", telefono: "01-3456789" },
  { id: 3, orden: 3, cliente: "Minimarket El Sol", direccion: "Av. Arequipa 890, Miraflores", telefono: "01-2345678" },
];

export default function RutaClientes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ruta = mockRutas.find((r) => r.id === Number(id));
  const [clientes, setClientes] = useState(initialClientes);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState("");

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...clientes];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    next.forEach((c, i) => (c.orden = i + 1));
    setClientes(next);
  };

  const moveDown = (index: number) => {
    if (index === clientes.length - 1) return;
    const next = [...clientes];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    next.forEach((c, i) => (c.orden = i + 1));
    setClientes(next);
  };

  const removeCliente = (id: number) => {
    setClientes((prev) => prev.filter((c) => c.id !== id).map((c, i) => ({ ...c, orden: i + 1 })));
    toast.success("Cliente removido de la ruta");
  };

  const addCliente = () => {
    if (!selectedCliente) return;
    const newCliente: RutaCliente = {
      id: Date.now(),
      orden: clientes.length + 1,
      cliente: selectedCliente,
      direccion: "Dirección del cliente",
      telefono: "01-0000000",
    };
    setClientes([...clientes, newCliente]);
    toast.success("Cliente agregado a la ruta");
    setAddDialogOpen(false);
    setSelectedCliente("");
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/maestros/rutas">Rutas</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{ruta?.nombre || "Ruta"}</BreadcrumbPage></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Clientes</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/maestros/rutas")}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Clientes de {ruta?.codigo}</h2>
            <p className="text-sm text-muted-foreground">{ruta?.nombre} — Orden de visita</p>
          </div>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Agregar Cliente</Button>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-20">Orden</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dirección</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Teléfono</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-32">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No hay clientes asignados a esta ruta.</TableCell></TableRow>
            ) : clientes.map((c, idx) => (
              <TableRow key={c.id} className="hover:bg-muted/30">
                <TableCell><Badge variant="secondary">{c.orden}</Badge></TableCell>
                <TableCell className="font-medium">{c.cliente}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.direccion}</TableCell>
                <TableCell className="text-sm">{c.telefono}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveUp(idx)} disabled={idx === 0}><ArrowUp className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveDown(idx)} disabled={idx === clientes.length - 1}><ArrowDown className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeCliente(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">{clientes.length} cliente{clientes.length !== 1 ? "s" : ""} en la ruta</p>
        </div>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Cliente a la Ruta</DialogTitle>
            <DialogDescription>Solo clientes del canal Tradicional sin ruta asignada.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedCliente} onValueChange={setSelectedCliente}>
              <SelectTrigger><SelectValue placeholder="Selecciona un cliente" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Distribuidora Lima">Distribuidora Lima</SelectItem>
                <SelectItem value="Panadería Central">Panadería Central</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancelar</Button>
            <Button onClick={addCliente} disabled={!selectedCliente}>Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
