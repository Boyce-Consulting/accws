import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CaseStudyService } from '../../core/services/case-study.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-case-study-list',
  imports: [RouterLink, PageHeaderComponent],
  template: `
    <app-page-header title="Case Studies" subtitle="Real-world bioaugmentation success stories" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      @for (cs of caseStudyService.caseStudies(); track cs.id) {
        <a [routerLink]="['/case-studies', cs.id]" class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
          <div class="h-2 bg-gradient-to-r from-accent-500 to-primary-500"></div>
          <div class="p-6">
            <h3 class="text-base font-semibold text-gray-900 group-hover:text-accent-600 transition-colors mb-2">{{ cs.title }}</h3>
            <p class="text-sm text-gray-500 mb-3">{{ cs.clientName }} &bull; {{ cs.location }}, {{ cs.province }}</p>
            <p class="text-sm text-gray-600 line-clamp-3 mb-4">{{ cs.problem }}</p>

            <!-- Key Results -->
            <div class="space-y-2 mb-4">
              @for (result of cs.results.slice(0, 2); track result.metric) {
                <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span class="text-xs font-medium text-gray-700">{{ result.metric }}</span>
                  <span class="text-xs font-bold" [class]="result.changePercent < 0 ? 'text-green-600' : 'text-red-600'">
                    {{ result.changePercent > 0 ? '+' : '' }}{{ result.changePercent }}%
                  </span>
                </div>
              }
            </div>

            <div class="flex flex-wrap gap-1">
              @for (prod of cs.productsUsed.slice(0, 3); track prod) {
                <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full">{{ prod }}</span>
              }
              @if (cs.productsUsed.length > 3) {
                <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full">+{{ cs.productsUsed.length - 3 }} more</span>
              }
            </div>
          </div>
        </a>
      } @empty {
        <div class="col-span-2 text-center py-12 text-gray-400 text-sm">No case studies available</div>
      }
    </div>
  `,
})
export class CaseStudyListComponent {
  caseStudyService = inject(CaseStudyService);
}
