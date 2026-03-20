import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Check, X, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ConditionRow {
  id: string;
  badge: string;
  badgeClass: string;
  description: string;
  defaultPct: number;
}

const conditions: ConditionRow[] = [
  {
    id: "defecto",
    badge: "DEFECTO_ESTÉTICO",
    badgeClass: "bg-warning/10 text-warning border border-warning/20",
    description: "Producto con daño visual leve, apto para consumo",
    defaultPct: 10,
  },
  {
    id: "vencer",
    badge: "PRÓXIMO_VENCER",
    badgeClass: "bg-destructive/10 text-destructive border border-destructive/20",
    description: "Producto con menos de 7 días antes del vencimiento",
    defaultPct: 15,
  },
];

const examplePrice = 12.50;

export default function DescuentosCondicionPage() {
  const [values, setValues] = useState<Record<string, number>>({
    defecto: 10,
    vencer: 15,
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [saved, setSaved] = useState<Record<string, number>>({ defecto: 10, vencer: 15 });

  const hasChanges = JSON.stringify(values) !== JSON.stringify(saved);

  const startEdit = (id: string) => {
    setEditing(id);
    setEditVal(String(values[id]));
  };

  const confirmEdit = (id: string) => {
    const n = parseInt(editVal);
    if (!isNaN(n) && n >= 0 && n <= 100) {
      setValues({ ...values, [id]: n });
    }
    setEditing(null);
  };

  const cancelEdit = () => setEditing(null);

  const calcExample = (pct: number) => (examplePrice * (1 - pct / 100)).toFixed(2);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Descuentos por Condición de Producto</h2>
        <p className="text-sm text-muted-foreground">Se aplican automáticamente cuando el Inspector de Calidad asigna una condición especial a un lote.</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="divide-y divide-border">
            {conditions.map(c => {
              const pct = values[c.id];
              const isEditing = editing === c.id;
              return (
                <div key={c.id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Badge className={c.badgeClass}>{c.badge}</Badge>
                      <p className="text-sm text-muted-foreground">{c.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            className="w-20 h-8 font-mono text-right"
                            autoFocus
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={() => confirmEdit(c.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="font-mono text-lg font-bold text-foreground">{pct}%</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(c.id)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ej: S/ {examplePrice.toFixed(2)} → <span className="font-medium text-foreground">S/ {calcExample(pct)}</span>
                  </p>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-5 py-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">Restaurar defaults</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Restaurar valores por defecto?</AlertDialogTitle>
                  <AlertDialogDescription>Se restaurarán los descuentos a 10% y 15%.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                    setValues({ defecto: 10, vencer: 15 });
                    setSaved({ defecto: 10, vencer: 15 });
                    toast.success("Valores restaurados a los defaults.");
                  }}>Restaurar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              disabled={!hasChanges}
              onClick={() => {
                setSaved({ ...values });
                toast.success("Descuentos actualizados correctamente.");
              }}
            >
              Guardar cambios
            </Button>
          </div>
        </div>

        {/* Warning note */}
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-3">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            El descuento aplica sobre el precio vigente del producto (canal o especial, el que corresponda).
          </p>
        </div>
      </div>
    </div>
  );
}
