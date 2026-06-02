import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Users, BarChart3, Wine, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";

const tabs = [
  { to: "/", label: "Cadastros dos Clientes", icon: LayoutGrid },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
];

function ConnectivityBadge() {
  const [online, setOnline] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  if (!mounted) return null;
  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
        online ? "bg-emerald-500/15 text-emerald-200" : "bg-red-500/20 text-red-100"
      }`}
      title={online ? "Conectado" : "Sem conexão — operando offline"}
      aria-live="polite"
    >
      {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
      {online ? "Online" : "Offline"}
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-navy text-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-8">
          <Link to="/" aria-label="Início" className="flex items-center">
            <Wine className="h-6 w-6" />
          </Link>
          <nav className="flex items-center gap-1 flex-1">
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
          <ConnectivityBadge />
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
