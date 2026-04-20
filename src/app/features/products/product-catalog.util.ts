import { ProductCategory } from '../../core/models/product.model';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  'cold-weather': 'Cold-Weather Products',
  'carbon-oxygen': 'Carbon & Oxygen / Nitrification',
  'collection-odor': 'Collection System & Odor Control',
  specialty: 'Specialty Products',
};

export const CATEGORY_COLORS: Record<ProductCategory, string> = {
  'cold-weather': 'bg-blue-100 text-blue-700 border-blue-200',
  'carbon-oxygen': 'bg-green-100 text-green-700 border-green-200',
  'collection-odor': 'bg-amber-100 text-amber-700 border-amber-200',
  specialty: 'bg-purple-100 text-purple-700 border-purple-200',
};

export type ApplicationValue = 'lagoon' | 'lift-station' | 'wwtp';

export const APPLICATION_LABELS: Record<string, string> = {
  lagoon: 'Lagoons',
  'lift-station': 'Lift Stations',
  wwtp: 'WWTP',
};

/** Format CAD cents (frontend stores as dollars already). 0 means unpublished. */
export function formatProductPrice(priceInDollars: number | undefined): string {
  if (!priceInDollars) return 'Contact for pricing';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(priceInDollars);
}
