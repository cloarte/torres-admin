import { useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeactivateDialog } from "@/components/maestros/DeactivateDialog";
import { toast } from "sonner";

const DEFAULTS = {
  horaCorte: "18:00",
  diasAnticipacion: 1,
  diasAmarilla: 15,
  diasRoja: 7,
  diasDonacion: 5,
  diaNotificacion: "Lunes",
  horaNotificacion: "07:00",
  montoMaxSinAprobacion: 200,
  diasVigenciaCotizacion: 15,
};

export default function Configuracion() {
  const [config, setConfig] = useState({ ...DEFAULTS });
  const [hasChanges, setHasChanges] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const update = (key: string, value: string | number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    toast.success("Configuración actualizada. Los cambios aplican desde ahora.");
    setHasChanges(false);
  };

  const handleReset = () => {
    setConfig({ ...DEFAULTS });
    setHasChanges(true);
    setResetDialogOpen(false);
    toast.info("Valores restaurados a los predeterminados");
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="grid grid-cols-2 items-center gap-4">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configuración del Sistema</h2>
        <p className="text-sm text-muted-foreground">Parámetros globales por módulo</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Pedidos</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Hora de corte">
              <Input type="time" value={config.horaCorte} onChange={(e) => update("horaCorte", e.target.value)} />
            </Field>
            <Field label="Días de anticipación mínima">
              <Input type="number" min={0} value={config.diasAnticipacion} onChange={(e) => update("diasAnticipacion", Number(e.target.value))} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Vencidos</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Días alerta amarilla">
              <Input type="number" min={0} value={config.diasAmarilla} onChange={(e) => update("diasAmarilla", Number(e.target.value))} />
            </Field>
            <Field label="Días alerta roja">
              <Input type="number" min={0} value={config.diasRoja} onChange={(e) => update("diasRoja", Number(e.target.value))} />
            </Field>
            <Field label="Días apto para donación">
              <Input type="number" min={0} value={config.diasDonacion} onChange={(e) => update("diasDonacion", Number(e.target.value))} />
            </Field>
            <Field label="Día de notificación semanal">
              <Select value={config.diaNotificacion} onValueChange={(v) => update("diaNotificacion", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent position="popper">
                  {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Hora de notificación">
              <Input type="time" value={config.horaNotificacion} onChange={(e) => update("horaNotificacion", e.target.value)} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Gastos</CardTitle></CardHeader>
          <CardContent>
            <Field label="Monto máximo sin aprobación S/">
              <Input type="number" min={0} value={config.montoMaxSinAprobacion} onChange={(e) => update("montoMaxSinAprobacion", Number(e.target.value))} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Pricing</CardTitle></CardHeader>
          <CardContent>
            <Field label="Días de vigencia de cotización">
              <Input type="number" min={1} value={config.diasVigenciaCotizacion} onChange={(e) => update("diasVigenciaCotizacion", Number(e.target.value))} />
            </Field>
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-0 flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-md">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setResetDialogOpen(true)}>
            <RotateCcw className="mr-2 h-4 w-4" />Restaurar valores por defecto
          </Button>
        </div>
        <div className="text-right">
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />Guardar cambios
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">Última modificación: 18/03/2026 por María García</p>
        </div>
      </div>

      <DeactivateDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}
        title="¿Restaurar valores por defecto?"
        description="Todos los parámetros volverán a sus valores originales. Deberás guardar los cambios para que apliquen."
        onConfirm={handleReset} />
    </div>
  );
}
