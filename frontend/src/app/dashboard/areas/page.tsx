"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { DashboardCardAlert } from "@/components/ui/dashboar-card-alert";
import { Button } from "@/components/ui";

interface SalesArea {
  id: number;
  name: string;
  description?: string;
  // Agrega otros campos según la respuesta real de la API
}

import SalesAreasTable from "@/components/dashboard/areas/sales-areas-table";

export default function SalesAreasPage() {
  return (
    <main className="container mx-auto max-w-3xl">
      <SalesAreasTable />
    </main>
  );
}
