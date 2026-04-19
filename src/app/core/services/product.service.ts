import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, ProductCategory } from '../models/product.model';
import { API_BASE_URL } from './api.config';
import { Envelope, ProductDto, mapProductFromDto, unwrapItem, unwrapList } from './adapters';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private base = inject(API_BASE_URL);

  list(category?: ProductCategory): Observable<Product[]> {
    const params = category ? new HttpParams().set('category', category) : undefined;
    return this.http
      .get<Envelope<ProductDto[]>>(`${this.base}/products`, { params })
      .pipe(unwrapList(mapProductFromDto));
  }

  get(id: string): Observable<Product> {
    return this.http
      .get<Envelope<ProductDto>>(`${this.base}/products/${id}`)
      .pipe(unwrapItem(mapProductFromDto));
  }
}
