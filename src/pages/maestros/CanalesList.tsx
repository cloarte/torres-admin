import { useState } from "react";
import {
  useReactTable, getCoreRowModel, flexRender, createColumnHelper,
} from "@tanstack/react-table";
import { Check, Pencil, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface Canal {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  numClientes: number;
  status: "ACTIVO";
}

const initialCanales: Canal[] = [
  { id: 1, nombre: "Corporativo", codigo: "CORP", descripcion: "Clientes corporativos con contratos", numClientes: 15, status: "ACTIVO" },
  { id: 2, nombre: "Moderno", codigo: "MOD", descripcion: "Supermercados y tiendas de autoservicio", numClientes: 23, status: "ACTIVO" },
  { id: 3, nombre: "Tradicional", codigo: "TRAD", descripcion: "Bodegas y mercados", numClientes: 45, status: "ACTIVO" },
  { id: 4, nombre: "Directa", codigo: "DIR", descripcion: "Venta directa a consumidor final", numClientes: 8, status: "ACTIVO" },
];

const columnHelper = createColumnHelper<Canal>();

export default function CanalesList() {
  const [canales, setCanales] = useState(initialCanales);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (canal: Canal) => {
    setEditingId(canal.id);
    setEditValue(canal.descripcion);
  };

  const saveEdit = (id: number) => {
    setCanales((prev) => prev.map((c) => c.id === id ? { ...c, descripcion: editValue } : c));
    setEditingId(null);
    toast.success("Descripción actualizada");
  };

  const columns = [
    columnHelper.accessor("nombre", {
      header: "Nombre",
      cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor("codigo", {
      header: "Código",
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("descripcion", {
      header: "Descripción",
      cell: (info) => {
        const canal = info.row.original;
        if (editingId === canal.id) {
          return (
            <div className="flex items-center gap-2">
              <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-8" autoFocus />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveEdit(canal.id)}><Check className="h-4 w-4 text-success" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}><X className="h-4 w-4 text-destructive" /></Button>
            </div>
          );
        }
        return (
          <div className="group flex items-center gap-2">
            <span className="text-sm">{info.getValue()}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => startEdit(canal)}>
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
        );
      },
    }),
    columnHelper.accessor("numClientes", {
      header: "N° clientes",
      cell: (info) => <Badge variant="secondary">{info.getValue()}</Badge>,
    }),
    columnHelper.accessor("status", {
      header: "Estado",
      cell: (info) => (
        <Badge className="bg-success/10 text-success border border-success/20">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-success" />
          {info.getValue()}
        </Badge>
      ),
    }),
  ];

  const table = useReactTable({
    data: canales, columns, getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Canales</h2>
        <p className="text-sm text-muted-foreground">Canales de venta del sistema (solo lectura)</p>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/50 hover:bg-muted/50">
                {hg.headers.map((h) => <TableHead key={h.id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30">
                {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">{canales.length} canales</p>
        </div>
      </div>
    </div>
  );
}
