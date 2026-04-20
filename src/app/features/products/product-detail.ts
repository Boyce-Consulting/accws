import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/auth/auth.service';
import { Product, ProductCategory } from '../../core/models/product.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import {
  APPLICATION_LABELS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  formatProductPrice,
} from './product-catalog.util';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, FormsModule, PageHeaderComponent],
  template: `
    @if (loading()) {
      <p class="text-sm text-gray-500">Loading product…</p>
    } @else if (product(); as p) {
      <app-page-header [title]="p.name" [subtitle]="categoryLabel(p.category)">
        <div class="flex items-center gap-3">
          @if (auth.uiShowsAdmin()) {
            @if (editing()) {
              <button (click)="cancelEdit()" class="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            } @else {
              <button (click)="startEdit(p)" class="text-sm text-accent-600 hover:text-accent-700 font-medium">Edit</button>
            }
          }
          <a routerLink="/products" class="text-sm text-gray-500 hover:text-gray-700">&larr; Back to Products</a>
        </div>
      </app-page-header>

      @if (editing() && auth.uiShowsAdmin()) {
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Edit product</h2>
          <form (ngSubmit)="saveEdit()" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input [(ngModel)]="editForm.name" name="n" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select [(ngModel)]="editForm.category" name="c" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                @for (opt of categoryOptions; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input [(ngModel)]="editForm.unit" name="u" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Price (CAD) &mdash; 0 = Contact for pricing</label>
              <input type="number" step="0.01" min="0" [(ngModel)]="editForm.price" name="p" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Temperature range</label>
              <input [(ngModel)]="editForm.temperature_range" name="tr" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea [(ngModel)]="editForm.description" name="d" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></textarea>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Applications</label>
              <div class="flex flex-wrap gap-3 text-sm">
                @for (opt of applicationOptions; track opt.value) {
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" [(ngModel)]="editForm.applications[opt.value]" [name]="'ea_' + opt.value" class="text-accent-500 focus:ring-accent-500" />
                    <span>{{ opt.label }}</span>
                  </label>
                }
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Active ingredient</label>
              <input [(ngModel)]="editForm.active_ingredient" name="ai" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input [(ngModel)]="editForm.image_url" name="iu" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            @if (editError()) { <div class="sm:col-span-2 text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ editError() }}</div> }
            <div class="sm:col-span-2 flex items-center gap-3">
              <button type="submit" [disabled]="editSaving()" class="bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 text-sm">
                @if (editSaving()) { Saving... } @else { Save changes }
              </button>
              <button type="button" (click)="confirmDelete()" class="text-sm text-danger hover:underline ml-auto">Delete product</button>
            </div>
          </form>
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Hero image -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden aspect-square flex items-center justify-center">
          @if (p.imageUrl) {
            <img [src]="p.imageUrl" [alt]="p.name" loading="lazy" decoding="async"
              class="w-full h-full object-contain" />
          } @else {
            <div class="w-full h-full flex items-center justify-center bg-gray-50">
              <span class="text-sm text-gray-400">No image</span>
            </div>
          }
        </div>

        <!-- Meta -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex flex-wrap gap-1.5">
              <span class="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border" [class]="categoryChipClass(p.category)">
                {{ categoryLabel(p.category) }}
              </span>
              @for (app of p.applications; track app) {
                <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full">{{ appLabel(app) }}</span>
              }
              @if (p.temperatureRange) {
                <span class="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-full border border-blue-200">{{ p.temperatureRange }}</span>
              }
            </div>
          </div>

          <div>
            <h2 class="text-base font-semibold text-gray-900 mb-2">What it does</h2>
            <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{{ p.description }}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p class="text-xs text-gray-500">Unit</p>
              <p class="text-sm font-medium text-gray-900 mt-0.5">{{ p.unit || '—' }}</p>
            </div>
            @if (p.activeIngredient) {
              <div>
                <p class="text-xs text-gray-500">Active ingredient</p>
                <p class="text-sm font-medium text-gray-900 mt-0.5">{{ p.activeIngredient }}</p>
              </div>
            }
            <div>
              <p class="text-xs text-gray-500">Price</p>
              <p class="text-sm font-semibold mt-0.5" [class]="p.price ? 'text-gray-900' : 'text-accent-600'">{{ priceOf(p) }}</p>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-100">
            <button class="px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-lg text-sm">
              @if (p.price) { Request a quote } @else { Contact for pricing }
            </button>
          </div>
        </div>
      </div>

      <!-- Related products -->
      @if (related().length > 0) {
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Related products</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (rp of related(); track rp.id) {
              <a [routerLink]="['/products', rp.id]"
                class="block bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm hover:border-accent-200 transition-all">
                <div class="aspect-square bg-white flex items-center justify-center overflow-hidden">
                  @if (rp.imageUrl) {
                    <img [src]="rp.imageUrl" [alt]="rp.name" loading="lazy" class="w-full h-full object-contain" />
                  } @else {
                    <span class="text-xs text-gray-400">No image</span>
                  }
                </div>
                <div class="p-3">
                  <p class="text-sm font-medium text-gray-900 line-clamp-1">{{ rp.name }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ categoryLabel(rp.category) }}</p>
                </div>
              </a>
            }
          </div>
        </div>
      }
    } @else {
      <div class="text-center py-12">
        <p class="text-gray-500">Product not found</p>
        <a routerLink="/products" class="text-accent-600 text-sm mt-2 inline-block">Back to Products</a>
      </div>
    }
  `,
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  auth = inject(AuthService);

  product = signal<Product | null>(null);
  allProducts = signal<Product[]>([]);
  loading = signal(true);

  editing = signal(false);
  editForm: {
    name: string;
    category: ProductCategory;
    description: string;
    unit: string;
    price: number;
    temperature_range: string;
    active_ingredient: string;
    applications: Record<string, boolean>;
    image_url: string;
  } = {
    name: '',
    category: 'cold-weather',
    description: '',
    unit: '',
    price: 0,
    temperature_range: '',
    active_ingredient: '',
    applications: { lagoon: false, 'lift-station': false, wwtp: false },
    image_url: '',
  };
  editSaving = signal(false);
  editError = signal<string | null>(null);

  categoryOptions = (Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((value) => ({
    value,
    label: CATEGORY_LABELS[value],
  }));
  applicationOptions = Object.entries(APPLICATION_LABELS).map(([value, label]) => ({ value, label }));

  related = computed<Product[]>(() => {
    const p = this.product();
    if (!p) return [];
    return this.allProducts()
      .filter((x) => x.id !== p.id)
      .filter((x) => x.category === p.category || x.applications.some((a) => p.applications.includes(a)))
      .slice(0, 4);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.productService.get(id).subscribe({
      next: (p) => {
        this.product.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    // Fetch the full list for the "Related products" module.
    this.productService.list().subscribe({ next: (list) => this.allProducts.set(list) });
  }

  startEdit(p: Product): void {
    const apps: Record<string, boolean> = { lagoon: false, 'lift-station': false, wwtp: false };
    for (const a of p.applications) apps[a] = true;
    this.editForm = {
      name: p.name,
      category: p.category,
      description: p.description,
      unit: p.unit,
      price: p.price,
      temperature_range: p.temperatureRange ?? '',
      active_ingredient: p.activeIngredient ?? '',
      applications: apps,
      image_url: p.imageUrl ?? '',
    };
    this.editError.set(null);
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  saveEdit(): void {
    const id = this.product()?.id;
    if (!id) return;
    this.editSaving.set(true);
    this.editError.set(null);
    const body: Record<string, unknown> = {
      name: this.editForm.name,
      category: this.editForm.category,
      description: this.editForm.description,
      unit: this.editForm.unit,
      price_cents: Math.round(this.editForm.price * 100),
      applications: Object.entries(this.editForm.applications).filter(([, v]) => v).map(([k]) => k),
    };
    if (this.editForm.temperature_range) body['temperature_range'] = this.editForm.temperature_range;
    if (this.editForm.active_ingredient) body['active_ingredient'] = this.editForm.active_ingredient;
    if (this.editForm.image_url) body['image_url'] = this.editForm.image_url;

    this.productService.update(id, body as Parameters<ProductService['update']>[1]).subscribe({
      next: (updated) => {
        this.product.set(updated);
        this.editing.set(false);
        this.editSaving.set(false);
      },
      error: (err) => {
        this.editError.set(err?.error?.message ?? 'Could not save.');
        this.editSaving.set(false);
      },
    });
  }

  confirmDelete(): void {
    const id = this.product()?.id;
    if (!id) return;
    if (!confirm(`Delete ${this.product()?.name}? This cannot be undone.`)) return;
    this.productService.delete(id).subscribe({
      next: () => this.router.navigate(['/products']),
      error: (err) => this.editError.set(err?.error?.message ?? 'Could not delete.'),
    });
  }

  // Template helpers
  categoryLabel = (c: ProductCategory) => CATEGORY_LABELS[c];
  appLabel = (a: string) => APPLICATION_LABELS[a] ?? a;
  categoryChipClass = (c: ProductCategory) => CATEGORY_COLORS[c];
  priceOf = (p: Product) => formatProductPrice(p.price);
}
