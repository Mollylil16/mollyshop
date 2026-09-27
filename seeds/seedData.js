const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/mollyshop';
const MONGO_URI_FALLBACK = 'mongodb://127.0.0.1:27017/mollyshop';

const shoesData = [
  {
    name: 'Nike Air Max 95 "Denim & Washed Indigo"',
    brand: 'Nike',
    category: 'Sneakers & Streetwear',
    price: 175000,
    oldPrice: 195000,
    description: 'Édition spéciale Air Max 95 habillée de denim brut et toile chambray délavée. Surpiqûres artisanales, mini Swoosh brodé et coussins d\'air Max 360° pour un confort de marche incomparable à Abidjan.',
    image: '/img/NIKE+AIR+MAX+95+BIG+BUBBLE.avif',
    badge: 'DROP EXCLUSIF',
    badgeType: 'gold',
    sizes: [40, 41, 42, 43, 44, 45],
    colors: ['Washed Indigo / Chambray', 'Denim Brut'],
    stock: 9,
    rating: 4.9,
    reviewsCount: 38,
    isFeatured: true,
    isHero: true,
    tags: ['Nike', 'Air Max 95', 'Denim', 'Streetwear'],
    specs: {
      upperMaterial: 'Toile denim washed et cuir nubuck indigo',
      sole: 'Amorti Max Air sous pression intégrale',
      origin: 'Import officiel certifié neuf en boîte'
    }
  },
  {
    name: 'Berluti Fast Track Derby Cuir Venezia Nero Grigio',
    brand: 'Berluti',
    category: 'Luxe & Créateurs',
    price: 380000,
    oldPrice: 420000,
    description: 'Soulier d\'exception de la maison Berluti associant la noblesse du cuir Venezia patiné à la main aux lignes athlétiques d\'une semelle crantée tout confort. Un modèle sartorial d\'une élégance rare pour les grandes occasions.',
    image: '/img/S6273-001_fast-track-derby_nero-grigio_berluti_05.jpg',
    badge: 'HAUTE MAROQUINERIE',
    badgeType: 'gold',
    sizes: [40, 41, 42, 43, 44, 45],
    colors: ['Nero Grigio Patiné'],
    stock: 4,
    rating: 5.0,
    reviewsCount: 14,
    isFeatured: true,
    isHero: false,
    tags: ['Berluti', 'Luxe', 'Cuir Venezia', 'Derby'],
    specs: {
      upperMaterial: '100% Cuir Venezia pleine fleur patiné artisanalement',
      sole: 'Gomme technique hybride ultra-légère',
      origin: 'Fabriqué en Italie'
    }
  },
  {
    name: 'Maison Margiela Padded High-Top Chunky Straps',
    brand: 'Maison Margiela',
    category: 'Avant-Garde',
    price: 350000,
    oldPrice: null,
    description: 'Création phare des défilés Margiela. Silhouette haute sculpturale composée d\'épaisses sangles en cuir nappa matelassé écru entourant le pied avec une semelle plateforme asymétrique.',
    image: '/img/S97WS0094-P7688-T2043-1.webp',
    badge: 'PIÈCE DÉFILÉ',
    badgeType: 'gold',
    sizes: [40, 41, 42, 43, 44],
    colors: ['Écru Albâtre', 'Craie Pur'],
    stock: 5,
    rating: 4.9,
    reviewsCount: 19,
    isFeatured: true,
    isHero: false,
    tags: ['Maison Margiela', 'Avant-Garde', 'Runway', 'High-Top'],
    specs: {
      upperMaterial: 'Cuir nappa souple rembourré et doublure première cuir',
      sole: 'Plateforme sculpturale en gomme expansée',
      origin: 'Atelier Maison Margiela, Italie'
    }
  },
  {
    name: 'Berluti Shadow Sneakers Maille Grise & Cuir',
    brand: 'Berluti',
    category: 'Luxe & Créateurs',
    price: 285000,
    oldPrice: 310000,
    description: 'Alliance magistrale du confort moderne et de la tradition bottière. Empeigne en maille tricotée respirante grise ornée des signatures en cuir Berluti sur la languette et le contrefort.',
    image: '/img/698289_NjIwLTQzMC04ZjgzZDBhZTg5LTE.webp',
    badge: 'BEST-SELLER LUXE',
    badgeType: 'gold',
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: ['Gris Chiné / Noir', 'Anthracite'],
    stock: 8,
    rating: 4.9,
    reviewsCount: 27,
    isFeatured: true,
    isHero: false,
    tags: ['Berluti', 'Shadow', 'Knit', 'Sneakers Luxe'],
    specs: {
      upperMaterial: 'Maille stretch technique et cuir de veau Berluti',
      sole: 'Semelle ergonomique à vagues bi-matière',
      origin: 'Fabriqué en Italie'
    }
  },
  {
    name: 'Mocassins Tabi Cuir Glacé Noir Semelle Crantée',
    brand: 'Maison Margiela',
    category: 'Avant-Garde',
    price: 320000,
    oldPrice: null,
    description: 'Le soulier le plus iconique de l\'avant-garde contemporaine. Bout fendu Tabi inspiré du Japon traditionnel, confectionné en cuir poli brillant avec une semelle crantée robuste.',
    image: '/img/images (2).jpg',
    badge: 'ICÔNE AVANT-GARDE',
    badgeType: 'gold',
    sizes: [40, 41, 42, 43, 44, 45],
    colors: ['Noir Glacé'],
    stock: 6,
    rating: 5.0,
    reviewsCount: 31,
    isFeatured: true,
    isHero: false,
    tags: ['Margiela', 'Tabi', 'Mocassins', 'Avant-Garde'],
    specs: {
      upperMaterial: '100% Cuir de veau glacé brillant',
      sole: 'Semelle commando crantée en gomme dense',
      origin: 'Atelier Maison Margiela, Italie'
    }
  },
  {
    name: 'Maison Margiela Replica "Paint Splatter" GAT',
    brand: 'Maison Margiela',
    category: 'Luxe & Créateurs',
    price: 260000,
    oldPrice: 285000,
    description: 'La sneaker Replica légendaire rehaussée de projections de peinture multicolores appliquées à la main. Chaque paire est unique. Cuir de veau nappa, veau velours doux et semelle gomme rétro.',
    image: '/img/images (3).jpg',
    badge: 'FAIT MAIN',
    badgeType: 'gold',
    sizes: [40, 41, 42, 43, 44, 45],
    colors: ['Blanc Peintures Artisanal'],
    stock: 7,
    rating: 4.9,
    reviewsCount: 42,
    isFeatured: true,
    isHero: false,
    tags: ['Margiela', 'Replica', 'Paint Drop', 'GAT'],
    specs: {
      upperMaterial: 'Cuir nappa blanc et suède gris avec projections réelles',
      sole: 'Gomme naturelle ambrée',
      origin: 'Atelier Maison Margiela, Italie'
    }
  },
  {
    name: 'Maison Margiela Future High-Top Cuir Blanc',
    brand: 'Maison Margiela',
    category: 'Luxe & Créateurs',
    price: 290000,
    oldPrice: 320000,
    description: 'Silhouette montante futuriste minimaliste avec rabats recouvrant le laçage et large sangle rembourrée à la cheville. Confectionnée dans un cuir nappa blanc haut de gamme.',
    image: '/img/images (4).jpg',
    badge: 'COLLECTION PRIVÉE',
    badgeType: 'gold',
    sizes: [41, 42, 43, 44, 45],
    colors: ['Blanc Pur Nappa'],
    stock: 5,
    rating: 4.8,
    reviewsCount: 22,
    isFeatured: false,
    isHero: false,
    tags: ['Margiela', 'Future', 'High-Top', 'Monochrome'],
    specs: {
      upperMaterial: '100% Cuir nappa italien première qualité',
      sole: 'Cupsole en caoutchouc monochrome blanc',
      origin: 'Fabriqué en Italie'
    }
  },
  {
    name: 'Richelieus Cérémonie Cuir Verni Bicolore Cognac & Acajou',
    brand: 'Cérémonie & Prestige',
    category: 'Ville & Cérémonie',
    price: 195000,
    oldPrice: 220000,
    description: 'Soulier d\'apparat habillé pour mariages, galas et rendez-vous d\'affaires. Alliance prestigieuse de cuir patiné cognac chaleureux et de cuir verni acajou effet miroir avec perforations brogues.',
    image: '/img/b558aab8a9b9fb6240418aff1d0f18bdd1f1603c_original.jpeg',
    badge: 'GRAND SOIR',
    badgeType: 'gold',
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: ['Cognac & Acajou Verni'],
    stock: 10,
    rating: 4.9,
    reviewsCount: 36,
    isFeatured: true,
    isHero: false,
    tags: ['Richelieus', 'Verni', 'Bicolore', 'Cérémonie'],
    specs: {
      upperMaterial: 'Cuir verni glacé et cuir pleine fleur patiné',
      sole: 'Semelle cuir véritable avec patin gomme anti-dérapant',
      origin: 'Confection artisanale soignée'
    }
  },
  {
    name: 'Sneakers Minimalistes Cuir Pleine Fleur Blanc Craie',
    brand: 'Casual Chic',
    category: 'Sneakers & Streetwear',
    price: 160000,
    oldPrice: null,
    description: 'Le summum de la tennis épurée. Cuir de veau lisse immaculé, intérieur doublé en cuir souple camel et semelle cousue latérale. S\'accorde aussi bien avec un costume qu\'un jean brut.',
    image: '/img/face55.jpg',
    badge: 'INTEMPOREL',
    badgeType: 'gold',
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: ['Blanc Craie Doublure Camel'],
    stock: 12,
    rating: 4.8,
    reviewsCount: 45,
    isFeatured: false,
    isHero: false,
    tags: ['Minimaliste', 'Cuir Blanc', 'Court', 'Chic'],
    specs: {
      upperMaterial: 'Cuir de veau pleine fleur lisse',
      sole: 'Semelle cousue Blake en gomme durable',
      origin: 'Confection premium'
    }
  },
  {
    name: 'Derbies Hybrides Sport-Chic Bleu Nuit',
    brand: 'Smart Casual',
    category: 'Ville & Cérémonie',
    price: 145000,
    oldPrice: 165000,
    description: 'Soulier urbain raffiné mariant la coupe d\'un derby en cuir suédé bleu marine à la légèreté d\'une semelle blanche contrastée. Idéal pour être élégant et à l\'aise toute la journée.',
    image: '/img/029a5093e9813a2ccc553d9018e04b91.jpg',
    badge: 'CONFORT ÉLÉGANT',
    badgeType: 'gold',
    sizes: [40, 41, 42, 43, 44, 45],
    colors: ['Bleu Nuit Semelle Blanche'],
    stock: 11,
    rating: 4.8,
    reviewsCount: 29,
    isFeatured: false,
    isHero: false,
    tags: ['Derby', 'Hybride', 'Bleu Marine', 'Casual'],
    specs: {
      upperMaterial: 'Cuir nubuck texturé respirant',
      sole: 'Semelle sneaker confort anti-choc',
      origin: 'Importation certifiée'
    }
  },
  {
    name: 'Richelieus Smoking Cuir Verni Noir Miroir',
    brand: 'Cérémonie & Prestige',
    category: 'Ville & Cérémonie',
    price: 115000,
    oldPrice: 130000,
    description: 'Soulier de cérémonie par excellence. Lignes épurées, cuir verni noir à la brillance parfaite et laçage fermé pour compléter vos costumes trois pièces et smokings de gala.',
    image: '/img/images (5).jpg',
    badge: 'SMOKING OFFICIEL',
    badgeType: 'gold',
    sizes: [39, 40, 41, 42, 43, 44, 45, 46],
    colors: ['Noir Miroir Glacé'],
    stock: 14,
    rating: 4.9,
    reviewsCount: 52,
    isFeatured: false,
    isHero: false,
    tags: ['Smoking', 'Verni', 'Noir', 'Mariage'],
    specs: {
      upperMaterial: 'Cuir verni haute brillance anti-rayures',
      sole: 'Semelle d\'usure habillée cousue',
      origin: 'Atelier de confection habillée'
    }
  },
  {
    name: 'Derbies Cérémonie Deux Tons Cognac & Acajou',
    brand: 'Cérémonie & Prestige',
    category: 'Ville & Cérémonie',
    price: 140000,
    oldPrice: null,
    description: 'Derby masculin raffiné associant un bout droit verni acajou foncé et une tige en cuir plissé cognac. Talon bottier texturé garantissant prestance et distinction.',
    image: '/img/images (9).jpg',
    badge: 'STYLE DISTINGUÉ',
    badgeType: 'gold',
    sizes: [40, 41, 42, 43, 44, 45],
    colors: ['Cognac & Acajou Fumé'],
    stock: 8,
    rating: 4.8,
    reviewsCount: 24,
    isFeatured: false,
    isHero: false,
    tags: ['Derby', 'Deux Tons', 'Patine', 'Élégance'],
    specs: {
      upperMaterial: 'Cuir verni et cuir souple travaillé',
      sole: 'Semelle renforcée avec talon biseauté',
      origin: 'Importation certifiée'
    }
  },
  {
    name: 'Converse Chuck Taylor All Star Low Toile Noire',
    brand: 'Converse',
    category: 'Sneakers & Streetwear',
    price: 100000,
    oldPrice: null,
    description: 'La référence mondiale absolue du casual streetwear. Toile canvas résistante noire, œillets métalliques inoxydables, bout en caoutchouc blanc et semelle vulcanisée avec semelle extérieure gaufrée.',
    image: '/img/images (1).jpg',
    badge: 'CLIQUE INTEMPOREL',
    badgeType: 'gold',
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    colors: ['Noir Classique & Blanc'],
    stock: 20,
    rating: 4.9,
    reviewsCount: 88,
    isFeatured: false,
    isHero: false,
    tags: ['Converse', 'All Star', 'Toile', 'Classic'],
    specs: {
      upperMaterial: 'Toile coton épaisse haute résistance',
      sole: 'Caoutchouc vulcanisé classique',
      origin: 'Importation officielle certifiée Converse'
    }
  },
  {
    name: 'Nike Air Force 1 Low Sail & Surpiqûres Rouges',
    brand: 'Nike',
    category: 'Sneakers & Streetwear',
    price: 135000,
    oldPrice: 150000,
    description: 'Réinterprétation raffinée de la légendaire AF1. Empeigne en cuir beige cassé (Sail), surpiqûres rouges artisanales, doublure en mesh bleu électrique et semelle extérieure Ice translucide.',
    image: '/img/images (6).jpg',
    badge: 'ÉDITION SPÉCIALE',
    badgeType: 'gold',
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: ['Sail Crème / Rouge / Bleu'],
    stock: 13,
    rating: 4.9,
    reviewsCount: 63,
    isFeatured: true,
    isHero: false,
    tags: ['Nike', 'Air Force 1', 'Sail', 'Ice Sole'],
    specs: {
      upperMaterial: 'Cuir véritable de première qualité',
      sole: 'Amorti Nike Air encapsulé et semelle Ice',
      origin: 'Import officiel certifié'
    }
  },
  {
    name: 'Adidas Originals Campus 00s Grey Gum',
    brand: 'Adidas Originals',
    category: 'Sneakers & Streetwear',
    price: 120000,
    oldPrice: 135000,
    description: 'La silhouette skate rétro la plus demandée du moment. Tige en suède brossé gris clair, 3 bandes blanches emblématiques, lacets épais rembourrés et semelle en gomme ambrée naturelle.',
    image: '/img/images (8).jpg',
    badge: 'TENDANCE 2026',
    badgeType: 'gold',
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    colors: ['Grey One / Cloud White / Gum'],
    stock: 15,
    rating: 4.9,
    reviewsCount: 71,
    isFeatured: true,
    isHero: false,
    tags: ['Adidas', 'Campus 00s', 'Skate', 'Suède'],
    specs: {
      upperMaterial: '100% Cuir suède doux velouté',
      sole: 'Semelle cupsole en caoutchouc gomme adhérent',
      origin: 'Importation originale Adidas'
    }
  },
  {
    name: 'Adidas Originals Campus 00s Charcoal Mocha',
    brand: 'Adidas Originals',
    category: 'Sneakers & Streetwear',
    price: 125000,
    oldPrice: null,
    description: 'Version sombre et premium de la Campus 00s en suède texturé moka anthracite avec 3 bandes noir profond. Confort moelleux grâce à son col matelassé généreux.',
    image: '/img/images (10).jpg',
    badge: 'POPULAIRE',
    badgeType: 'gold',
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: ['Charcoal Mocha / Core Black'],
    stock: 12,
    rating: 4.8,
    reviewsCount: 44,
    isFeatured: false,
    isHero: false,
    tags: ['Adidas', 'Campus', 'Mocha', 'Y2K'],
    specs: {
      upperMaterial: 'Suède épais anthracite et doublure textile douce',
      sole: 'Semelle cupsole noire renforcée',
      origin: 'Importation originale Adidas'
    }
  },
  {
    name: 'Adidas Originals Samba LT "Fold-Over Tongue" Noir & Blanc',
    brand: 'Adidas Originals',
    category: 'Sneakers & Streetwear',
    price: 135000,
    oldPrice: 155000,
    description: 'Inspirée des chaussures de football vintage des années 80. Languette rabattable surdimensionnée avec logo trèfle en relief, cuir noir grainé, bout en suède blanc et semelle gomme fine.',
    image: '/img/images (11).jpg',
    badge: 'STYLE FOOTBALL VINTAGE',
    badgeType: 'gold',
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: ['Core Black / Cloud White / Gum'],
    stock: 11,
    rating: 5.0,
    reviewsCount: 57,
    isFeatured: true,
    isHero: false,
    tags: ['Adidas', 'Samba LT', 'Fold Tongue', 'Terrace'],
    specs: {
      upperMaterial: 'Cuir souple et empiècement T-toe en suède',
      sole: 'Semelle gomme rétro profilée',
      origin: 'Import officiel Adidas certifié'
    }
  },
  {
    name: 'Sneakers Rétro Court Tennis Cuir Blanc Cassé & Suède',
    brand: 'Casual Chic',
    category: 'Sneakers & Streetwear',
    price: 140000,
    oldPrice: null,
    description: 'Modèle court d\'inspiration tennis rétro en cuir blanc cassé perforé sur l\'avant-pied pour une respirabilité optimale. Liserés en suède sable et semelle en gomme miel cousue 360°.',
    image: '/img/images.jpg',
    badge: 'CHIC URBAIN',
    badgeType: 'gold',
    sizes: [40, 41, 42, 43, 44, 45],
    colors: ['Blanc Cassé & Suède Sable'],
    stock: 9,
    rating: 4.8,
    reviewsCount: 33,
    isFeatured: false,
    isHero: false,
    tags: ['Court', 'Retro Tennis', 'Beige', 'Vintage'],
    specs: {
      upperMaterial: 'Cuir véritable perforé et suède velouté',
      sole: 'Semelle cousue en caoutchouc gomme naturelle',
      origin: 'Confection soignée'
    }
  },
  {
    name: 'Sneakers Sport Respirantes Fashion Bicolore Noir & Bleu',
    brand: 'Fashion Sport',
    category: 'Baskets & Sport',
    price: 110000,
    oldPrice: 125000,
    description: 'Basket athlétique dynamique dotée d\'une tige en maille alvéolée respirante noire et de renforts graphiques bleu roi. Unité d\'air visible au talon pour amortir chacun de vos pas.',
    image: '/img/1 (1).jpg',
    badge: 'CONFORT AIR',
    badgeType: 'gold',
    sizes: [39, 40, 41, 42, 43, 44],
    colors: ['Noir & Bleu Roi'],
    stock: 14,
    rating: 4.7,
    reviewsCount: 41,
    isFeatured: false,
    isHero: false,
    tags: ['Running', 'Fashion', 'Mesh', 'Bulle d\'Air'],
    specs: {
      upperMaterial: 'Mesh aéré ultra-respirant et TPU de maintien',
      sole: 'Semelle ergonomique avec coussin d\'air amortissant',
      origin: 'Import certifié'
    }
  },
  {
    name: 'Sneakers Basketball High-Top "Electric Claw" Noir & Cyan',
    brand: 'Performance Basket',
    category: 'Baskets & Sport',
    price: 125000,
    oldPrice: 145000,
    description: 'Chaussure de basketball montante alliant maintien ferme de la cheville et design percutant avec motifs griffes bleu cyan électrique. Semelle adhérente à motifs topographiques.',
    image: '/img/images (7).jpg',
    badge: 'PERFORMANCE HOOP',
    badgeType: 'gold',
    sizes: [40, 41, 42, 43, 44, 45, 46],
    colors: ['Noir Profond & Bleu Cyan'],
    stock: 10,
    rating: 4.8,
    reviewsCount: 39,
    isFeatured: false,
    isHero: false,
    tags: ['Basketball', 'High-Top', 'Hoop', 'Cyan'],
    specs: {
      upperMaterial: 'Matières synthétiques renforcées et col matelassé haut',
      sole: 'Gomme multi-directionnelle haute adhérence pour terrain',
      origin: 'Importation certifiée'
    }
  },
  {
    name: 'Puma MB.01 LaMelo Ball "Not From Here" Multicolore',
    brand: 'Puma Hoops',
    category: 'Baskets & Sport',
    price: 155000,
    oldPrice: 180000,
    description: 'La sneaker signature révolutionnaire du joueur NBA LaMelo Ball. Coloris électrique flamboyant jaune fluo et rose avec semelle extérieure cyan arborant la mention emblématique "NOT FROM HERE". Amorti Nitro Foam réactif.',
    image: '/img/images (12).jpg',
    badge: 'SIGNATURE NBA',
    badgeType: 'gold',
    sizes: [40, 41, 42, 43, 44, 45],
    colors: ['Volt Fluo / Rose Flamboyant / Cyan'],
    stock: 8,
    rating: 5.0,
    reviewsCount: 65,
    isFeatured: true,
    isHero: false,
    tags: ['Puma', 'LaMelo Ball', 'MB01', 'NBA', 'Fluo'],
    specs: {
      upperMaterial: 'Mesh technique respirant et renforts thermo-collés',
      sole: 'Mousse Nitro Foam réactive et gomme antidérapante',
      origin: 'Import officiel certifié Puma Hoops'
    }
  }
];

async function seedDatabase() {
  let connected = false;
  try {
    console.log(`📡 Connexion à MongoDB sur ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2500 });
    connected = true;
  } catch (err) {
    console.log(`⚠️ Échec sur port 27018, tentative sur port 27017 (${MONGO_URI_FALLBACK})...`);
    try {
      await mongoose.connect(MONGO_URI_FALLBACK, { serverSelectionTimeoutMS: 2500 });
      connected = true;
    } catch (err2) {
      console.error('❌ Erreur de connexion MongoDB :', err2.message);
      process.exit(1);
    }
  }

  if (connected) {
    console.log('✅ Connecté avec succès à MongoDB !');
    console.log('🧹 Nettoyage de l\'ancienne collection...');
    await Product.deleteMany({});

    console.log(`👟 Insertion de ${shoesData.length} modèles réels mollyShop...`);
    const inserted = await Product.insertMany(shoesData);
    console.log(`✨ ${inserted.length} produits insérés avec succès dans la base 'mollyshop' !`);

    console.log('\n📊 Répartition par catégorie :');
    const categories = [...new Set(shoesData.map(s => s.category))];
    categories.forEach(cat => {
      const count = shoesData.filter(s => s.category === cat).length;
      console.log(`  • ${cat} : ${count} modèles`);
    });

    await mongoose.connection.close();
    console.log('\n🔒 Connexion fermée.');
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { shoesData, seedDatabase };
