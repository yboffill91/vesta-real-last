"use client";
import { useEffect, useState } from "react";
import { useServiceSpots, ServiceSpot } from "@/hooks/useServiceSpots";
import { DashboardCards } from "@/components/ui";
import { MapPin } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { SalesArea } from "@/models/sales-area";

// Definir tipos para la respuesta de la API
interface ApiSuccessResponse {
  success: true;
  data: any;
  error?: string;
  status?: number;
}

interface ApiErrorResponse {
  success: false;
  error: string;
  status?: number;
}

// Tipo para la respuesta combinada
type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

// Tipo extendido de ServiceSpot con información detallada del área
interface EnhancedServiceSpot extends ServiceSpot {
  salesAreaDetail?: SalesArea;
}

export const SpotsServicesTables = () => {
  const { loading, error, fetchServiceSpots } = useServiceSpots();
  const [serviceSpots, setServiceSpots] = useState<EnhancedServiceSpot[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);

  // Función para obtener el área de venta de un puesto de servicio específico
  const fetchSalesAreaDetails = async (areaId: number) => {
    try {
      console.log(`[DEBUG] Solicitando área con ID: ${areaId}`);
      const response = await fetchApi(`/api/v1/sales-areas/${areaId}`);
      console.log(`[DEBUG] Respuesta para área ${areaId}:`, response);
      
      // Verificamos si la respuesta es exitosa y contiene datos
      if (response.success) {
        // Verificamos la estructura de datos en la respuesta
        if (response.data && typeof response.data === 'object') {
          // Si la respuesta tiene un campo 'data', usamos ese
          if ('data' in response.data) {
            console.log(`[DEBUG] Área ${areaId} encontrada en response.data.data:`, response.data.data);
            return response.data.data;
          }
          // Si no, usamos response.data directamente
          console.log(`[DEBUG] Área ${areaId} encontrada en response.data:`, response.data);
          return response.data;
        }
      }
      console.warn(`[DEBUG] No se pudo obtener el área ${areaId}`);
      return null;
    } catch (error) {
      console.error(`[DEBUG] Error al obtener el área ${areaId}:`, error);
      return null;
    }
  };

  // Función para cargar todas las áreas de los puestos de servicio
  const enhanceServiceSpotsWithAreas = async (spots: ServiceSpot[]) => {
    if (!spots || spots.length === 0) {
      console.log('[DEBUG] No hay puestos de servicio para procesar');
      return [];
    }
    
    setLoadingAreas(true);
    console.log('[DEBUG] Spots a procesar:', spots);
    
    try {
      // Identificar todos los áreas únicas para no hacer solicitudes duplicadas
      const uniqueAreaIds = Array.from(
        new Set(spots.filter(spot => spot.sales_area_id).map(spot => spot.sales_area_id))
      );
      
      console.log('[DEBUG] IDs únicos de áreas identificados:', uniqueAreaIds);
      
      if (uniqueAreaIds.length === 0) {
        console.log('[DEBUG] No hay IDs de áreas para procesar');
        return spots.map(spot => ({ ...spot }));
      }
      
      // Crear un mapa para almacenar las áreas por ID
      const areasMap = new Map<number, SalesArea>();
      
      // Obtener los detalles de todas las áreas secuencialmente para depurar mejor
      for (const areaId of uniqueAreaIds) {
        console.log(`[DEBUG] Procesando área ID: ${areaId}`);
        const areaDetails = await fetchSalesAreaDetails(areaId);
        if (areaDetails) {
          console.log(`[DEBUG] Detalles obtenidos para área ${areaId}:`, areaDetails);
          areasMap.set(areaId, areaDetails);
        } else {
          console.warn(`[DEBUG] No se pudieron obtener detalles para el área ${areaId}`);
        }
      }
      
      console.log('[DEBUG] Mapa de áreas completo:', Array.from(areasMap.entries()));
      
      // Enriquecer los puestos de servicio con la información completa del área
      const enhancedSpots = spots.map(spot => {
        const areaId = spot.sales_area_id;
        const areaDetail = areaId ? areasMap.get(areaId) : undefined;
        
        console.log(`[DEBUG] Procesando spot ${spot.id}, área ID: ${areaId}, ` + 
                   `encontrado: ${!!areaDetail}, nombre: ${areaDetail?.name || 'N/A'}`);
        
        // Construir un objeto mejorado manteniendo la compatibilidad de tipos
        const enhancedSpot: EnhancedServiceSpot = {
          ...spot,
          salesAreaDetail: areaDetail
        };
        
        // Solo actualizamos el objeto sales_area si realmente tenemos los detalles del área
        // El objeto sales_area solo tiene id y name en ServiceSpot
        if (areaDetail && enhancedSpot.sales_area) {
          enhancedSpot.sales_area.name = areaDetail.name;
          // No podemos agregar description porque no existe en el tipo sales_area
        }
        
        return enhancedSpot;
      });
      
      console.log('[DEBUG] Spots enriquecidos:', enhancedSpots);
      return enhancedSpots;
    } catch (error) {
      console.error("[DEBUG] Error al obtener detalles de las áreas:", error);
      return spots.map(spot => ({ ...spot })); // Devuelve spots sin enriquecer en caso de error
    } finally {
      setLoadingAreas(false);
    }
  };

  useEffect(() => {
    // Función para cargar los puestos de servicio
    const loadServiceSpots = async () => {
      try {
        // Puedes añadir filtros opcionales como parámetro
        // Por ejemplo: { active_only: true } para obtener solo los activos
        const response = (await fetchServiceSpots()) as ApiResponse;

        // Utilizamos un guardado de tipo para que TypeScript reconozca la estructura
        if (!response.success) {
          console.error(
            "Error al cargar los puestos de servicio:",
            response.error
          );
          return;
        }

        // Ahora TypeScript ya sabe que response es ApiSuccessResponse
        const { data } = response;
        if (!data) {
          setServiceSpots([]);
          return;
        }

        // Extraer los puestos de servicio según la estructura de respuesta
        let spots: ServiceSpot[] = [];
        if (
          typeof data === "object" &&
          data !== null &&
          "data" in data &&
          Array.isArray(data.data)
        ) {
          // Estructura anidada: response.data.data es un array
          spots = data.data;
        } else if (Array.isArray(data)) {
          // Estructura plana: response.data es directamente un array
          spots = data;
        } else {
          console.warn("Formato de respuesta inesperado:", data);
          setServiceSpots([]);
          return;
        }

        // Enriquecer los puestos con la información completa de las áreas
        const enhancedSpots = await enhanceServiceSpotsWithAreas(spots);
        setServiceSpots(enhancedSpots);
      } catch (error) {
        console.error("Error al cargar los puestos de servicio:", error);
        setServiceSpots([]);
      }
    };

    // Ejecutamos la carga una sola vez al montar el componente
    loadServiceSpots();
  }, [fetchServiceSpots]);

  if (loading || loadingAreas) return <div>Cargando puestos de servicio...</div>;

  if (error) return <div>Error: {error}</div>;

  return (
    <DashboardCards title="Puestos de Servicio" icon={MapPin}>
      {serviceSpots.length === 0 ? (
        <div className="text-center py-4">
          No hay puestos de servicio disponibles
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">Nombre</th>
                <th className="px-2 py-1 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {serviceSpots.map((spot) => (
                <tr key={spot.id} className="border-b">
                  <td className="px-2 py-1  ">
                    <h3 className="text-lg font-semibold">{spot.name}</h3>
                    <p className="text-xs font-light -mt-1">
                      {spot.salesAreaDetail?.name || spot.sales_area?.name || 
                       `Sin área asignada (ID: ${spot.sales_area_id || 'N/A'})`}{" "}
                    </p>
                  </td>
                  <td className="px-2 py-1 text-center">
                    <span className={getStatusClass(spot.status)}>
                      {getStatusText(spot.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCards>
  );
};

// Funciones helper para el estado
function getStatusText(status: string): string {
  switch (status) {
    case "libre":
      return "Libre";
    case "pedido_abierto":
      return "Pedido Abierto";
    case "cobrado":
      return "Cobrado";
    default:
      return status;
  }
}

function getStatusClass(status: string): string {
  switch (status) {
    case "libre":
      return "text-green-600";
    case "pedido_abierto":
      return "text-yellow-600";
    case "cobrado":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
}
