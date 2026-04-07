import { useState } from "react";
import { UserFormSheet } from "@/components/maestros/UserFormSheet";
import { toast } from "sonner";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  flexRender, createColumnHelper,
} from "@tanstack/react-table";
import { Search, Plus, Filter, MoreHorizontal, Mail, Shield, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "ACTIVO" | "INACTIVO";
  lastAccess: string;
}

const initialUsers: User[] = [
  { id: 1, name: "María García", email: "maria@torres.com", role: "ADMIN", status: "ACTIVO", lastAccess: "hace 2 horas" },
  { id: 2, name: "Juan López", email: "jlopez@torres.com", role: "VENDEDOR", status: "ACTIVO", lastAccess: "hace 1 día" },
  { id: 3, name: "Rosnelli Flores", email: "rosnelli@torres.com", role: "ALMACEN", status: "ACTIVO", lastAccess: "hace 3 horas" },
  { id: 4, name: "Sarai Mendoza", email: "sarai@torres.com", role: "CONSOLIDADOR", status: "ACTIVO", lastAccess: "hace 5 horas" },
  { id: 5, name: "Carlos Ríos", email: "crios@torres.com", role: "INSPECTOR", status: "INACTIVO", lastAccess: "hace 15 días" },
];

const columnHelper = createColumnHelper<User>();

const roleColors: Record<string, string> = {
  ADMIN: "bg-primary text-primary-foreground",
  VENDEDOR: "bg-accent text-accent-foreground",
  ALMACEN: "bg-success text-success-foreground",
  CONSOLIDADOR: "bg-warning text-warning-foreground",
  INSPECTOR: "bg-muted text-muted-foreground",
  GERENTE_GENERAL: "bg-primary text-primary-foreground",
  CAJERO: "bg-muted text-muted-foreground",
};

const columns = [
  columnHelper.accessor("name", {
    header: "Nombre",
    cell: (info) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary text-xs font-bold">
          {info.getValue().split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <p className="font-medium text-foreground">{info.getValue()}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            {info.row.original.email}
          </p>
        </div>
      </div>
    ),
  }),
  columnHelper.accessor("role", {
    header: "Rol",
    cell: (info) => (
      <Badge className={`${roleColors[info.getValue()] || ""} text-[11px] font-medium`}>
        <Shield className="mr-1 h-3 w-3" />
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Estado",
    cell: (info) => (
      <Badge
        variant={info.getValue() === "ACTIVO" ? "default" : "secondary"}
        className={
          info.getValue() === "ACTIVO"
            ? "bg-success/10 text-success border border-success/20"
            : "bg-destructive/10 text-destructive border border-destructive/20"
        }
      >
        <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${info.getValue() === "ACTIVO" ? "bg-success" : "bg-destructive"}`} />
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor("lastAccess", {
    header: "Último acceso",
    cell: (info) => (
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Editar</DropdownMenuItem>
          <DropdownMenuItem>Ver detalles</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Desactivar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }),
];

export default function UsuariosList() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sheetOpen, setSheetOpen] = useState(false);

  const filteredData = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    return true;
  });

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const activeFilters = (roleFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Usuarios</h2>
          <p className="text-sm text-muted-foreground">Gestión de usuarios y permisos del sistema</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nombre o email..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                  {activeFilters > 0 && (
                    <Badge className="ml-1 h-5 w-5 rounded-full bg-accent p-0 text-[10px] text-accent-foreground">{activeFilters}</Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 space-y-4" align="end">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Rol</label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent position="popper" className="z-[9999]">
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="VENDEDOR">Vendedor</SelectItem>
                      <SelectItem value="ALMACEN">Almacén</SelectItem>
                      <SelectItem value="CONSOLIDADOR">Consolidador</SelectItem>
                      <SelectItem value="INSPECTOR">Inspector</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Estado</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent position="popper" className="z-[9999]">
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="ACTIVO">Activo</SelectItem>
                      <SelectItem value="INACTIVO">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => { setRoleFilter("all"); setStatusFilter("all"); }}>
                  Limpiar filtros
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/50 hover:bg-muted/50">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">No se encontraron usuarios.</TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">{filteredData.length} usuario{filteredData.length !== 1 ? "s" : ""}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
            <span className="text-sm text-muted-foreground">Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</Button>
          </div>
        </div>
      </div>

      <UserFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={(data) => {
          setUsers(prev => [...prev, {
            id: prev.length + 1,
            name: data.nombre,
            email: data.email,
            role: data.rol,
            status: data.estado as "ACTIVO" | "INACTIVO",
            lastAccess: "ahora",
          }]);
          toast.success("Usuario creado exitosamente");
        }}
      />
    </div>
  );
}
