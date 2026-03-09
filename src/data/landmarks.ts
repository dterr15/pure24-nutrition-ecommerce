// src/data/landmarks.ts
// FASE 3: LOCAL SEO - Landmark Graph & Internal Linking

export interface Landmark {
  id: string;
  name: string;
  slug: string;
  description: string;
  fullDescription: string;
  latitude: string;
  longitude: string;
  deliveryTime: string;
  landmarks: string[];
  attractions: string[];
  coverage: number; // km radius
  population: number;
}

export const landmarks: Record<string, Landmark> = {
  'plaza-de-armas': {
    id: 'plaza-de-armas',
    name: 'Plaza de Armas',
    slug: 'plaza-de-armas',
    description: 'Centro histórico y comercial principal de Punta Arenas',
    fullDescription: 'La Plaza de Armas es el corazón de Punta Arenas, ubicada en el centro histórico de la ciudad. Es la zona con mayor densidad comercial, concentrando tiendas, restaurantes y servicios. Aquí encontrarás la Catedral, el Monumento a Ferdinand Magellan y acceso directo a la Avenida Independencia. La cobertura de Pure24 Nutrition alcanza esta zona principal con entrega garantizada en máximo 24 horas. Ideal para profesionales y emprendedores que buscan recuperación rápida y concentración en sus actividades comerciales.',
    latitude: '-53.163700',
    longitude: '-70.908100',
    deliveryTime: '2-4 horas',
    landmarks: ['zona-franca', 'costanera-del-estrecho'],
    attractions: ['Catedral de Punta Arenas', 'Monumento Magallanes', 'Avenida Independencia', 'Museos locales'],
    coverage: 2,
    population: 8500
  },
  'zona-franca': {
    id: 'zona-franca',
    name: 'Zona Franca',
    slug: 'zona-franca',
    description: 'Centro comercial y de distribución logística',
    fullDescription: 'La Zona Franca es el hub logístico de Punta Arenas, especializado en importación, distribución y comercio mayorista. Alberga centros de distribución, bodegas y comercios de volumen. Los empresarios, distribuidores y equipos logísticos encuentran en Pure24 Nutrition la solución ideal para mantener energía en jornadas intensas de trabajo. Nuestros productos de hidratación y recuperación son especialmente formulados para profesionales en ambiente de trabajo exigente. Cobertura garantizada en zona Franca con entregas en máximo 4 horas.',
    latitude: '-53.160500',
    longitude: '-70.910200',
    deliveryTime: '2-4 horas',
    landmarks: ['plaza-de-armas', 'barrio-norte'],
    attractions: ['Centro de Distribución', 'Bodegas comerciales', 'Empresas logísticas', 'Importaciones'],
    coverage: 3,
    population: 5200
  },
  'costanera-del-estrecho': {
    id: 'costanera-del-estrecho',
    name: 'Costanera del Estrecho',
    slug: 'costanera-del-estrecho',
    description: 'Paseo turístico y zona de recreación junto al Estrecho de Magallanes',
    fullDescription: 'La Costanera del Estrecho es el principal paseo turístico y recreativo de Punta Arenas, con vista espectacular al Estrecho de Magallanes. Es zona de concentración de hoteles, restaurantes, cafeterías y actividades turísticas. Aquí encontrarás el Museo del Fin del Mundo, miradores, y acceso a tours de navegación. Los turistas, deportistas y familias que visitan esta zona encuentran en Pure24 Nutrition el aliado perfecto para recuperación después de actividades al aire libre, hidratación en clima frío, e inmunidad fortalecida. Cobertura turística garantizada con entrega en máximo 6 horas.',
    latitude: '-53.165200',
    longitude: '-70.905000',
    deliveryTime: '4-6 horas',
    landmarks: ['plaza-de-armas', 'puerto-punta-arenas'],
    attractions: ['Museo del Fin del Mundo', 'Miradores', 'Restaurantes turísticos', 'Tours Pingüinos', 'Navegación Estrecho'],
    coverage: 2.5,
    population: 3200
  },
  'barrio-norte': {
    id: 'barrio-norte',
    name: 'Barrio Norte',
    slug: 'barrio-norte',
    description: 'Zona residencial norte, familiar y en desarrollo',
    fullDescription: 'El Barrio Norte es la principal zona residencial de Punta Arenas, caracterizada por viviendas, colegios, centros de salud y servicios comunitarios. Es donde viven la mayoría de familias puntarenenses. Aquí encontrarás parques, áreas deportivas, gimnasios y espacios de recreación familiar. Para las familias del Barrio Norte, Pure24 Nutrition representa la garantía de salud y rendimiento. Nuestros productos de inmunidad fortalecen a niños y adultos, la hidratación sostiene actividades deportivas, y la recuperación optimiza el descanso. Entregas garantizadas en máximo 4 horas en toda la zona residencial.',
    latitude: '-53.157800',
    longitude: '-70.912000',
    deliveryTime: '3-5 horas',
    landmarks: ['plaza-de-armas', 'zona-franca'],
    attractions: ['Parques y plazas', 'Colegios', 'Centros de salud', 'Gimnasios', 'Áreas deportivas'],
    coverage: 3.5,
    population: 7800
  },
  'puerto-punta-arenas': {
    id: 'puerto-punta-arenas',
    name: 'Puerto Punta Arenas',
    slug: 'puerto-punta-arenas',
    description: 'Puerto principal y zona portuaria con actividad internacional',
    fullDescription: 'El Puerto de Punta Arenas es la infraestructura marítima clave de la Región de Magallanes. Concentra actividad pesquera, turística y logística internacional. Aquí trabajan pescadores, marineros, operadores portuarios y profesionales de la navegación. Estos profesionales enfrentan jornadas exigentes en ambiente marino, con exposición a frío extremo. Pure24 Nutrition fue formulado pensando en estos profesionales: recuperación acelerada después de jornadas intensas, hidratación que sostiene en clima frío, e inmunidad reforzada contra patógenos marinos. Cobertura garantizada en puerto con entregas urgentes disponibles.',
    latitude: '-53.167500',
    longitude: '-70.900000',
    deliveryTime: '4-8 horas',
    landmarks: ['costanera-del-estrecho', 'plaza-de-armas'],
    attractions: ['Puerto pesquero', 'Terminal de cruceros', 'Astilleros', 'Comercio marítimo', 'Navegación'],
    coverage: 2,
    population: 2100
  }
};

// Internal linking graph: relaciones de relevancia entre landmarks
export const landmarkLinks: Record<string, number> = {
  'plaza-de-armas-zona-franca': 0.8,
  'plaza-de-armas-costanera-del-estrecho': 0.7,
  'plaza-de-armas-barrio-norte': 0.6,
  'zona-franca-barrio-norte': 0.8,
  'costanera-del-estrecho-puerto-punta-arenas': 0.8,
  'puerto-punta-arenas-costanera-del-estrecho': 0.8
};

export function getLandmarkBySlug(slug: string): Landmark | undefined {
  return landmarks[slug];
}

export function getAllLandmarks(): Landmark[] {
  return Object.values(landmarks);
}

export function getRelatedLandmarks(slug: string): Landmark[] {
  const landmark = landmarks[slug];
  if (!landmark) return [];

  return landmark.landmarks
    .map(id => landmarks[id])
    .filter(Boolean);
}

export function getLandmarksByRegion(region: string): Landmark[] {
  // Todos los landmarks están en la misma región (Punta Arenas, Magallanes)
  return Object.values(landmarks);
}
