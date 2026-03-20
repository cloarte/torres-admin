import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Bell } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/maestros/usuarios": "Usuarios",
  "/maestros/vendedores": "Vendedores",
  "/maestros/productos": "Productos",
  "/maestros/lineas": "Líneas",
  "/maestros/clientes": "Clientes",
  "/maestros/canales": "Canales",
  "/maestros/rutas": "Rutas",
  "/maestros/beneficiarios": "Beneficiarios",
  "/maestros/configuracion": "Configuración",
  "/pricing/precios-canal": "Precios por Canal",
  "/pricing/precios-especiales": "Precios Especiales",
  "/pricing/descuentos": "Descuentos Condición",
  "/pricing/cotizaciones": "Cotizaciones",
  "/pricing/reportes": "Reportes",
  "/pricing/sync-erp": "Sync ERP",
};

export function AppLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <div className="min-h-screen">
      <AppSidebar />
      {/* Header */}
      <header className="fixed top-0 left-64 right-0 z-20 flex h-14 items-center justify-between border-b border-border bg-primary px-6">
        <h1 className="text-base font-semibold text-primary-foreground">{title}</h1>
        <div className="flex items-center gap-4">
          <button className="relative text-primary-foreground/70 hover:text-primary-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
              3
            </span>
          </button>
        </div>
      </header>
      {/* Content */}
      <main className="ml-64 pt-14">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
