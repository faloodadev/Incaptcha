import { storage } from '../storage';
import { nanoid } from 'nanoid';

// Indian cultural image categories with sample Unsplash seeds
const ASSET_CATEGORIES = {
  street_food: {
    category: 'street_food',
    tags: ['food', 'indian', 'street', 'snacks'],
    localeTags: ['india', 'mumbai', 'delhi'],
    samples: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1626776876729-bab4fe8c2e88?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&h=300&fit=crop',
    ],
  },
  temple: {
    category: 'temple',
    tags: ['temple', 'architecture', 'religious', 'hindu'],
    localeTags: ['india', 'heritage'],
    samples: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=300&h=300&fit=crop',
    ],
  },
  yellow_bus: {
    category: 'yellow_bus',
    tags: ['bus', 'vehicle', 'transport', 'yellow'],
    localeTags: ['india', 'school'],
    samples: [
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=300&fit=crop',
    ],
  },
  rangoli: {
    category: 'rangoli',
    tags: ['rangoli', 'art', 'traditional', 'colorful'],
    localeTags: ['india', 'festival'],
    samples: [
      'https://images.unsplash.com/photo-1604608672516-f1b33a8e97cf?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1609619385002-f40c53df2cc4?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1604608672516-f1b33a8e97cf?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1609619385002-f40c53df2cc4?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1604608672516-f1b33a8e97cf?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1609619385002-f40c53df2cc4?w=300&h=300&fit=crop',
    ],
  },
  random: {
    category: 'random',
    tags: ['misc', 'object', 'scene'],
    localeTags: [],
    samples: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop',
    ],
  },
};

export async function seedAssets(): Promise<void> {
  const existingAssets = await storage.getAllAssets();
  
  // Only seed if database is empty
  if (existingAssets.length > 0) {
    return;
  }

  console.log('Seeding asset database...');
  
  for (const [key, data] of Object.entries(ASSET_CATEGORIES)) {
    for (let i = 0; i < data.samples.length; i++) {
      await storage.createAsset({
        id: nanoid(),
        url: data.samples[i],
        category: data.category,
        tags: data.tags,
        localeTags: data.localeTags,
        safeForKids: true,
        width: 300,
        height: 300,
      });
    }
  }
  
  console.log('Asset database seeded successfully');
}

export async function getRandomAssets(count: number = 9): Promise<string[]> {
  const allAssets = await storage.getAllAssets();
  
  if (allAssets.length === 0) {
    // Fallback to random picsum photos
    return Array.from({ length: count }, (_, i) => 
      `https://picsum.photos/300/300?random=${Date.now() + i}`
    );
  }
  
  // Shuffle and take random assets
  const shuffled = allAssets.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(asset => asset.url);
}

export async function getAssetsForCategory(category: string, count: number = 9): Promise<string[]> {
  const categoryAssets = await storage.getAssetsByCategory(category, 50);
  
  if (categoryAssets.length === 0) {
    return getRandomAssets(count);
  }
  
  // Shuffle and take
  const shuffled = categoryAssets.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(asset => asset.url);
}

export function getRandomCategory(): string {
  const categories = Object.keys(ASSET_CATEGORIES);
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
}

export function getCategoryPrompt(category: string): string {
  const prompts: Record<string, string> = {
    street_food: 'Select all images with Indian street food',
    temple: 'Select all images with temples',
    yellow_bus: 'Select all images with yellow buses',
    rangoli: 'Select all images with rangoli patterns',
    random: 'Select all matching images',
  };
  
  return prompts[category] || 'Select all matching images';
}
