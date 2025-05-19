"use client";

import React, { useMemo } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from ".";
import { usePathname } from "next/navigation";
import Link from "next/link";

// Title mappings for path segments - expand this as needed
const pathTitles: Record<string, string> = {
  "": "Inicio",
  admin: "Administración",
  users: "Usuarios",
  products: "Productos",
  orders: "Órdenes",
  settings: "Configuración",
  dashboard: "Dashboard",
  profile: "Perfil",
  inventory: "Inventario",
  reports: "Reportes",
  // Add more mappings as your application grows
};

// Function to format path segment into a readable title
const formatPathSegment = (segment: string): string => {
  // First check if we have a direct mapping
  if (pathTitles[segment]) {
    return pathTitles[segment];
  }

  // Otherwise, format the segment: replace dashes/underscores with spaces and capitalize words
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

interface BreadcrumbPathProps {
  rootPath?: string;
  className?: string;
}

export function BreadcrumbPath({
  rootPath = "/",
  className,
}: BreadcrumbPathProps) {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Remove the rootPath prefix if present to avoid duplicate "Home" breadcrumb
    const relativePath = pathname.startsWith(rootPath)
      ? pathname.substring(rootPath.length)
      : pathname;

    // Split the path into segments and filter out empty segments
    const segments = relativePath.split("/").filter(Boolean);

    // Create an array of breadcrumb items
    const breadcrumbItems = [];

    // Always add the root breadcrumb first
    breadcrumbItems.push({
      href: rootPath,
      label: "Inicio",
      isCurrentPage: segments.length === 0,
    });

    // Add each path segment as a breadcrumb
    let currentPath = rootPath;
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `${segment}/`;

      // Determine if this is the current page (last segment)
      const isCurrentPage = i === segments.length - 1;

      breadcrumbItems.push({
        href: currentPath,
        label: formatPathSegment(segment),
        isCurrentPage,
      });
    }

    return breadcrumbItems;
  }, [pathname, rootPath]);

  // Don't render if we only have the home page
  if (breadcrumbs.length === 1) {
    return null;
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
              {crumb.isCurrentPage ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && (
              <BreadcrumbSeparator
                className={index === 0 ? "hidden md:block" : ""}
              />
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
