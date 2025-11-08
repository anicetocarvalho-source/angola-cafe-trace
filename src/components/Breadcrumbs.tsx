import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Fragment } from "react";

interface BreadcrumbItem {
  label: string;
  path: string;
}

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  lotes: "Lotes",
  exploracoes: "Explorações",
  parcelas: "Parcelas",
  colheitas: "Colheitas",
  exportacao: "Exportação",
  qualidade: "Qualidade",
  validacao: "Validação",
  relatorios: "Relatórios",
  iot: "IoT",
  auditoria: "Auditoria",
  mapa: "Mapa",
  sim: "SIM",
  admin: "Administração",
  nova: "Nova",
  novo: "Novo",
  editar: "Editar",
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbs: BreadcrumbItem[] = pathnames.map((value, index) => {
    const path = `/${pathnames.slice(0, index + 1).join("/")}`;
    const label = routeLabels[value] || value;
    return { label, path };
  });

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      <Link
        to="/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.map((crumb, index) => (
        <Fragment key={crumb.path}>
          <ChevronRight className="h-4 w-4" />
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className="hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
