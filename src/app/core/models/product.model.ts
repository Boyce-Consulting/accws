export type ProductCategory = 'cold-weather' | 'carbon-oxygen' | 'collection-odor' | 'specialty';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  unit: string;       // e.g., '30lb Pail', '50lb Bag', '55gal Drum'
  price: number;      // CAD
  activeIngredient?: string;
  applications: string[];
  temperatureRange?: string;
  imageUrl?: string;
}
