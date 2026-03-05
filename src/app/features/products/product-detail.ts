import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, TitleCasePipe, PageHeaderComponent],
  template: `
    @if (product(); as p) {
      <app-page-header [title]="p.name" [subtitle]="p.category | titlecase">
        <a routerLink="/products" class="text-sm text-gray-500 hover:text-gray-700">&larr; Back to Products</a>
      </app-page-header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-base font-semibold text-gray-900 mb-3">Description</h2>
          <p class="text-sm text-gray-700 leading-relaxed">{{ p.description }}</p>

          @if (p.applications.length) {
            <h3 class="text-sm font-semibold text-gray-900 mt-6 mb-2">Applications</h3>
            <ul class="space-y-1">
              @for (app of p.applications; track app) {
                <li class="flex items-center gap-2 text-sm text-gray-600">
                  <svg class="w-4 h-4 text-accent-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {{ app }}
                </li>
              }
            </ul>
          }
        </div>

        <div class="space-y-4">
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <p class="text-sm text-gray-500 mb-1">Price</p>
            <p class="text-3xl font-bold text-accent-600">\${{ p.price.toLocaleString() }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ p.unit }}</p>
          </div>
          @if (p.temperatureRange) {
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <p class="text-sm text-gray-500 mb-1">Temperature Range</p>
              <p class="text-sm font-medium text-gray-900">{{ p.temperatureRange }}</p>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="text-center py-12">
        <p class="text-gray-500">Product not found</p>
        <a routerLink="/products" class="text-accent-600 text-sm mt-2 inline-block">Back to Products</a>
      </div>
    }
  `,
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  product = computed(() => {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    return this.productService.getById(id);
  });
}
