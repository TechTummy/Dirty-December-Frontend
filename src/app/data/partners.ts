export interface Partner {
  id: string;
  name: string;
  logo: string;
  category: string;
  description: string;
}

export const partners: Partner[] = [
  {
    id: '1',
    name: 'Golden Penny',
    logo: '🌾',
    category: 'Rice & Grains',
    description: 'Leading Nigerian flour and pasta manufacturer providing quality staples at bulk pricing.'
  },
  {
    id: '2',
    name: 'Dangote Sugar',
    logo: '🍬',
    category: 'Sugar & Sweeteners',
    description: 'Nigeria\'s largest sugar refinery offering wholesale prices for bulk orders.'
  },
  {
    id: '3',
    name: 'Power Oil',
    logo: '🌻',
    category: 'Cooking Oil',
    description: 'Premium vegetable oil supplier with competitive bulk purchasing rates.'
  },
  {
    id: '4',
    name: 'Indomie',
    logo: '🍜',
    category: 'Instant Noodles',
    description: 'Popular instant noodles brand with special wholesale pricing for large orders.'
  },
  {
    id: '5',
    name: 'Peak Milk',
    logo: '🥛',
    category: 'Dairy Products',
    description: 'Trusted dairy brand providing quality milk products at discounted bulk rates.'
  },
  {
    id: '6',
    name: 'Mama Gold',
    logo: '🍚',
    category: 'Rice',
    description: 'Premium Nigerian rice supplier with exclusive bulk purchasing agreements.'
  }
];
