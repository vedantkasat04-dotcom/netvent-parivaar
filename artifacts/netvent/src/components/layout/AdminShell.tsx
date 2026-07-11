import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Users, Calendar, MessageSquare, ShieldAlert, MapPin, User, LogOut } from "lucide-react";
import { useLogout } from "@workspace/api-client-react";

export function AdminShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();
  const logoutMutation = useLogout();

  const links = [
    { href: "/admin", label: "Dashboard", icon: <User className="w-5 h-5" /> },
    { href: "/admin/members", label: "Members", icon: <Users className="w-5 h-5" /> },
    { href: "/admin/events", label: "Events", icon: <Calendar className="w-5 h-5" /> },
    { href: "/admin/groups", label: "Groups", icon: <MessageSquare className="w-5 h-5" /> },
    { href: "/admin/cities", label: "Cities", icon: <MapPin className="w-5 h-5" /> },
    { href: "/admin/reports", label: "Reports", icon: <ShieldAlert className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/";
      }
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex-shrink-0 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="font-heading font-bold text-xl text-primary">Admin Parivaar</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {links.map((link) => {
              const isActive = location === link.href || (link.href !== "/admin" && location.startsWith(link.href));
              return (
                <li key={link.href}>
                  <Link href={link.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                    {link.icon}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
            <User className="w-5 h-5" />
            <span className="truncate">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors mt-2">
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center px-6 border-b bg-card md:hidden">
          <span className="font-heading font-bold text-lg text-primary">Admin Parivaar</span>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
