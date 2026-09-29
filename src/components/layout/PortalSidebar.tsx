import { LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { navBadges } from "@/data/boardMockData";
import { NAV_GROUPS } from "./nav";

export function PortalSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <div className="p-4 border-b border-sidebar-border">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <img
              src="/favicon.png"
              alt=""
              className="h-10 w-10 rounded-lg object-contain"
            />
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-sidebar-accent-foreground tracking-tight truncate">
                Lexora
              </h1>
              <p className="text-[10px] text-sidebar-foreground/60 truncate">
                Board Portal
              </p>
            </div>
          </div>
        ) : (
          <img
            src="/lexora-logo.png"
            alt="Lexora"
            className="mx-auto h-12 w-12 rounded-lg object-contain"
          />
        )}
      </div>

      <SidebarContent className="sidebar-scroll">
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const count = item.badge ? navBadges[item.badge] : 0;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink
                          to={item.url}
                          className="hover:bg-sidebar-accent/50 text-sidebar-foreground"
                          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {!collapsed && (
                            <span className="flex-1">{item.title}</span>
                          )}
                          {!collapsed && count > 0 && (
                            <span className="ml-auto rounded-full bg-destructive px-1.5 py-px text-[10px] font-bold leading-4 text-destructive-foreground">
                              {count}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {!collapsed && user && (
            <li className="flex items-center gap-2.5 px-2 py-2">
              <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[11px] font-semibold text-white">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-sidebar-accent-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-[11px] text-sidebar-foreground/60">
                  {user.role}
                </p>
              </div>
            </li>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              className="hover:bg-sidebar-accent/50 text-sidebar-foreground cursor-pointer"
              onClick={logout}
              tooltip="Sign Out"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
