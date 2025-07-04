"use client";

import {
  LayoutDashboard,
  Users,
  Settings,
  ShoppingCart,
  BarChart3,
  Vegan,
  ChevronRight,
  UserCheck,
  PlusIcon,
  BadgeCheck,
  List,
  Plus,
  Edit,
  BadgeDollarSign,
  Home,
  Store,
  LayoutGrid,
  MapPin,
} from "lucide-react";

// import { NavUser } from "@/modules/dashboard/components";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  AvatarFallback,
  SidebarMenuButton,
} from "@/components/ui";

import { useAuthStore } from "@/lib/auth";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { UserNav } from "./user-nav";
import Image from "next/image";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  // Helper function to check if a path is active
  const isActive = (path: string) => pathname.startsWith(path);

  const { user } = useAuthStore();

  // Define admin navigation items
  interface dashboardNavs {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
    items?: dashboardNavs[];
  }

  const SupportNav: dashboardNavs[] = [
    {
      title: "Usuarios",
      url: "/dashboard/users",
      icon: List,
      isActive: isActive("/dashboard/users"),
    },
    {
      title: " Establecimiento",
      url: "/dashboard/establishment",
      icon: Home,
      isActive: isActive("/dashboard/establishment"),
      items: [
        {
          title: "Editar Establecimiento",
          url: "/dashboard/establishment",
          icon: Edit,
          isActive: isActive("/dashboard/establishment"),
        },
      ],
    },
    {
      title: "Licencia",
      url: "/license",
      icon: BadgeCheck,
      isActive: isActive("/license"),
      items: [
        {
          title: "Agregar Nueva Licencia",
          url: "/license/add",
          icon: BadgeDollarSign,
          isActive: isActive("/license/add"),
        },
      ],
    },
  ];

  const AdminNav: dashboardNavs[] = [
    {
      title: "Usuarios",
      url: "/dashboard/users",
      icon: Users,
      isActive: isActive("/dashboard/users"),
    },
    {
      title: "Áreas de Venta",
      url: "/dashboard/areas",
      icon: Store,
      isActive: isActive("/dashboard/areas"),
    },
    {
      title: "Puestos de Servicio",
      url: "/dashboard/spots",
      icon: MapPin,
      isActive: isActive("/dashboard/spots"),
    },

    {
      title: "Productos",
      url: "/dashboard/products/",
      icon: List,
      isActive: isActive("/dashboard/products/"),
    },
    {
      title: "Categorías",
      url: "/dashboard/products/categories",
      icon: LayoutGrid,
      isActive: isActive("/dashboard/products/categories"),
    },
    {
      title: "Cartas Menú",
      url: "/dashboard/menu",
      icon: Store,
      isActive: isActive("/dashbboard/menu"),
    },
    {
      title: "Órdenes",
      url: "/dashboard/orders",
      icon: List,
      isActive: isActive("/dashbboard/orders"),
    },
  ];

  // Determine which navigation items to display based on user role
  const navItems: dashboardNavs[] =
    user?.role === "Soporte" ? SupportNav : AdminNav;

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      {...props}
      className="bg-sidebar-background "
    >
      <SidebarHeader>
        <UserNav />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-center border bg-secondary text-secondary-foreground">
            {user?.role === "Soporte" ? "Soporte" : "Gestión"}
          </SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  {item.items && item.items.length > 0 ? (
                    <>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link href={subItem.url}>
                                  <subItem.icon /> <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </>
                  ) : (
                    <SidebarMenuButton asChild>
                      <Link href={item.url} className="flex items-center">
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton className="flex items-center gap-2 max-h-32 min-h-20">
          <Image
            src={"/logo.webp"}
            alt="VestaSys"
            width={48}
            height={48}
            className="p-px object-contain rounded-lg bg-slate-950 min-h-6 min-w-6"
          />
          <div>
            <h3 className="text-sm font-semibold">Vesta Manager</h3>
            <p className="text-[.6rem]">
              {new Date().getFullYear()}&nbsp;Tecnotics S.I. S.U.R.L
            </p>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
