// Definición de tipos para el contenido de las diapositivas
export interface SlideContent {
  title: string
  description: string
  image: string
}

// Datos de ejemplo para las diapositivas
export const slides: SlideContent[] = [
  {
    title: "Gestión Gastronómica Simplificada",
    description: "VestaSys ofrece una interfaz intuitiva para gestionar todos los aspectos de su negocio gastronómico.",
    image: "/modules/login/bg-one.webp",
  },
  {
    title: "Ideal para MIPYMEs y TCPs",
    description:
      "Diseñado específicamente para Micro, Pequeñas y Medianas Empresas y Trabajadores por Cuenta Propia del sector gastronómico.",
    image: "/modules/login/bg-two.webp",
  },
  {
    title: "Solución Completa para Restaurantes",
    description:
      "Perfecto para bares, restaurantes, cafeterías, puestos de comida rápida y todo tipo de servicios gastronómicos.",
    image: "/modules/login/bg-three.webp",
  },
]
