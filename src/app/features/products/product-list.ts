import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  selector: 'app-product-list',
  imports: [RouterLink, FormsModule, PageHeaderComponent],
  template: `
    <app-page-header title="Products" subtitle="Biological and microbial wastewater treatment products">
      @if (auth.uiShowsAdmin()) {
        <button (click)="showCreate.set(!showCreate())" class="inline-flex items-center gap-2 px-3 py-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium rounded-lg">
          @if (showCreate()) { Cancel } @else { + New product }
        </button>
      }
    </app-page-header>

    @if (showCreate() && auth.uiShowsAdmin()) {
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6 max-w-2xl">
        <h2 class="text-base font-semibold text-gray-900 mb-4">New product</h2>
        <form (ngSubmit)="create()" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input [(ngModel)]="newForm.name" name="n" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select [(ngModel)]="newForm.category" name="c" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              @for (c of categoryOptions; track c.value) {
                <option [value]="c.value">{{ c.label }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <input [(ngModel)]="newForm.unit" name="u" placeholder="Bag, Pail, Case, 2.5 gal Jug…" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Price (CAD) &mdash; 0 = Contact for pricing</label>
            <input type="number" step="0.01" min="0" [(ngModel)]="newForm.price" name="p" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Temperature range</label>
            <input [(ngModel)]="newForm.temperature_range" name="tr" placeholder="1°C to 15.5°C" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Applications</label>
            <div class="flex flex-wrap gap-3 text-sm">
              @for (app of applicationOptions; track app.value) {
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="newForm.applications[app.value]" [name]="'na_' + app.value" class="text-accent-500 focus:ring-accent-500" />
                  <span>{{ app.label }}</span>
                </label>
              }
            </div>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea [(ngModel)]="newForm.description" name="d" rows="3" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Active ingredient</label>
            <input [(ngModel)]="newForm.active_ingredient" name="ai" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input [(ngModel)]="newForm.image_url" name="iu" placeholder="https://…" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          @if (createError()) { <div class="sm:col-span-2 text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ createError() }}</div> }
          <div class="sm:col-span-2">
            <button type="submit" [disabled]="creating() || !newForm.name || !newForm.description"
              class="bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 text-sm">
              @if (creating()) { Creating... } @else { Create product }
            </button>
          </div>
        </form>
      </div>
    }

    @if (loading()) {
      <p class="text-sm text-gray-500">Loading products…</p>
    } @else {
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Filters sidebar -->
        <aside class="lg:w-60 shrink-0 space-y-5">
          <div class="bg-white rounded-xl border border-gray-200 p-4">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Search</label>
            <input type="text" [(ngModel)]="search" name="s" placeholder="Name, description…"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-4">
            <p class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</p>
            <div class="space-y-1.5 text-sm">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="cat" [checked]="activeCategory() === 'all'" (change)="activeCategory.set('all')" class="text-accent-500 focus:ring-accent-500" />
                <span>All categories</span>
              </label>
              @for (c of categoryOptions; track c.value) {
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="cat" [checked]="activeCategory() === c.value" (change)="activeCategory.set(c.value)" class="text-accent-500 focus:ring-accent-500" />
                  <span>{{ c.label }}</span>
                </label>
              }
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-4">
            <p class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Applications</p>
            <div class="space-y-1.5 text-sm">
              @for (app of applicationOptions; track app.value) {
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [checked]="activeApps().includes(app.value)" (change)="toggleApp(app.value)" class="text-accent-500 focus:ring-accent-500" />
                  <span>{{ app.label }}</span>
                </label>
              }
            </div>
            @if (activeApps().length > 0 || activeCategory() !== 'all' || search) {
              <button (click)="clearFilters()" class="mt-3 text-xs text-accent-600 hover:underline">Clear filters</button>
            }
          </div>
        </aside>

        <!-- Cards grid -->
        <div class="flex-1">
          <div class="flex items-center justify-between mb-3 text-sm text-gray-500">
            <span>{{ filteredProducts().length }} {{ filteredProducts().length === 1 ? 'product' : 'products' }}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            @for (product of filteredProducts(); track product.id) {
              <a [routerLink]="['/products', product.id]"
                class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-accent-200 transition-all group flex flex-col">
                <div class="aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
                  @if (product.imageUrl) {
                    <img [src]="product.imageUrl" [alt]="product.name" loading="lazy" decoding="async"
                      class="w-full h-full object-contain transition-transform group-hover:scale-105" />
                  } @else {
                    <div class="w-full h-full flex items-center justify-center" [class]="categoryBgSolid(product.category)">
                      <svg class="w-10 h-10 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                      </svg>
                    </div>
                  }
                </div>
                <div class="p-4 flex-1 flex flex-col">
                  <span class="inline-block self-start text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border mb-2"
                    [class]="categoryChipClass(product.category)">
                    {{ categoryLabel(product.category) }}
                  </span>
                  <h3 class="text-sm font-semibold text-gray-900 group-hover:text-accent-600 transition-colors">{{ product.name }}</h3>
                  <p class="text-xs text-gray-600 mt-1 line-clamp-2">{{ firstSentence(product.description) }}</p>
                  @if (product.applications.length) {
                    <div class="flex flex-wrap gap-1 mt-2.5">
                      @for (app of product.applications; track app) {
                        <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full">{{ appLabel(app) }}</span>
                      }
                    </div>
                  }
                  <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span class="text-xs text-gray-500">{{ product.unit }}</span>
                    <span class="text-xs font-semibold" [class]="product.price ? 'text-gray-900' : 'text-accent-600'">{{ priceOf(product) }}</span>
                  </div>
                </div>
              </a>
            } @empty {
              <p class="col-span-full text-sm text-gray-500 text-center py-12">No products match these filters.</p>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  auth = inject(AuthService);

  // Filters
  activeCategory = signal<ProductCategory | 'all'>('all');
  activeApps = signal<string[]>([]);
  search = '';

  products = signal<Product[]>([]);
  loading = signal(true);

  // Create form
  showCreate = signal(false);
  newForm: {
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
  creating = signal(false);
  createError = signal<string | null>(null);

  categoryOptions = (Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((value) => ({
    value,
    label: CATEGORY_LABELS[value],
  }));

  applicationOptions = Object.entries(APPLICATION_LABELS).map(([value, label]) => ({ value, label }));

  filteredProducts = computed(() => {
    const cat = this.activeCategory();
    const apps = this.activeApps();
    const q = this.search.trim().toLowerCase();
    return this.products()
      .filter((p) => cat === 'all' || p.category === cat)
      .filter((p) => apps.length === 0 || apps.every((a) => p.applications.includes(a)))
      .filter((p) => {
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.activeIngredient?.toLowerCase().includes(q) ?? false)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.productService.list().subscribe({
      next: (list) => {
        this.products.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleApp(value: string): void {
    const cur = this.activeApps();
    this.activeApps.set(cur.includes(value) ? cur.filter((a) => a !== value) : [...cur, value]);
  }

  clearFilters(): void {
    this.activeCategory.set('all');
    this.activeApps.set([]);
    this.search = '';
  }

  create(): void {
    if (!this.newForm.name || !this.newForm.description) return;
    this.creating.set(true);
    this.createError.set(null);
    const body = {
      name: this.newForm.name,
      category: this.newForm.category,
      description: this.newForm.description,
      unit: this.newForm.unit,
      price_cents: Math.round(this.newForm.price * 100),
      applications: Object.entries(this.newForm.applications)
        .filter(([, v]) => v)
        .map(([k]) => k),
      ...(this.newForm.temperature_range && { temperature_range: this.newForm.temperature_range }),
      ...(this.newForm.active_ingredient && { active_ingredient: this.newForm.active_ingredient }),
      ...(this.newForm.image_url && { image_url: this.newForm.image_url }),
    };
    this.productService.create(body).subscribe({
      next: () => {
        this.creating.set(false);
        this.showCreate.set(false);
        this.newForm = {
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
        this.load();
      },
      error: (err) => {
        this.createError.set(err?.error?.message ?? 'Could not create product.');
        this.creating.set(false);
      },
    });
  }

  // Template helpers
  categoryLabel = (c: ProductCategory) => CATEGORY_LABELS[c];
  appLabel = (a: string) => APPLICATION_LABELS[a] ?? a;
  categoryChipClass = (c: ProductCategory) => CATEGORY_COLORS[c];
  priceOf = (p: Product) => formatProductPrice(p.price);
  firstSentence = (s: string) => {
    const m = s.match(/^[^.!?]*[.!?]/);
    return m ? m[0] : s.length > 140 ? s.slice(0, 140) + '…' : s;
  };
  categoryBgSolid(c: ProductCategory): string {
    const m: Record<ProductCategory, string> = {
      'cold-weather': 'bg-blue-400',
      'carbon-oxygen': 'bg-green-400',
      'collection-odor': 'bg-amber-400',
      specialty: 'bg-purple-400',
    };
    return m[c] ?? 'bg-gray-400';
  }
}
