import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Users, BarChart3, Wine } from "lucide-react";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

const tabs = [
  { to: "/", label: "Kanban", icon: LayoutGrid },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
];

export function Layout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-navy text-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-8">
          <Link to="/" aria-label="Início" className="flex items-center">
            <Wine className="h-6 w-6" />
          </Link>
          <nav className="flex items-center gap-1">
            {tabs.map((t) => {
              const active = pathname === t.to;
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                    active ? "bg-[var(--navy-hover)] text-white" : "text-white/80 hover:bg-[var(--navy-hover)] hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-6">{children}</main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--navy)",
            color: "#fff",
            border: "1px solid var(--navy-hover)",
          },
        }}
      />
    </div>
  );
}
