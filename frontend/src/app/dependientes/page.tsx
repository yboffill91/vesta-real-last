import React from "react";

import { TableCardWrapper } from "@/components/dependientes/TableCardWrapper";

const DependientePage = () => {
  // Por ahora, usamos areaId fijo (1). Se puede parametrizar luego.
  return (
    <div className="w-full flex flex-col gap-4 p-2">
      <h2 className="text-xl font-bold mb-2">Mesas y Puestos de Servicio</h2>
      <TableCardWrapper />
    </div>
  );
};

export default DependientePage;
