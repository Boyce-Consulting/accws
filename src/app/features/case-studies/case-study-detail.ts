import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CaseStudyService } from '../../core/services/case-study.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-case-study-detail',
  imports: [RouterLink, PageHeaderComponent],
  template: `
    @if (caseStudy(); as cs) {
      <app-page-header [title]="cs.title" [subtitle]="cs.clientName + ' - ' + cs.location + ', ' + cs.province">
        <a routerLink="/case-studies" class="text-sm text-gray-500 hover:text-gray-700">&larr; Back</a>
      </app-page-header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Problem -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              Challenge
            </h2>
            <p class="text-sm text-gray-700 leading-relaxed">{{ cs.problem }}</p>
          </div>

          <!-- Solution -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              Solution
            </h2>
            <p class="text-sm text-gray-700 leading-relaxed">{{ cs.solution }}</p>
          </div>

          <!-- Results Table -->
          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <svg class="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75Z" />
              </svg>
              <h2 class="text-base font-semibold text-gray-900">Results</h2>
            </div>
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Metric</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Before</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">After</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Change</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (r of cs.results; track r.metric) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ r.metric }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 text-right">{{ r.before }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 text-right">{{ r.after }}</td>
                    <td class="px-4 py-3 text-sm font-semibold text-right" [class]="r.changePercent < 0 ? 'text-green-600' : 'text-red-600'">
                      {{ r.changePercent > 0 ? '+' : '' }}{{ r.changePercent }}%
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Details</h3>
            <dl class="space-y-3">
              <div>
                <dt class="text-xs font-medium text-gray-500">System Type</dt>
                <dd class="text-sm text-gray-900 capitalize">{{ cs.systemType }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Duration</dt>
                <dd class="text-sm text-gray-900">{{ cs.duration }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Location</dt>
                <dd class="text-sm text-gray-900">{{ cs.location }}, {{ cs.province }}</dd>
              </div>
            </dl>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Products Used</h3>
            <div class="space-y-1.5">
              @for (prod of cs.productsUsed; track prod) {
                <div class="flex items-center gap-2 text-sm text-gray-700">
                  <svg class="w-4 h-4 text-accent-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {{ prod }}
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="text-center py-12">
        <p class="text-gray-500">Case study not found</p>
        <a routerLink="/case-studies" class="text-accent-600 text-sm mt-2 inline-block">Back to Case Studies</a>
      </div>
    }
  `,
})
export class CaseStudyDetailComponent {
  private route = inject(ActivatedRoute);
  private caseStudyService = inject(CaseStudyService);

  caseStudy = computed(() => {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    return this.caseStudyService.getById(id);
  });
}
