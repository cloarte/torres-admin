import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, ChevronRight, X, PlusCircle, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";

/* ── Data ── */
const allClients = [
  { id: 1, nombre: "Supermercados Plaza", ruc: "20512345678", canal: "Moderno", credito: 30, email: "compras@plaza.com" },
  { id: 2, nombre: "Bodega San Martín", ruc: "10234567890", canal: "Tradicional", credito: 0, email: "" },
  { id: 3, nombre: "Distribuidora Lima", ruc: "20387654321", canal: "Directa", credito: 15, email: "ventas@distlima.com" },
];

const allProducts = [
  { sku: "PAX-001", nombre: "Panetón Clásico 900g", precio: 12.50 },
  { sku: "PAX-002", nombre: "Panetón Chocolate 900g", precio: 14.00 },
  { sku: "MOL-001", nombre: "Pan Molde Blanco 500g", precio: 4.00 },
  { sku: "EMP-001", nombre: "Empanada Pollo x12", precio: 10.00 },
];

const canalBadge: Record<string, string> = {
  Corporativo: "bg-primary/10 text-primary border border-primary/20",
  Moderno: "bg-accent/10 text-accent border border-accent/20",
  Tradicional: "bg-success/10 text-success border border-success/20",
  Directa: "bg-warning/10 text-warning border border-warning/20",
};

const fmt = (n: number) => `S/ ${n.toFixed(2)}`;

const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
};

interface ProductRow {
  productIdx: number;
  cantidad: number;
  precio: number;
}

export default function CotizacionNuevaPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1
  const [clientOpen, setClientOpen] = useState(false);
  const [client, setClient] = useState<typeof allClients[0] | null>(null);

  // Step 2
  const [rows, setRows] = useState<ProductRow[]>([]);

  // Step 3
  const [showPrices, setShowPrices] = useState(true);
  const [notas, setNotas] = useState("");
  const [email, setEmail] = useState("");

  const addRow = () => setRows([...rows, { productIdx: -1, cantidad: 1, precio: 0 }]);
  const removeRow = (idx: number) => setRows(rows.filter((_, i) => i !== idx));
  const updateRow = (idx: number, field: keyof ProductRow, val: number) => {
    const copy = [...rows];
    copy[idx] = { ...copy[idx], [field]: val };
    if (field === "productIdx" && val >= 0) {
      copy[idx].precio = allProducts[val].precio;
    }
    setRows(copy);
  };

  const subtotals = rows.map(r => r.productIdx >= 0 ? r.cantidad * r.precio : 0);
  const totalConIgv = subtotals.reduce((a, b) => a + b, 0);
  const totalSinIgv = totalConIgv / 1.18;
  const totalIgv = totalConIgv - totalSinIgv;

  const venceDate = addDays(15);

  const steps = [
    { num: 1, label: "Cliente" },
    { num: 2, label: "Productos" },
    { num: 3, label: "Vista Previa" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Nueva Cotización</h2>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {step > s.num ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-foreground"><Check className="h-3.5 w-3.5" /></span>
              ) : (
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step === s.num ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>{s.num}</span>
              )}
              <span className={`text-sm font-medium ${step === s.num ? "text-foreground" : step > s.num ? "text-muted-foreground" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="mx-auto max-w-lg space-y-4">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <Popover open={clientOpen} onOpenChange={setClientOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">{client ? client.nombre : "Buscar cliente por nombre o RUC..."}</Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar..." />
                  <CommandList>
                    <CommandEmpty>No encontrado.</CommandEmpty>
                    <CommandGroup>
                      {allClients.map(c => (
                        <CommandItem key={c.id} value={`${c.nombre} ${c.ruc}`} onSelect={() => { setClient(c); setEmail(c.email); setClientOpen(false); }}>
                          {c.nombre} <span className="ml-auto text-xs text-muted-foreground">{c.ruc}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {client && (
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={canalBadge[client.canal] || ""}>{client.canal}</Badge>
                  <span className="text-sm text-muted-foreground">RUC: {client.ruc}</span>
                  <span className="text-sm text-muted-foreground">Crédito: {client.credito} días</span>
                </div>
                <p className="text-sm text-muted-foreground">Vigencia: 15 días — vence el {venceDate}</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/pricing/cotizaciones")}>Cancelar</Button>
            <Button disabled={!client} onClick={() => setStep(2)}>Siguiente →</Button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Button variant="outline" size="sm" onClick={addRow}><PlusCircle className="mr-2 h-4 w-4" /> Agregar Producto</Button>
            <div className="rounded-lg border border-border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Producto</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right w-24">Cant.</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right w-32">Precio c/IGV</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right w-32">Subtotal</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Agrega productos a la cotización.</TableCell></TableRow>
                  ) : (
                    rows.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <select className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" value={r.productIdx} onChange={e => updateRow(idx, "productIdx", parseInt(e.target.value))}>
                            <option value={-1}>Seleccionar...</option>
                            {allProducts.map((p, pi) => <option key={pi} value={pi}>{p.sku} — {p.nombre}</option>)}
                          </select>
                        </TableCell>
                        <TableCell><Input type="number" min={1} value={r.cantidad} onChange={e => updateRow(idx, "cantidad", parseInt(e.target.value) || 1)} className="text-right font-mono h-8" /></TableCell>
                        <TableCell><Input type="number" step="0.01" value={r.precio} onChange={e => updateRow(idx, "precio", parseFloat(e.target.value) || 0)} className="text-right font-mono h-8" /></TableCell>
                        <TableCell className="text-right font-mono tabular-nums font-semibold">{fmt(subtotals[idx])}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeRow(idx)}><X className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="space-y-4">
            <div className="sticky top-6 rounded-lg border border-border bg-card p-5 space-y-3 shadow-sm">
              <h3 className="font-semibold text-foreground">Resumen</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal sin IGV</span><span className="font-mono tabular-nums">{fmt(totalSinIgv)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">IGV (18%)</span><span className="font-mono tabular-nums">{fmt(totalIgv)}</span></div>
                <hr className="border-border" />
                <div className="flex justify-between"><span className="font-semibold">TOTAL</span><span className="text-xl font-bold font-mono tabular-nums text-primary">{fmt(totalConIgv)}</span></div>
              </div>
            </div>
          </div>
          <div className="col-span-3 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>← Anterior</Button>
            <Button disabled={rows.length === 0 || rows.every(r => r.productIdx < 0)} onClick={() => setStep(3)}>Siguiente →</Button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="rounded-lg border border-border bg-card p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-primary">COTIZACIÓN</h3>
                <p className="text-sm text-muted-foreground">COT-2026-XXXX</p>
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Cliente:</span> {client?.nombre}</p>
                <p><span className="text-muted-foreground">Fecha:</span> {new Date().toLocaleDateString("es-PE")}</p>
                <p><span className="text-muted-foreground">Válida hasta:</span> {venceDate}</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Producto</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Cant.</TableHead>
                    {showPrices && <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Precio unit.</TableHead>}
                    {showPrices && <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Subtotal</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.filter(r => r.productIdx >= 0).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">{allProducts[r.productIdx].nombre}</TableCell>
                      <TableCell className="text-right font-mono">{r.cantidad}</TableCell>
                      {showPrices && <TableCell className="text-right font-mono">{fmt(r.precio)}</TableCell>}
                      {showPrices && <TableCell className="text-right font-mono font-semibold">{fmt(r.cantidad * r.precio)}</TableCell>}
                    </TableRow>
                  ))}
                  {showPrices && (
                    <TableRow className="font-bold">
                      <TableCell colSpan={3} className="text-right">Total c/IGV</TableCell>
                      <TableCell className="text-right font-mono">{fmt(totalConIgv)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {notas && <p className="text-sm text-muted-foreground border-t border-border pt-3">{notas}</p>}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Mostrar precios en el documento</label>
                <Switch checked={showPrices} onCheckedChange={setShowPrices} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notas adicionales</label>
                <Textarea rows={3} value={notas} onChange={e => setNotas(e.target.value)} placeholder="Condiciones comerciales..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email del cliente</label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="cliente@email.com" />
              </div>
            </div>
          </div>
          <div className="col-span-3 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>← Anterior</Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { toast.success("Cotización guardada."); navigate("/pricing/cotizaciones"); }}>Guardar sin enviar</Button>
              <Button onClick={() => { toast.success(`Cotización enviada a ${email || "cliente"}.`); navigate("/pricing/cotizaciones"); }}>
                <Send className="mr-2 h-4 w-4" /> Enviar al Cliente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
