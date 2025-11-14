import type { Seller, Product, Review } from './types';

export const sellers: Seller[] = [
  {
    id: 'seller-1',
    name: 'Alice',
    avatar: 'https://picsum.photos/seed/101/100/100',
    bio: 'Tech enthusiast selling premium gadgets. All items are in mint condition. Fast shipping guaranteed.',
    rating: 4.9,
    successRate: 98,
  },
  {
    id: 'seller-2',
    name: 'Bob',
    avatar: 'https://picsum.photos/seed/102/100/100',
    bio: 'Your friendly neighborhood drone pilot and photographer. Selling my collection of high-quality gear.',
    rating: 4.7,
    successRate: 95,
  },
  {
    id: 'seller-3',
    name: 'Charlie',
    avatar: 'https://picsum.photos/seed/103/100/100',
    bio: 'Retro tech collector. Find rare and vintage cameras and accessories here.',
    rating: 5.0,
    successRate: 100,
  },
];

const reviews: Review[] = [
    {
        id: 'review-1',
        productId: 'product-1',
        author: 'David',
        rating: 5,
        comment: 'Fantastic watch! Looks even better in person. The seller was very communicative and shipped it quickly. Highly recommended!',
        createdAt: '2024-05-20T14:30:00Z',
    },
    {
        id: 'review-2',
        productId: 'product-1',
        author: 'Eve',
        rating: 4,
        comment: 'Good product, fair price. There was a slight delay in shipping, but the seller kept me updated. Overall a positive experience.',
        createdAt: '2024-05-18T10:00:00Z',
    },
    {
        id: 'review-3',
        productId: 'product-2',
        author: 'Frank',
        rating: 5,
        comment: 'Amazing headphones, the sound quality is crisp and clear. The bargain feature was great, got it for a price I was happy with.',
        createdAt: '2024-05-22T09:00:00Z',
    },
    {
        id: 'review-4',
        productId: 'product-3',
        author: 'Grace',
        rating: 5,
        comment: "This drone is a beast! Captured some incredible footage. The seller, Bob, was super helpful with my questions before purchase.",
        createdAt: '2024-05-21T18:45:00Z',
    },
    {
        id: 'review-5',
        productId: 'product-4',
        author: 'Heidi',
        rating: 5,
        comment: "A beautiful piece of history. The camera works perfectly. Charlie is a wonderful seller, very knowledgeable and passionate.",
        createdAt: '2024-05-19T12:15:00Z',
    },
    {
        id: 'review-6',
        productId: 'product-1',
        author: 'Ivan',
        rating: 2,
        comment: 'The watch is okay but the battery life is terrible. Not what I expected at all.',
        createdAt: '2024-05-17T11:00:00Z'
    }
];

export const products: (Product & { reviews: Review[] })[] = [
  {
    id: 'product-1',
    name: 'ChronoSphere X1',
    description: 'A futuristic smartwatch with a holographic display, quantum-entangled timekeeping, and a sleek, minimalist design. Perfect for the modern time-traveler.',
    images: ['https://picsum.photos/seed/1/600/400', 'https://picsum.photos/seed/2/600/400'],
    sellerId: 'seller-1',
    priceOptions: [350, 325, 300],
    reviews: reviews.filter(r => r.productId === 'product-1'),
  },
  {
    id: 'product-2',
    name: 'SonicWeave Pro',
    description: 'Experience audio like never before with these noise-cancelling headphones. Featuring adaptive EQ, spatial audio, and a 40-hour battery life.',
    images: ['https://picsum.photos/seed/3/600/400'],
    sellerId: 'seller-1',
    priceOptions: [250, 220],
    reviews: reviews.filter(r => r.productId === 'product-2'),
  },
  {
    id: 'product-3',
    name: 'AeroGlide 4K Drone',
    description: 'Capture stunning aerial footage with this professional-grade drone. Equipped with a 4K camera, 3-axis gimbal, and 30 minutes of flight time.',
    images: ['https://picsum.photos/seed/4/600/400'],
    sellerId: 'seller-2',
    priceOptions: [800, 750, 700],
    reviews: reviews.filter(r => r.productId === 'product-3'),
  },
  {
    id: 'product-4',
    name: 'RetroFlex 35mm Camera',
    description: 'A fully refurbished vintage 35mm film camera. A classic model known for its sharp lens and robust mechanical build. Includes a leather case.',
    images: ['https://picsum.photos/seed/5/600/400'],
    sellerId: 'seller-3',
    priceOptions: [450, 420],
    reviews: reviews.filter(r => r.productId === 'product-4'),
  },
];

export const getProductById = (id: string) => products.find(p => p.id === id);
export const getSellerById = (id: string) => sellers.find(s => s.id === id);
