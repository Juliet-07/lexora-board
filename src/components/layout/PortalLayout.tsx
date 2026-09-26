import { Outlet, useNavigate } from "react-router-dom";
import { Bell, Building2, LogOut, Search } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { navBadges } from "@/data/boardMockData";
import { PortalSidebar } from "./PortalSidebar";

export function PortalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PortalSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Badge variant="outline" className="hidden sm:flex gap-1.5 text-xs font-semibold text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                {user?.organisation}
              </Badge>
              <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search documents, meetings, actions…" className="pl-9 w-72 h-9 bg-muted/50 border-0" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">{user?.role}</Badge>
              <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/notifications")} title="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 rounded-full bg-destructive px-1 text-[9px] font-bold leading-4 text-destructive-foreground">
                  {navBadges.notifications}
                </span>
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs font-semibold">
                    {user ? `${user.firstName[0]}${user.lastName[0]}` : "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:block">
                  {user ? `${user.firstName} ${user.lastName}` : ""}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} title="Sign Out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
