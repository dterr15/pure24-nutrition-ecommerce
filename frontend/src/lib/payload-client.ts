// payload-client.ts
// Cliente para consumir Payload CMS API durante build time

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  slug?: string;
  stock?: number;
}

const API_BASE = process.env.PUBLIC_PAYLOAD_API || 'http://localhost:3001/api';

/**
 * Fetch todos los productos desde Payload CMS
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return mock data para desarrollo
    return getMockProducts();
  }
}

/**
 * Fetch un producto por slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const products = await getProducts();
    return products.find(p => p.slug === slug) || null;
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
}

/**
 * Datos mock para desarrollo
 */
function getMockProducts(): Product[] {
  return [
    {
      id: '1',
      sku: 'P24-VD3K2',
      name: 'Vitamina D3 + K2 + Calcium',
      description: 'Soporte óseo y recuperación post-entrenamiento con vitamina D3 liposomal y K2 MK-7',
      price: 24900,
      category: 'Vitaminas',
      slug: 'vitamina-d3-k2-calcium',
      stock: 50,
      image: 'https://via.placeholder.com/300',
    },
    {
      id: '2',
      sku: 'P24-OM369',
      name: 'Omega 3-6-9 + ADEK',
      description: 'Balance completo de ácidos grasos esenciales para inflamación y recuperación',
      price: 14500,
      category: 'Grasas Saludables',
      slug: 'omega-3-6-9-adek',
      stock: 40,
      image: 'https://via.placeholder.com/300',
    },
    {
      id: '3',
      sku: 'P24-MGMAL120',
      name: 'Magnesio Malato 120G',
      description: 'Recuperación muscular y calidad de sueño con magnesio quelado de máxima absorción',
      price: 15990,
      category: 'Minerales',
      slug: 'magnesio-malato-120g',
      stock: 35,
      image: 'https://via.placeholder.com/300',
    },
  ];
}

/**
 * Fetch de órdenes (protegido)
 */
export async function getOrders(token?: string) {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/orders`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { docs: [] };
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

    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}
