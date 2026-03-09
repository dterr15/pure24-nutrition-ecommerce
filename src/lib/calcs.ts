// src/lib/calcs.ts
// Funciones de cálculo para dosificación de productos Pure24

/**
 * Calcula la dosis recomendada de Recovery basada en peso corporal
 * Fórmula: peso_kg * 0.2 gramos
 *
 * @param weight_kg - Peso corporal en kilogramos
 * @returns Dosis recomendada en gramos
 *
 * @example
 * calculateRecoveryDose(70) // Output: 14 gramos
 * calculateRecoveryDose(90) // Output: 18 gramos
 */
export function calculateRecoveryDose(weight_kg: number): number {
  if (weight_kg < 50 || weight_kg > 150) {
    throw new Error('Peso debe estar entre 50 y 150 kg para dosificación segura');
  }

  const dose_grams = weight_kg * 0.2;

  // Redondear a múltiplos de 0.5 gramos (más fácil de medir)
  return Math.round(dose_grams * 2) / 2;
}

/**
 * Calcula la dosis recomendada de Hydration basada en peso corporal
 * Fórmula: (peso_kg * 0.15) + 5 gramos
 *
 * @param weight_kg - Peso corporal en kilogramos
 * @returns Dosis recomendada en gramos
 *
 * @example
 * calculateHydrationDose(70) // Output: 15.5 gramos
 * calculateHydrationDose(90) // Output: 18.5 gramos
 */
export function calculateHydrationDose(weight_kg: number): number {
  if (weight_kg < 50 || weight_kg > 150) {
    throw new Error('Peso debe estar entre 50 y 150 kg para dosificación segura');
  }

  const dose_grams = (weight_kg * 0.15) + 5;

  // Redondear a múltiplos de 0.5 gramos
  return Math.round(dose_grams * 2) / 2;
}

/**
 * Calcula la dosis recomendada de Immunity (Vitamina C) basada en peso corporal
 * Fórmula: 500mg + (peso_kg * 2mg)
 * Máximo seguro: 2000mg/día
 *
 * @param weight_kg - Peso corporal en kilogramos
 * @returns Dosis recomendada en miligramos
 *
 * @example
 * calculateImmunityDose(70) // Output: 640 mg
 * calculateImmunityDose(90) // Output: 680 mg
 */
export function calculateImmunityDose(weight_kg: number): number {
  if (weight_kg < 50 || weight_kg > 150) {
    throw new Error('Peso debe estar entre 50 y 150 kg para dosificación segura');
  }

  let dose_mg = 500 + (weight_kg * 2);

  // Limitar al máximo seguro de 2000mg
  if (dose_mg > 2000) {
    dose_mg = 2000;
  }

  // Redondear a múltiplos de 10mg
  return Math.round(dose_mg / 10) * 10;
}

/**
 * Retorna información de dosificación completa para un producto
 *
 * @param product_id - ID del producto: 'recovery', 'hydration', 'immunity'
 * @param weight_kg - Peso corporal en kilogramos
 * @returns Objeto con dosificación detallada
 */
export function getDosageInfo(product_id: string, weight_kg: number) {
  const dosages: Record<string, any> = {
    recovery: {
      product_name: 'Pure24 Recovery',
      dose_grams: calculateRecoveryDose(weight_kg),
      servings: Math.ceil(calculateRecoveryDose(weight_kg) / 15),
      timing: 'dentro de 60-120 minutos post-entrenamiento',
      water_ml: 250,
      notes: 'Mezclar en agua o bebida deportiva'
    },
    hydration: {
      product_name: 'Pure24 Hydration',
      dose_grams: calculateHydrationDose(weight_kg),
      servings: Math.ceil(calculateHydrationDose(weight_kg) / 20),
      timing: 'durante o inmediatamente post-entrenamiento',
      water_ml: 500,
      notes: 'Tomar con agua, una dosis por 500ml'
    },
    immunity: {
      product_name: 'Pure24 Immunity',
      dose_mg: calculateImmunityDose(weight_kg),
      servings: Math.ceil(calculateImmunityDose(weight_kg) / 500),
      timing: 'post-entrenamiento o con comida',
      water_ml: 200,
      notes: 'Tomar con alimento para mejor absorción'
    }
  };

  if (!dosages[product_id]) {
    throw new Error(`Producto desconocido: ${product_id}`);
  }

  return dosages[product_id];
}

/**
 * Validación de rango de peso
 */
export function validateWeight(weight_kg: number): { valid: boolean; message: string } {
  if (weight_kg < 50) {
    return { valid: false, message: 'Peso muy bajo. Mínimo recomendado: 50 kg' };
  }

  if (weight_kg > 150) {
    return { valid: false, message: 'Peso muy alto. Máximo recomendado: 150 kg. Consulta con un especialista.' };
  }

  return { valid: true, message: 'Peso válido para dosificación' };
}

export default {
  calculateRecoveryDose,
  calculateHydrationDose,
  calculateImmunityDose,
  getDosageInfo,
  validateWeight
};
