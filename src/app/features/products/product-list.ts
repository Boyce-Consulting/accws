import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { ProductCategory } from '../../core/models';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink, PageHeaderComponent],
  template: `
    <app-page-header title="Products" subtitle="Biological and microbial wastewater treatment products" />

    <!-- Category Tabs -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        (click)="activeCategory.set('all')"
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        [class]="activeCategory() === 'all' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'">
        All Products
      </button>
      @for (cat of categories; track cat.value) {
        <button
          (click)="activeCategory.set(cat.value)"
          class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
          [class]="activeCategory() === cat.value ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'">
          {{ cat.label }}
        </button>
      }
    </div>

    <!-- Product Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      @for (product of filteredProducts(); track product.id) {
        <a [routerLink]="['/products', product.id]" class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-accent-200 transition-all group">
          <div class="flex items-start justify-between mb-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center" [class]="categoryBg(product.category)">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </div>
          </div>
          <h3 class="text-sm font-semibold text-gray-900 group-hover:text-accent-600 transition-colors">{{ product.name }}</h3>
          <p class="text-xs text-gray-500 mt-1">{{ product.unit }}</p>
          <p class="text-xs text-gray-600 mt-2 line-clamp-2">{{ product.description }}</p>
          <div class="mt-3 flex flex-wrap gap-1">
            @for (app of product.applications.slice(0, 2); track app) {
              <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full">{{ app }}</span>
            }
          </div>
        </a>
      }
    </div>
  `,
})
export class ProductListComponent {
  private productService = inject(ProductService);

  activeCategory = signal<string>('all');

  categories = [
    { value: 'cold-weather', label: 'Cold Weather' },
    { value: 'carbon-oxygen', label: 'Carbon & Oxygen' },
    { value: 'collection-odor', label: 'Collection & Odor' },
    { value: 'specialty', label: 'Specialty' },
  ];

  filteredProducts = computed(() => {
    const cat = this.activeCategory();
    if (cat === 'all') return this.productService.products();
    return this.productService.getByCategory(cat as ProductCategory);
  });

  categoryBg(category: string): string {
    const map: Record<string, string> = {
      'cold-weather': 'bg-blue-100 text-blue-600',
      'carbon-oxygen': 'bg-green-100 text-green-600',
      'collection-odor': 'bg-amber-100 text-amber-600',
      'specialty': 'bg-purple-100 text-purple-600',
    };
    return map[category] ?? 'bg-gray-100 text-gray-600';
  }
}
