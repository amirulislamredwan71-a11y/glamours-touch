export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  image: string;
  category: 'Skincare' | 'Makeup' | 'Haircare' | 'Fragrance' | 'Accessories';
  origin: 'Bangladesh' | 'India' | 'International';
  rating: number;
  reviews: number;
  isFeatured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  address?: string;
  phone?: string;
}
