import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { ProposalService } from '../../core/services/proposal.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-proposal-list',
  imports: [RouterLink, TitleCasePipe, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Proposals" subtitle="Track and manage client proposals" />

    <!-- Pipeline summary -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p class="text-2xl font-bold text-gray-900">{{ totalCount() }}</p>
        <p class="text-xs text-gray-500 mt-1">Total</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">{{ sentCount() }}</p>
        <p class="text-xs text-gray-500 mt-1">Sent</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ acceptedCount() }}</p>
        <p class="text-xs text-gray-500 mt-1">Accepted</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p class="text-2xl font-bold text-accent-600">\${{ pipelineValue().toLocaleString() }}</p>
        <p class="text-xs text-gray-500 mt-1">Pipeline Value</p>
      </div>
    </div>

    <!-- Status Filter -->
    <div class="flex gap-2 mb-6">
      @for (f of filters; track f.value) {
        <button
          (click)="activeFilter.set(f.value)"
          class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
          [class]="activeFilter() === f.value ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'">
          {{ f.label }}
        </button>
      }
    </div>

    <!-- Proposal Cards -->
    <div class="space-y-3">
      @for (prop of filteredProposals(); track prop.id) {
        <a [routerLink]="['/proposals', prop.id]" class="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-2">
            <div>
              <h3 class="text-sm font-semibold text-gray-900">{{ prop.title }}</h3>
              <p class="text-xs text-gray-500 mt-0.5">{{ prop.clientName }} &bull; {{ prop.date }}</p>
            </div>
            <app-status-badge
              [label]="prop.status | titlecase"
              [color]="statusColor(prop.status)" />
          </div>
          <div class="flex items-center justify-between">
            <p class="text-xs text-gray-500">{{ prop.lineItems.length }} item{{ prop.lineItems.length !== 1 ? 's' : '' }} &bull; Prepared by {{ prop.preparedBy }}</p>
            <p class="text-sm font-bold text-gray-900">\${{ prop.total.toLocaleString() }}</p>
          </div>
        </a>
      } @empty {
        <div class="text-center py-12 text-gray-400 text-sm">No proposals found</div>
      }
    </div>
  `,
})
export class ProposalListComponent {
  private proposalService = inject(ProposalService);

  activeFilter = signal('all');

  filters = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'declined', label: 'Declined' },
  ];

  filteredProposals = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'all') return this.proposalService.proposals();
    return this.proposalService.getByStatus(filter as any);
  });

  totalCount = computed(() => this.proposalService.proposals().length);
  sentCount = computed(() => this.proposalService.getByStatus('sent').length);
  acceptedCount = computed(() => this.proposalService.getByStatus('accepted').length);
  pipelineValue = computed(() =>
    this.proposalService.proposals()
      .filter(p => p.status === 'sent' || p.status === 'draft')
      .reduce((sum, p) => sum + p.total, 0)
  );

  statusColor(status: string): 'green' | 'yellow' | 'red' | 'blue' | 'gray' {
    const map: Record<string, 'green' | 'yellow' | 'red' | 'blue' | 'gray'> = {
      draft: 'gray', sent: 'blue', accepted: 'green', declined: 'red',
    };
    return map[status] ?? 'gray';
  }
}
