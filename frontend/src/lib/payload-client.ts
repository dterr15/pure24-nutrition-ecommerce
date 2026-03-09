// payload-client.ts → Directus-compatible client
// Connects to Directus CMS at build time, falls back to static product data
// Source: Pure24_Setup_Actualizado.xlsx (12 real products from tienda.pure24nutrition.cl)

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  descriptionLong?: string;
  price: number;
  discountedPrice?: number;
  cost?: number;
  image?: string;
  mainImage?: { url: string; alt: string };
  category: string;
  subcategory?: string;
  slug: string;
  stock: number;
  stockMin?: number;
  active: boolean;
  specifications?: { servingSize?: string; ingredientAmount?: string };
  tags?: string[];
  dosage?: { timing?: string };
}

// Use VITE_ prefix for environment variables accessible in Astro build time
const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = import.meta.env.DIRECTUS_API_TOKEN || import.meta.env.PUBLIC_DIRECTUS_API_TOKEN || '';

/**
 * Fetch todos los productos desde Directus CMS
 * Falls back a datos estáticos si Directus no está disponible
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (DIRECTUS_TOKEN) {
      headers['Authorization'] = `Bearer ${DIRECTUS_TOKEN}`;
    }

    const res = await fetch(
      `${DIRECTUS_URL}/items/products?filter[active][_eq]=true&sort=name`,
      { headers }
    );

    if (!res.ok) {
      throw new Error(`Directus error: ${res.statusText}`);
    }

    const data = await res.json();
    return (data.data || []).map((item: any): Product => ({
      id: String(item.id),
      sku: item.sku || '',
      name: item.name || '',
      description: item.description || '',
      descriptionLong: item.description_long || item.description || '',
      price: item.price || 0,
      discountedPrice: item.discounted_price || item.price,
      cost: item.cost || 0,
      category: item.category || '',
      subcategory: item.subcategory || '',
      slug: item.slug || slugify(item.name || ''),
      stock: item.stock ?? 0,
      stockMin: item.stock_min || 10,
      active: item.active !== false,
      mainImage: item.image
        ? {
            url: `${DIRECTUS_URL}/assets/${item.image}`,
            alt: item.name || 'Producto Pure24 Nutrition',
          }
        : undefined,
      specifications: item.specifications ? {
        servingSize: item.specifications.serving_size,
        ingredientAmount: item.specifications.ingredient_amount,
      } : undefined,
      tags: item.tags || [],
      dosage: item.dosage ? { timing: item.dosage.timing } : undefined,
    }));
  } catch (error) {
    console.warn('[Pure24] Directus unavailable — using static product catalog');
    console.error(error);
    return getStaticProducts();
  }
}

/**
 * Fetch un producto específico por slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find(p => p.slug === slug) || null;
}

/**
 * Fetch un producto por SKU
 */
export async function getProductBySku(sku: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find(p => p.sku === sku) || null;
}

/**
 * Get static paths para SSG de todos los productos
 */
export function getStaticPaths() {
  const products = getStaticProducts();
  return products.map(product => ({
    params: { slug: product.slug },
    props: { product },
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// STATIC PRODUCT DATA — 12 real products from Pure24 catalog
// Source: Pure24_Setup_Actualizado.xlsx, collected March 8-9 2026
// Used as fallback when Directus is unavailable (CI/CD builds, development)
// ═══════════════════════════════════════════════════════════════════════════

function getStaticProducts(): Product[] {
  return [
    {
      id: '1',
      sku: 'P24-001',
      name: 'Proteína Whey Isolate 1kg Vainilla',
      description:
        'Proteína de suero aislada de máxima pureza. 25g proteína por porción. Libre de lactosa y gluten. Ideal para recuperación muscular post-entrenamiento con aminoácidos de rápida absorción.',
      descriptionLong:
        'Proteína Whey Isolate 1kg sabor vainilla. Contenido: 25g proteína por porción (30g scoop). Aminoácidos de cadena ramificada (BCAAs) en ratio óptimo 2:1:1. Sin lactosa, sin gluten, sin rellenos. Absorción rápida. Ideal post-entrenamiento o como complemento proteico en desayuno. 33 porciones por kg.',
      price: 39990,
      discountedPrice: 34990,
      cost: 15000,
      category: 'Rendimiento Muscular',
      subcategory: 'Proteínas',
      slug: 'proteina-whey-isolate-1kg-vainilla',
      stock: 50,
      stockMin: 5,
      active: true,
      specifications: {
        servingSize: '30g (1 scoop)',
        ingredientAmount: '25g proteína por porción',
      },
      tags: ['proteína', 'whey isolate', 'post-entrenamiento', 'BCAA'],
      dosage: { timing: 'post_entrenamiento' },
    },
    {
      id: '2',
      sku: 'P24-VD3K2',
      name: 'Vitamina D3+K2 Softgels 60 Caps',
      description:
        'Complejo vitamínico liposoluble con D3 2000 IU y K2 MK-7. Fórmula en softgels para máxima absorción. Apoya salud ósea, función inmunológica y metabolismo del calcio.',
      descriptionLong:
        'Vitamina D3 2000 IU + K2 MK-7 en 60 cápsulas softgel de gelatina. Sinergia probada D3+K2 para absorción óptima de calcio y mineralización ósea. Una cápsula diaria con comida. Ideal para deportistas, apoyo inmunológico y salud ósea.',
      price: 21990,
      discountedPrice: 21990,
      cost: 6000,
      category: 'Protección Inmunológica',
      subcategory: 'Vitaminas',
      slug: 'vitamina-d3-k2-softgels-60-caps',
      stock: 100,
      stockMin: 10,
      active: true,
      specifications: {
        servingSize: '1 softgel',
        ingredientAmount: 'D3 2000 IU + K2 MK-7 100μg',
      },
      tags: ['vitamina D', 'K2', 'inmunidad', 'huesos'],
      dosage: { timing: 'con_comida' },
    },
    {
      id: '3',
      sku: 'P24-OM369',
      name: 'Omega 3-6-9 + ADEK 90 Caps',
      description:
        'Combinación sinérgica de Omega 3, 6 y 9 con vitaminas liposolubles A, D, E y K. Promueve salud cardiovascular, función cognitiva y respuesta inflamatoria saludable.',
      descriptionLong:
        'Omega 3-6-9 + ADEK en 90 cápsulas. Balance óptimo de ácidos grasos esenciales con vitaminas liposolubles. Apoyo cardiovascular, cognitivo, articular e inmunológico. Una cápsula diaria con comida principal.',
      price: 17990,
      discountedPrice: 14500,
      cost: 5000,
      category: 'Protección Inmunológica',
      subcategory: 'Omega y Multivitaminas',
      slug: 'omega-3-6-9-adek-90-caps',
      stock: 120,
      stockMin: 10,
      active: true,
      specifications: {
        servingSize: '1 cápsula',
        ingredientAmount: 'Omega 3-6-9 + ADEK',
      },
      tags: ['omega', 'cardiovascular', 'antiinflamatorio', 'cerebral'],
      dosage: { timing: 'con_comida_principal' },
    },
    {
      id: '4',
      sku: 'P24-VD3K2CZN',
      name: 'Vitamina D3 2000 IU+K2 MK-7+C+ZN 60 Caps',
      description:
        'Vitamina D3 2000 IU potenciada con K2 MK-7, vitamina C y zinc. Triple acción para inmunidad y absorción de calcio. 60 cápsulas vegetales de grado farmacéutico.',
      descriptionLong:
        'Fórmula sinérgica D3 + K2 + C + Zinc en 60 cápsulas vegetales. Inmunidad potenciada con zinc 15mg. Una cápsula diaria con desayuno. Apoyo integral para huesos, inmunidad y antioxidación.',
      price: 21990,
      discountedPrice: 21990,
      cost: 7000,
      category: 'Protección Inmunológica',
      subcategory: 'Vitaminas y Minerales',
      slug: 'vitamina-d3-k2-c-zn-60-caps',
      stock: 90,
      stockMin: 10,
      active: true,
      specifications: {
        servingSize: '1 cápsula',
        ingredientAmount: 'D3 2000IU + K2 100μg + C 90mg + Zn 15mg',
      },
      tags: ['inmunidad', 'zinc', 'vitamina C', 'vitamina D'],
      dosage: { timing: 'con_desayuno' },
    },
    {
      id: '5',
      sku: 'P24-VD3K2CA',
      name: 'Vitamina D3 + K2 + Calcium 90 Caps',
      description:
        'Complejo calcio-vitamínico con D3 + K2 para formación ósea óptima. Mejora biodisponibilidad de calcio. Ideal para deportistas. 90 cápsulas con protocolo de 1-2 diarias.',
      descriptionLong:
        'Calcio 750mg + D3 2000 IU + K2 MK-7 en 90 cápsulas. Sinergia probada para máxima absorción de calcio y mineralización ósea. Ideal para deportistas. Protocolo: 1-2 cápsulas diarias con comida.',
      price: 24900,
      discountedPrice: 24900,
      cost: 8000,
      category: 'Protección Inmunológica',
      subcategory: 'Soporte Óseo',
      slug: 'vitamina-d3-k2-calcium-90-caps',
      stock: 80,
      stockMin: 10,
      active: true,
      specifications: {
        servingSize: '1-2 cápsulas',
        ingredientAmount: 'D3 2000 IU + K2 100μg + Calcio 750mg',
      },
      tags: ['calcio', 'huesos', 'D3+K2', 'densidad ósea'],
      dosage: { timing: 'con_comida' },
    },
    {
      id: '6',
      sku: 'P24-TURCBPG',
      name: 'Turmeric Black Pepper Ginger 90 Tabs',
      description:
        'Extracto estandarizado de cúrcuma con pimienta negra y jengibre. Triple sinergia para apoyo articular y respuesta inflamatoria. Alta concentración de curcuminoides.',
      descriptionLong:
        'Cúrcuma 300mg + Pimienta negra + Jengibre en 90 tabletas. Curcuminoides estandarizados 95%. Pimienta negra (piperina) aumenta biodisponibilidad en 2000%. Protocolo: 1-2 tabletas con comida.',
      price: 24990,
      discountedPrice: 24990,
      cost: 8500,
      category: 'Recuperación Avanzada',
      subcategory: 'Antiinflamatorios',
      slug: 'turmeric-black-pepper-ginger-90-tabs',
      stock: 70,
      stockMin: 5,
      active: true,
      specifications: {
        servingSize: '1-2 tabletas',
        ingredientAmount: 'Cúrcuma 300mg + Pimienta + Jengibre',
      },
      tags: ['antiinflamatorio', 'articulaciones', 'cúrcuma', 'artritis'],
      dosage: { timing: 'con_comida' },
    },
    {
      id: '7',
      sku: 'P24-OM3EXT',
      name: 'Omega 3 Extreme 90 Caps',
      description:
        'Omega 3 marino de máxima potencia con EPA 500mg y DHA 250mg por cápsula. Destilación molecular para máxima pureza. Apoyo cardiovascular, cognitivo y articular.',
      descriptionLong:
        'Omega 3 concentrado: EPA 500mg + DHA 250mg por cápsula. Destilación molecular para máxima pureza, libre de metales pesados. 90 cápsulas. Protocolo: 1 cápsula diaria con comida principal.',
      price: 19990,
      discountedPrice: 19990,
      cost: 6500,
      category: 'Protección Inmunológica',
      subcategory: 'Omega y Multivitaminas',
      slug: 'omega-3-extreme-90-caps',
      stock: 100,
      stockMin: 10,
      active: true,
      specifications: {
        servingSize: '1 cápsula',
        ingredientAmount: 'EPA 500mg + DHA 250mg',
      },
      tags: ['omega 3', 'EPA', 'DHA', 'cardiovascular', 'cerebral'],
      dosage: { timing: 'con_comida_principal' },
    },
    {
      id: '8',
      sku: 'P24-OM3ADEK',
      name: 'Omega 3 + ADEK 90 Caps',
      description:
        'Omega 3 completo con vitaminas liposolubles A, D, E y K. Sinergia de ácidos grasos y vitaminas para protección integral. Encapsulación avanzada.',
      descriptionLong:
        'Omega 3 1000mg + ADEK en 90 cápsulas. Sinergia de ácidos grasos esenciales con vitaminas liposolubles para protección integral. Una cápsula diaria con comida principal.',
      price: 17990,
      discountedPrice: 17990,
      cost: 5500,
      category: 'Protección Inmunológica',
      subcategory: 'Omega y Multivitaminas',
      slug: 'omega-3-adek-90-caps',
      stock: 120,
      stockMin: 10,
      active: true,
      specifications: {
        servingSize: '1 cápsula',
        ingredientAmount: 'Omega 3 1000mg + ADEK',
      },
      tags: ['omega 3', 'multivitamínico', 'vitaminas liposolubles'],
      dosage: { timing: 'con_comida_principal' },
    },
    {
      id: '9',
      sku: 'P24-MGMAL120',
      name: 'Magnesio Malato 120g',
      description:
        'Magnesio en forma de malato para máxima absorción celular. Combinado con vitamina B6 para función neuromuscular. Apoyo para relajación muscular, recuperación y calidad del sueño.',
      descriptionLong:
        'Magnesio Malato 150mg + B6 5mg por porción. 120g de polvo para mix en agua. Máxima absorción intracelular. Ideal pre-sueño o post-entrenamiento. Protocolo: 2g diarios (1 medida).',
      price: 15990,
      discountedPrice: 15990,
      cost: 4500,
      category: 'Recuperación Avanzada',
      subcategory: 'Minerales y Electrolitos',
      slug: 'magnesio-malato-120g',
      stock: 80,
      stockMin: 10,
      active: true,
      specifications: {
        servingSize: '2g (1 medida)',
        ingredientAmount: 'Magnesio Malato 150mg + B6 5mg',
      },
      tags: ['magnesio', 'sueño', 'recuperación', 'relajación'],
      dosage: { timing: 'antes_de_dormir' },
    },
    {
      id: '10',
      sku: 'P24-AJO90',
      name: 'Ajo Ostrovit 90 Caps',
      description:
        'Extracto concentrado de ajo con encapsulación molecular. Sin olor. Apoya inmunidad, salud cardiovascular y energía diaria.',
      descriptionLong:
        'Extracto concentrado de ajo en 90 cápsulas vegetales. Sin olor ni sabor residual. Apoyo inmunológico, cardiovascular y energía diaria. Una cápsula diaria con comida.',
      price: 19990,
      discountedPrice: 19990,
      cost: 6000,
      category: 'Protección Inmunológica',
      subcategory: 'Extractos Botánicos',
      slug: 'ajo-ostrovit-90-caps',
      stock: 100,
      stockMin: 10,
      active: true,
      specifications: {
        servingSize: '1 cápsula',
        ingredientAmount: 'Extracto de ajo concentrado',
      },
      tags: ['ajo', 'inmunidad', 'cardiovascular', 'energia'],
      dosage: { timing: 'con_comida' },
    },
    {
      id: '11',
      sku: 'P24-CRTHCL300',
      name: 'Creatina HCL 300gr Black Currant & Cherry',
      description:
        'Creatina HCL de máxima biodisponibilidad sabor Black Currant & Cherry. Absorción 4x superior a monohidrato. Fuerza, potencia muscular y resistencia anaeróbica.',
      descriptionLong:
        'Creatina HCL 300g (~100 porciones de 3g). Absorción 4x superior a monohidrato. Sin necesidad de carga. Sabor Black Currant & Cherry. Protocolo: 3g diarios pre o post-entrenamiento.',
      price: 36900,
      discountedPrice: 36900,
      cost: 12000,
      category: 'Rendimiento Muscular',
      subcategory: 'Creatina y Fuerza',
      slug: 'creatina-hcl-300gr-black-currant-cherry',
      stock: 60,
      stockMin: 5,
      active: true,
      specifications: {
        servingSize: '3g',
        ingredientAmount: 'Creatina HCL 3g x 100 porciones',
      },
      tags: ['creatina', 'fuerza', 'rendimiento', 'potencia'],
      dosage: { timing: 'pre_o_post_entrenamiento' },
    },
    {
      id: '12',
      sku: 'P24-BETAAL2400',
      name: 'Beta Alanina 2400 mg',
      description:
        'Beta-Alanina de grado farmacéutico. 150 cápsulas de 2400mg. Aumenta carnosina muscular para resistencia en alta intensidad. Reduce fatiga muscular. Efecto observable en 4-8 semanas.',
      descriptionLong:
        'Beta-Alanina 2400mg x 150 cápsulas. Aumenta carnosina muscular para resistencia en entrenamientos de alta intensidad. Efecto acumulativo, observable en 4-8 semanas. Protocolo: 1-2 cápsulas distribuidas en el día.',
      price: 29990,
      discountedPrice: 29990,
      cost: 9000,
      category: 'Rendimiento Muscular',
      subcategory: 'Creatina y Fuerza',
      slug: 'beta-alanina-2400-mg',
      stock: 75,
      stockMin: 5,
      active: true,
      specifications: {
        servingSize: '1-2 cápsulas',
        ingredientAmount: 'Beta-Alanina 2400mg x 150 caps',
      },
      tags: ['beta alanina', 'resistencia', 'rendimiento', 'carnosina'],
      dosage: { timing: 'distribuido_en_dia' },
    },
  ];
}

/**
 * Utility: convert string to URL-friendly slug
 */
function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Fetch órdenes (protegido)
 */
export async function getOrders(token?: string) {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${DIRECTUS_URL}/items/orders`, { headers });

    if (!res.ok) {
      throw new Error(`Orders: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { data: [] };
  }
}

/**
 * Crear una nueva orden
 */
export async function createOrder(orderData: any, token?: string) {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${DIRECTUS_URL}/items/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      throw new Error(`Create order: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}
