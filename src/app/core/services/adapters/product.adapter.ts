import { Product } from '../../models/product.model';
import { fromCents, toStringId } from './envelope';

export interface ProductDto {
  id: number | string;
  name: string;
  category: Product['category'];
  description: string;
  unit: string;
  price_cents: number;
  active_ingredient?: string;
  applications: string[];
  temperature_range?: string;
  image_url?: string;
}

export function mapProductFromDto(dto: ProductDto): Product {
  return {
    id: toStringId(dto.id),
    name: dto.name,
    category: dto.category,
    description: dto.description,
    unit: dto.unit,
    price: fromCents(dto.price_cents) ?? 0,
    activeIngredient: dto.active_ingredient,
    applications: dto.applications ?? [],
    temperatureRange: dto.temperature_range,
    imageUrl: dto.image_url,
  };
}
