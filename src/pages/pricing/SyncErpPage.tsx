import { useState } from "react";
import { toast } from "sonner";
import { RefreshCw, AlertCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SyncEntry {
  fecha: string;
  canales: string;
  precios: number;
  estado: "EXITOSO" | "ERROR" | "EN_PROCESO";
  errores: number;
}

const mockHistory: SyncEntry[] = [
  { fecha: "19/01/2026 08:02", canales: "4 canales", precios: 156, estado: "EXITOSO", errores: 0 },
  { fecha: "18/01/2026 02:00", canales: "4 canales", precios: 154, estado: "EXITOSO", errores: 0 },
  { fecha: "17/01/2026 02:00", canales: "4 canales", precios: 154, estado: "ERROR", errores: 3 },
  { fecha: "16/01/2026 02:00", canales: "4 canales", precios: 152, estado: "EXITOSO", errores: 0 },
];

const estadoBadge: Record<string, string> = {
  EXITOSO: "bg-success/10 text-success border border-success/20",
  ERROR: "bg-destructive/10 text-destructive border border-destructive/20",
  EN_PROCESO: "bg-warning/10 text-warning border border-warning/20",
};

const mockErrors = [
  "PAX-003: SKU no existe en el ERP — requiere creación manual",
  "MOL-002: Precio negativo detectado — validación fallida",
  "EMP-002: Timeout al conectar con endpoint /api/precios",
];

export default function SyncErpPage() {
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success("Sincronización completada. 156 precios exportados.");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sincronización con ERP</h2>
        <p className="text-sm text-muted-foreground">El sistema es el maestro de precios. El ERP recibe de solo lectura.</p>
      </div>

      {/* Status card */}
      <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary-light p-5">
        <div>
          <p className="text-sm text-muted-foreground">Última sincronización exitosa</p>
          <p className="text-lg font-bold text-foreground">19/01/2026 08:02 — 156 precios exportados</p>
        </div>
        <div className="text-right space-y-1">
          <Button onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Exportando..." : "Exportar Ahora"}
          </Button>
          <p className="text-xs text-muted-foreground">Sincronización automática: diaria a las 02:00 AM</p>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-3">
        <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">Solo se exportan precios por canal. Los precios especiales por cliente no se exportan al ERP por limitación del sistema legacy.</p>
      </div>

      {/* History table */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fecha y hora</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Canales exportados</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">N° precios</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Errores</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockHistory.map((row, i) => (
              <TableRow key={i} className="hover:bg-muted/30">
                <TableCell className="text-sm">{row.fecha}</TableCell>
                <TableCell className="text-sm">{row.canales}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{row.precios}</TableCell>
                <TableCell>
                  <Badge className={estadoBadge[row.estado] || ""}>
                    {row.estado === "EN_PROCESO" && <RefreshCw className="mr-1 h-3 w-3 animate-spin" />}
                    {row.estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{row.errores} errores</TableCell>
                <TableCell>
                  {row.estado === "ERROR" && (
                    <Button variant="ghost" size="sm" className="text-destructive gap-1.5 h-8" onClick={() => setErrorDialogOpen(true)}>
                      <AlertCircle className="h-3.5 w-3.5" /> Ver errores
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Error Detail Dialog */}
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Errores de Sincronización</AlertDialogTitle>
            <AlertDialogDescription>17/01/2026 02:00 — 3 errores detectados</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 my-4">
            {mockErrors.map((err, i) => (
              <div key={i} className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-3">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm">{err}</p>
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cerrar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { toast.info("Reintentando sincronización..."); setErrorDialogOpen(false); }}>
              Reintentar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
