import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { Product, CreateProductDto, ProductFilter, UpdateProductDto, PagedResult } from '../models/product.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = `${environment.apiUrl}/products`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl).pipe(
            map((products: Product[]) => products.map(p => this.assignImageUrl(p))),
            tap(data => console.log('ProductService: Liste des produits reçue avec images:', data))
        );
    }

    getById(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
            map((product: Product) => this.assignImageUrl(product))
        );
    }

    private assignImageUrl(product: Product): Product {
        // 1. Check if there's a custom URL in localStorage
        const customUrl = this.getCustomImageUrl(product.id);
        if (customUrl) {
            return { ...product, imageUrl: customUrl };
        }

        const name = (product.name || '').toLowerCase();
        const category = (product.categoryName || '').toLowerCase();
        const sub = (product.subCategoryName || '').toLowerCase();
        const combined = `${name} ${category} ${sub}`;

        // Use Picsum photos with category seeds - always work, no CORS/referrer issues
        const imageMapping: { keywords: string[], url: string }[] = [
            { keywords: ['bike', 'bicycle', 'road', 'mountain', 'vélo', 'velo'], url: 'https://picsum.photos/seed/bicycle/800/600' },
            { keywords: ['helmet', 'casque'], url: 'https://picsum.photos/seed/helmet/800/600' },
            { keywords: ['glove', 'gant'], url: 'https://picsum.photos/seed/gloves/800/600' },
            { keywords: ['jersey', 'maillot', 'shirt', 'chemise'], url: 'https://picsum.photos/seed/jersey/800/600' },
            { keywords: ['bottle', 'bouteille', 'water'], url: 'https://picsum.photos/seed/water/800/600' },
            { keywords: ['shorts', 'short', 'pants', 'pantalon'], url: 'https://picsum.photos/seed/shorts/800/600' },
            { keywords: ['socks', 'chaussette', 'sock'], url: 'https://picsum.photos/seed/socks/800/600' },
            { keywords: ['shoe', 'shoes', 'chaussure', 'boot', 'botte'], url: 'https://picsum.photos/seed/shoes/800/600' },
            { keywords: ['tire', 'tyre', 'pneu'], url: 'https://picsum.photos/seed/tire/800/600' },
            { keywords: ['frame', 'cadre', 'fork'], url: 'https://picsum.photos/seed/frame/800/600' },
            { keywords: ['saddle', 'selle', 'seat'], url: 'https://picsum.photos/seed/saddle/800/600' },
            { keywords: ['components', 'composant', 'part', 'piece'], url: 'https://picsum.photos/seed/components/800/600' },
        ];

        for (const mapping of imageMapping) {
            if (mapping.keywords.some(k => combined.includes(k))) {
                return { ...product, imageUrl: mapping.url };
            }
        }

        // Use product.id as seed so each product always gets the same default image
        return { ...product, imageUrl: `https://picsum.photos/seed/${product.id ?? 'sport'}/800/600` };
    }

    saveCustomImageUrl(id: number, url: string): void {
        const customImages = this.getAllCustomImages();
        customImages[id] = url;
        localStorage.setItem('sportstore_custom_product_images', JSON.stringify(customImages));
    }

    getCustomImageUrl(id: number): string | null {
        return this.getAllCustomImages()[id] || null;
    }

    private getAllCustomImages(): { [key: number]: string } {
        try {
            const stored = localStorage.getItem('sportstore_custom_product_images');
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    }

    getByFilter(filter: ProductFilter): Observable<Product[]> {
        let params = new HttpParams()
            .set('page', filter.page.toString())
            .set('pageSize', filter.pageSize.toString());

        if (filter.categoryId) params = params.set('categoryId', filter.categoryId.toString());
        if (filter.subCategoryId) params = params.set('subCategoryId', filter.subCategoryId.toString());
        if (filter.minPrice) params = params.set('minPrice', filter.minPrice.toString());
        if (filter.maxPrice) params = params.set('maxPrice', filter.maxPrice.toString());
        if (filter.sortBy) params = params.set('sortBy', filter.sortBy);

        return this.http.get<Product[]>(this.apiUrl, { params });
    }

    getFeatured(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/featured`);
    }

    create(product: CreateProductDto): Observable<Product> {
        return this.http.post<Product>(this.apiUrl, product);
    }

    update(id: number, product: UpdateProductDto): Observable<Product> {
        return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
