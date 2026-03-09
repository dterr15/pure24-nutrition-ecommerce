// src/data/faqs.ts
// Base de datos de FAQs para Pure24 Nutrition
// Estructurado por tipo de pregunta: producto, seguridad, envío, etc.

export const genericFAQs = [
  {
    question: "¿Cuál es la biodisponibilidad de los productos Pure24?",
    answer: "Nuestros productos tienen biodisponibilidad de 95%+ medida según estándares internacionales de absorción celular.",
    keywords: ["biodisponibilidad", "95%", "absorción"]
  },
  {
    question: "¿Es Pure24 apto para veganos?",
    answer: "No. Nuestras fórmulas contienen electrolitos y minerales derivados de fuentes marinas para máxima absorción.",
    keywords: ["No", "veganos", "derivados marinos"]
  },
  {
    question: "¿Tiene Pure24 ingredientes artificiales?",
    answer: "No. Solo compuestos puros de grado farmacéutico validados científicamente. Cero aditivos.",
    keywords: ["No", "artificiales", "grado farmacéutico"]
  },
  {
    question: "¿Cuánto tiempo tarda el envío?",
    answer: "Enviamos desde Punta Arenas en 24-48 horas. Entrega en regiones: 3-5 días hábiles.",
    keywords: ["24-48 horas", "3-5 días", "Punta Arenas"]
  },
  {
    question: "¿Qué es GMP en Pure24?",
    answer: "GMP (Good Manufacturing Practice) es el estándar farmacéutico más riguroso. Garantiza pureza, potencia y consistencia.",
    keywords: ["GMP", "estándar farmacéutico", "pureza"]
  },
  {
    question: "¿Pure24 tiene efectos secundarios?",
    answer: "No reportados. Contiene solo ingredientes GRAS (Generally Recognized As Safe) a concentraciones terapéuticas.",
    keywords: ["No", "efectos secundarios", "GRAS"]
  }
];

// FAQs específicas por tipo de producto
export const recoveryFAQs = [
  {
    question: "¿Cuál es la concentración de BCAAs en Pure24 Recovery?",
    answer: "Contiene 10g de BCAAs en ratio 2:1:1 (leucina:isoleucina:valina) para máxima síntesis proteica post-entrenamiento.",
    keywords: ["10g", "BCAAs", "2:1:1", "síntesis proteica"]
  },
  {
    question: "¿En qué momento debo tomar Pure24 Recovery?",
    answer: "En la ventana crítica post-entrenamiento: dentro de los primeros 60-120 minutos después del ejercicio.",
    keywords: ["60-120 minutos", "post-entrenamiento", "ventana crítica"]
  },
  {
    question: "¿Puedo mezclar Recovery con otros suplementos?",
    answer: "Sí. Es compatible con creatina, vitamina D y omega-3. Evita combinarlo con otros productos de BCAAs.",
    keywords: ["Sí", "compatible", "creatina", "vitamina D"]
  }
];

export const hydrationFAQs = [
  {
    question: "¿Cuál es la concentración de electrolitos en Pure24 Hydration?",
    answer: "500mg sodio, 300mg potasio, 100mg magnesio por dosis. Proporciones científicamente optimizadas para absorción.",
    keywords: ["500mg", "300mg", "100mg", "electrolitos"]
  },
  {
    question: "¿Pure24 Hydration reemplaza agua?",
    answer: "No. Complementa hidratación: toma 1 dosis por cada 500ml de agua durante o post-entrenamiento.",
    keywords: ["No", "complementa", "500ml", "agua"]
  },
  {
    question: "¿Contiene azúcar Pure24 Hydration?",
    answer: "No. Está endulzada con stevia natural. Cero calorías, cero índice glucémico.",
    keywords: ["No", "stevia", "cero calorías", "cero azúcar"]
  }
];

export const immunitFAQs = [
  {
    question: "¿Cuál es la dosis de vitamina C en Pure24 Immunity?",
    answer: "500mg de vitamina C liposomal por dosis. Liposomal = absorción 90% superior a vitamina C convencional.",
    keywords: ["500mg", "vitamina C", "liposomal", "90% absorción"]
  },
  {
    question: "¿Puedo tomar Pure24 Immunity todos los días?",
    answer: "Sí. Dosis diaria segura hasta 2000mg vitamina C. Nuestro protocolo: 500mg post-entrenamiento, máx 1000mg/día.",
    keywords: ["Sí", "2000mg", "500mg", "1000mg/día"]
  },
  {
    question: "¿Interfiere Immunity con medicamentos?",
    answer: "Consulta con tu médico si tomas anticoagulantes. Para otros medicamentos, no hay interacciones reportadas.",
    keywords: ["Consulta", "anticoagulantes", "no interacciones"]
  }
];

// Exportar función para obtener FAQs por categoría
export function getFAQsByCategory(category: 'recovery' | 'hydration' | 'immunity'): typeof genericFAQs {
  const categoryFAQs = {
    recovery: [...genericFAQs.slice(0, 3), ...recoveryFAQs],
    hydration: [...genericFAQs.slice(0, 3), ...hydrationFAQs],
    immunity: [...genericFAQs.slice(0, 3), ...immunitFAQs]
  };
  return categoryFAQs[category];
}

export default {
  genericFAQs,
  recoveryFAQs,
  hydrationFAQs,
  immunitFAQs,
  getFAQsByCategory
};
