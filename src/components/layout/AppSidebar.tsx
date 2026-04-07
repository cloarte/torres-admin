import { useLocation, Link } from "react-router-dom";
import {
  Users, UserCheck, Package, Layers, Building2, Radio, Route, Heart, Settings,
  DollarSign, Star, Percent, FileText, BarChart3, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

const maestrosItems: MenuItem[] = [
  { title: "Users", url: "/maestros/usuarios", icon: Users },
  { title: "Vendedores", url: "/maestros/vendedores", icon: UserCheck },
  { title: "Productos", url: "/maestros/productos", icon: Package },
  { title: "Líneas", url: "/maestros/lineas", icon: Layers },
  { title: "Clientes", url: "/maestros/clientes", icon: Building2 },
  { title: "Canales", url: "/maestros/canales", icon: Radio },
  { title: "Rutas", url: "/maestros/rutas", icon: Route },
  { title: "Beneficiarios", url: "/maestros/beneficiarios", icon: Heart },
  { title: "Configuración", url: "/maestros/configuracion", icon: Settings },
];

const pricingItems: MenuItem[] = [
  { title: "Precios por Canal", url: "/pricing/precios-canal", icon: DollarSign },
  { title: "Precios Especiales", url: "/pricing/precios-especiales", icon: Star },
  { title: "Descuentos Condición", url: "/pricing/descuentos", icon: Percent },
  { title: "Cotizaciones", url: "/pricing/cotizaciones", icon: FileText },
  { title: "Reportes", url: "/pricing/reportes", icon: BarChart3 },
];

function SidebarSection({ title, items }: { title: string; items: MenuItem[] }) {
  const location = useLocation();
  const hasActive = items.some(i => location.pathname === i.url);
  const [open, setOpen] = useState(hasActive || title === "MAESTROS");

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 hover:text-sidebar-foreground/80"
      >
        {title}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <nav className="space-y-0.5 px-3">
          {items.map((item) => {
            const active = location.pathname === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-hover"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold text-sm">
          PT
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-primary">Panificadora Torres</p>
          <p className="text-[10px] text-sidebar-foreground/50">Sistema de Ventas B2B</p>
        </div>
      </div>

      {/* Nav sections */}
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarSection title="MAESTROS" items={maestrosItems} />
        <SidebarSection title="PRICING" items={pricingItems} />
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
            MG
          </div>
          <div>
            <p className="text-xs font-medium text-sidebar-primary">María García</p>
            <p className="text-[10px] text-sidebar-foreground/50">Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
