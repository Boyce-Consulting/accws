import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { ProposalService } from '../../core/services/proposal.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-proposal-detail',
  imports: [RouterLink, TitleCasePipe, PageHeaderComponent, StatusBadgeComponent],
  template: `
    @if (proposal(); as p) {
      <app-page-header [title]="p.title" [subtitle]="p.clientName">
        <a routerLink="/proposals" class="text-sm text-gray-500 hover:text-gray-700">&larr; Back</a>
      </app-page-header>

      <div class="flex items-center gap-4 mb-6">
        <app-status-badge
          [label]="p.status | titlecase"
          [color]="p.status === 'accepted' ? 'green' : p.status === 'sent' ? 'blue' : p.status === 'declined' ? 'red' : 'gray'" />
        <span class="text-sm text-gray-500">{{ p.date }}</span>
        @if (p.validUntil) {
          <span class="text-sm text-gray-500">Valid until {{ p.validUntil }}</span>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Line Items -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-200">
            <h2 class="text-base font-semibold text-gray-900">Line Items</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Unit</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Qty</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (item of p.lineItems; track item.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ item.productName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ item.unit }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 text-right">\${{ item.price.toLocaleString() }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 text-right">{{ item.quantity }}</td>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900 text-right">\${{ item.subtotal.toLocaleString() }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Financial Summary -->
        <div class="space-y-4">
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-4">Summary</h2>
            <dl class="space-y-3">
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500">Subtotal</dt>
                <dd class="text-sm font-medium text-gray-900">\${{ p.subtotal.toLocaleString() }}</dd>
              </div>
              @if (p.discount) {
                <div class="flex justify-between text-green-600">
                  <dt class="text-sm">{{ p.discountLabel ?? 'Discount' }}</dt>
                  <dd class="text-sm font-medium">-\${{ p.discount.toLocaleString() }}</dd>
                </div>
              }
              @if (p.shipping) {
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-500">Shipping</dt>
                  <dd class="text-sm font-medium text-gray-900">\${{ p.shipping.toLocaleString() }}</dd>
                </div>
              }
              @if (p.gst) {
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-500">GST (5%)</dt>
                  <dd class="text-sm font-medium text-gray-900">\${{ p.gst.toLocaleString() }}</dd>
                </div>
              }
              <div class="flex justify-between pt-3 border-t border-gray-200">
                <dt class="text-base font-semibold text-gray-900">Total</dt>
                <dd class="text-base font-bold text-accent-600">\${{ p.total.toLocaleString() }}</dd>
              </div>
            </dl>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-4">Details</h2>
            <dl class="space-y-3">
              <div>
                <dt class="text-xs font-medium text-gray-500">Prepared By</dt>
                <dd class="text-sm text-gray-900">{{ p.preparedBy }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Prepared For</dt>
                <dd class="text-sm text-gray-900">{{ p.preparedFor }}</dd>
              </div>
              @if (p.notes) {
                <div>
                  <dt class="text-xs font-medium text-gray-500">Notes</dt>
                  <dd class="text-sm text-gray-700">{{ p.notes }}</dd>
                </div>
              }
            </dl>
          </div>
        </div>
      </div>
    } @else {
      <div class="text-center py-12">
        <p class="text-gray-500">Proposal not found</p>
        <a routerLink="/proposals" class="text-accent-600 text-sm mt-2 inline-block">Back to Proposals</a>
      </div>
    }
  `,
})
export class ProposalDetailComponent {
  private route = inject(ActivatedRoute);
  private proposalService = inject(ProposalService);

  proposal = computed(() => {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    return this.proposalService.getById(id);
  });
}
