import { Injectable, inject, computed } from '@angular/core';
import { Product, ProductCategory } from '../models';
import { MockDataService } from './mock-data.service';

// TODO: Import HttpClient when backend is ready
// import { HttpClient } from '@angular/common/http';
// import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private mock = inject(MockDataService);
  // TODO: private http = inject(HttpClient);
  // TODO: private apiUrl = `${inject(API_BASE_URL)}/products`;

  /** All products as a readonly computed signal */
  readonly products = computed(() => this.mock.products());

  /** Look up a single product by ID */
  getById(id: string): Product | undefined {
    return this.products().find(p => p.id === id);
  }

  /** Look up a single product by exact name */
  getByName(name: string): Product | undefined {
    return this.products().find(p => p.name === name);
  }

  /** Filter products by category */
  getByCategory(category: ProductCategory): Product[] {
    return this.products().filter(p => p.category === category);
  }

  /** Get products sorted by price ascending */
  getSortedByPrice(): Product[] {
    return [...this.products()].sort((a, b) => a.price - b.price);
  }

  // -------------------------------------------------------------------------
  // Products are read-only in the current version of the app.
  // CUD operations will be added when admin product management is built.
  // -------------------------------------------------------------------------
}
