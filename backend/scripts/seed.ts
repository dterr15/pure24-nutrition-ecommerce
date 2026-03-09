import payload from 'payload';

const PRODUCTS_DATA = [
  // ============== PROTEÍNAS ==============
  {
    name: 'Whey Protein Isolate Premium',
    sku: 'WPI-001',
    gtin13: '7501234567890',
    price: 34990,
    stock: 50,
    category: 'proteins',
    description: 'Proteína de suero de leche isolada con 25g de proteína por porción. Absorción rápida, ideal post-entreno.',
    specifications: {
      servingSize: '25g (1 scoop)',
      servingsPerContainer: 40,
      ingredient: 'Whey Protein Isolate',
      ingredientAmount: '25g',
      weight: '1kg',
      manufacturer: 'Pure24',
      origin: 'usa'
    },
    dosage: {
      recommendedDaily: '25g (1 scoop)',
      maxDaily: '75g (3 scoops)',
      timing: 'post_workout'
    },
    tags: [{ tag: 'sin gluten' }, { tag: 'bajo en lactosa' }, { tag: 'importado' }],
    active: true,
    featured: true,
    seo: {
      metaTitle: 'Whey Protein Isolate Premium - Pure24',
      metaDescription: 'Proteína de suero isolada 25g por porción. Entrega rápida en Punta Arenas.',
      keywords: 'whey protein, proteína isolada, suplemento'
    }
  },
  {
    name: 'Casein Protein Night',
    sku: 'CAS-001',
    gtin13: '7501234567891',
    price: 39990,
    stock: 30,
    category: 'proteins',
    description: 'Proteína de caseína de absorción lenta. Ideal para tomar antes de dormir.',
    specifications: {
      servingSize: '30g',
      servingsPerContainer: 33,
      ingredient: 'Micellar Casein',
      ingredientAmount: '30g',
      weight: '1kg',
      manufacturer: 'Pure24',
      origin: 'usa'
    },
    dosage: {
      recommendedDaily: '30g antes de dormir',
      maxDaily: '60g',
      timing: 'evening'
    },
    tags: [{ tag: 'sin gluten' }, { tag: 'alto en proteína' }],
    active: true,
    featured: false,
    seo: {
      metaTitle: 'Casein Protein Night - Pure24',
      metaDescription: 'Proteína de caseína de absorción lenta. Ideal para dormir.',
      keywords: 'casein, caseína, proteína noche'
    }
  },
  {
    name: 'Whey Protein Concentrate Standard',
    sku: 'WPC-001',
    gtin13: '7501234567892',
    price: 24990,
    stock: 75,
    category: 'proteins',
    description: 'Proteína de concentrado con 20g por porción. Relación calidad-precio excelente.',
    specifications: {
      servingSize: '25g',
      servingsPerContainer: 40,
      ingredient: 'Whey Protein Concentrate',
      ingredientAmount: '20g',
      weight: '1kg',
      manufacturer: 'Pure24',
      origin: 'usa'
    },
    dosage: {
      recommendedDaily: '25g',
      maxDaily: '75g',
      timing: 'anytime'
    },
    tags: [{ tag: 'asequible' }, { tag: 'popular' }],
    active: true,
    featured: true,
    seo: {
      metaTitle: 'Whey Protein Concentrate - Pure24',
      metaDescription: 'Proteína de concentrado 20g por porción. Precio accesible.',
      keywords: 'whey concentrate, proteína accesible'
    }
  },
  // ============== AMINOÁCIDOS ==============
  {
    name: 'BCAA 2:1:1 Ratio',
    sku: 'BCAA-001',
    gtin13: '7501234567893',
    price: 19990,
    stock: 40,
    category: 'amino_acids',
    description: 'BCAA con ratio 2:1:1 (leucina:isoleucina:valina). Ideal para entrenamientos intensos.',
    specifications: {
      servingSize: '5g',
      servingsPerContainer: 40,
      ingredient: 'BCAA Blend',
      ingredientAmount: '5g',
      weight: '200g',
      manufacturer: 'Pure24',
      origin: 'usa'
    },
    dosage: {
      recommendedDaily: '5-10g',
      maxDaily: '20g',
      timing: 'pre_workout'
    },
    tags: [{ tag: 'anti-catabólico' }, { tag: 'pre-entreno' }],
    active: true,
    featured: false,
    seo: {
      metaTitle: 'BCAA 2:1:1 - Pure24',
      metaDescription: 'BCAA con ratio óptimo para musculatura.',
      keywords: 'bcaa, aminoácidos, leucina'
    }
  },
  {
    name: 'L-Glutamine Premium',
    sku: 'GLUT-001',
    gtin13: '7501234567894',
    price: 22990,
    stock: 35,
    category: 'amino_acids',
    description: 'Glutamina pura con 5g por porción. Recuperación muscular y salud intestinal.',
    specifications: {
      servingSize: '5g',
      servingsPerContainer: 40,
      ingredient: 'L-Glutamine',
      ingredientAmount: '5g',
      weight: '200g',
      manufacturer: 'Pure24',
      origin: 'europe'
    },
    dosage: {
      recommendedDaily: '5g post-entreno',
      maxDaily: '15g',
      timing: 'post_workout'
    },
    tags: [{ tag: 'recuperación' }, { tag: 'salud intestinal' }],
    active: true,
    featured: false,
    seo: {
      metaTitle: 'L-Glutamine Premium - Pure24',
      metaDescription: 'Glutamina pura para recuperación muscular.',
      keywords: 'glutamina, recuperación, intestino'
    }
  },
  {
    name: 'Creatine Monohydrate Powder',
    sku: 'CREA-001',
    gtin13: '7501234567895',
    price: 15990,
    stock: 100,
    category: 'amino_acids',
    description: 'Creatina monohidrato 100% pura. Aumento de fuerza y masa muscular.',
    specifications: {
      servingSize: '5g',
      servingsPerContainer: 40,
      ingredient: 'Creatine Monohydrate',
      ingredientAmount: '5g',
      weight: '200g',
      manufacturer: 'Pure24',
      origin: 'usa'
    },
    dosage: {
      recommendedDaily: '5g',
      maxDaily: '10g',
      timing: 'anytime'
    },
    tags: [{ tag: 'fuerza' }, { tag: 'resistencia' }, { tag: 'comprobado científicamente' }],
    active: true,
    featured: true,
    seo: {
      metaTitle: 'Creatine Monohydrate - Pure24',
      metaDescription: 'Creatina 100% pura para fuerza y potencia.',
      keywords: 'creatina, fuerza, monohydrate'
    }
  },
  // ============== VITAMINAS ==============
  {
    name: 'Multivitamínico Completo',
    sku: 'MULTI-001',
    gtin13: '7501234567896',
    price: 18990,
    stock: 60,
    category: 'vitamins',
    description: 'Complejo multivitamínico con 25 nutrientes esenciales. Salud general y energía.',
    specifications: {
      servingSize: '2 cápsulas',
      servingsPerContainer: 30,
      ingredient: 'Vitamin Complex',
      ingredientAmount: 'Multi-nutriente',
      weight: '60 cápsulas',
      manufacturer: 'Pure24',
      origin: 'usa'
    },
    dosage: {
      recommendedDaily: '2 cápsulas con alimento',
      maxDaily: '2 cápsulas',
      timing: 'morning'
    },
    tags: [{ tag: 'salud general' }, { tag: 'energía' }, { tag: 'vegano' }],
    active: true,
    featured: false,
    seo: {
      metaTitle: 'Multivitamínico Completo - Pure24',
      metaDescription: '25 nutrientes esenciales en una cápsula.',
      keywords: 'vitaminas, multivitamínico, nutrientes'
    }
  },
  {
    name: 'Vitamin C 1000mg',
    sku: 'VITC-001',
    gtin13: '7501234567897',
    price: 12990,
    stock: 80,
    category: 'vitamins',
    description: 'Vitamina C pura 1000mg por cápsula. Antioxidante y apoyo inmunológico.',
    specifications: {
      servingSize: '1 cápsula',
      servingsPerContainer: 100,
      ingredient: 'Ascorbic Acid',
      ingredientAmount: '1000mg',
      weight: '100 cápsulas',
      manufacturer: 'Pure24',
      origin: 'usa'
    },
    dosage: {
      recommendedDaily: '1 cápsula',
      maxDaily: '2 cápsulas',
      timing: 'morning'
    },
    tags: [{ tag: 'antioxidante' }, { tag: 'inmunidad' }, { tag: 'asequible' }],
    active: true,
    featured: false,
    seo: {
      metaTitle: 'Vitamin C 1000mg - Pure24',
      metaDescription: 'Vitamina C pura para inmunidad.',
      keywords: 'vitamina c, antioxidante, inmunidad'
    }
  },
  // ============== MINERALES ==============
  {
    name: 'Zinc + Magnesium + B6',
    sku: 'ZMB-001',
    gtin13: '7501234567898',
    price: 16990,
    stock: 50,
    category: 'minerals',
    description: 'Complejo ZMA: Zinc, Magnesio y Vitamina B6. Testosterona y recuperación.',
    specifications: {
      servingSize: '3 cápsulas',
      servingsPerContainer: 30,
      ingredient: 'Zinc + Magnesium + B6',
      ingredientAmount: 'Multi-mineral',
      weight: '90 cápsulas',
      manufacturer: 'Pure24',
      origin: 'usa'
    },
    dosage: {
      recommendedDaily: '3 cápsulas antes de dormir',
      maxDaily: '3 cápsulas',
      timing: 'evening'
    },
    tags: [{ tag: 'testosterona' }, { tag: 'recuperación' }, { tag: 'sueño' }],
    active: true,
    featured: false,
    seo: {
      metaTitle: 'ZMA Complex - Pure24',
      metaDescription: 'Zinc, Magnesio, B6 para testosterona.',
      keywords: 'zma, zinc, magnesio, testosterona'
    }
  },
  {
    name: 'Calcio + Vitamina D3',
    sku: 'CALC-001',
    gtin13: '7501234567899',
    price: 14990,
    stock: 70,
    category: 'minerals',
    description: 'Calcio + Vitamina D3 para huesos fuertes y absorción óptima.',
    specifications: {
      servingSize: '2 cápsulas',
      servingsPerContainer: 50,
      ingredient: 'Calcium + Vitamin D3',
      ingredientAmount: 'Mineral blend',
      weight: '100 cápsulas',
      manufacturer: 'Pure24',
      origin: 'usa'
    },
    dosage: {
      recommendedDaily: '2 cápsulas con alimento',
      maxDaily: '2 cápsulas',
      timing: 'anytime'
    },
    tags: [{ tag: 'huesos' }, { tag: 'salud ósea' }, { tag: 'absorción' }],
    active: true,
    featured: false,
    seo: {
      metaTitle: 'Calcio + Vitamina D3 - Pure24',
      metaDescription: 'Calcio y D3 para huesos fuertes.',
      keywords: 'calcio, vitamina d3, huesos'
    }
  }
];

const seed = async () => {
  console.log('🌱 Iniciando seeding de productos...');
  try {
    // Conectar a Payload
    await payload.init();

    // Contar productos existentes
    const existing = await payload.find({
      collection: 'products',
    });

    if (existing.docs.length > 0) {
      console.log(`⚠️  Ya hay ${existing.docs.length} productos. Saltando seed.`);
      process.exit(0);
    }

    // Crear usuario admin si no existe
    let adminUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'admin@pure24.cl',
        },
      },
    });

    if (adminUser.docs.length === 0) {
      console.log('👤 Creando usuario admin...');
      await payload.create({
        collection: 'users',
        data: {
          email: 'admin@pure24.cl',
          password: 'Admin@123456',
          name: 'Administrador Pure24',
          role: 'admin',
          active: true,
        },
      });
      console.log('✅ Usuario admin creado: admin@pure24.cl / Admin@123456');
    }

    // Seedear productos
    console.log(`📦 Creando ${PRODUCTS_DATA.length} productos...`);
    for (const productData of PRODUCTS_DATA) {
      try {
        await payload.create({
          collection: 'products',
          data: {
            ...productData,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log(`✅ ${productData.name}`);
      } catch (err: any) {
        console.error(`❌ Error creando ${productData.name}:`, err.message);
      }
    }

    console.log('✨ Seeding completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante seeding:', error);
    process.exit(1);
  }
};

seed();
