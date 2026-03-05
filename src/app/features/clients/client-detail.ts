import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { ClientService } from '../../core/services/client.service';
import { SystemService } from '../../core/services/system.service';
import { ProposalService } from '../../core/services/proposal.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-client-detail',
  imports: [RouterLink, TitleCasePipe, PageHeaderComponent, StatusBadgeComponent],
  template: `
    @if (client(); as c) {
      <app-page-header [title]="c.name" [subtitle]="c.type | titlecase">
        <a routerLink="/clients" class="text-sm text-gray-500 hover:text-gray-700">&larr; Back</a>
      </app-page-header>

      <!-- Tabs -->
      <div class="flex gap-1 mb-6 border-b border-gray-200">
        @for (tab of tabs; track tab) {
          <button
            (click)="activeTab.set(tab)"
            class="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px"
            [class]="activeTab() === tab ? 'text-accent-600 border-accent-500' : 'text-gray-500 border-transparent hover:text-gray-700'">
            {{ tab }}
          </button>
        }
      </div>

      @switch (activeTab()) {
        @case ('Overview') {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <h2 class="text-base font-semibold text-gray-900 mb-4">Contact Information</h2>
              <dl class="space-y-3">
                <div>
                  <dt class="text-xs font-medium text-gray-500">Contact</dt>
                  <dd class="text-sm text-gray-900">{{ c.contactName }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">Email</dt>
                  <dd class="text-sm text-accent-600">{{ c.contactEmail }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">Phone</dt>
                  <dd class="text-sm text-gray-900">{{ c.contactPhone }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">Address</dt>
                  <dd class="text-sm text-gray-900">{{ c.address }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">Province</dt>
                  <dd class="text-sm text-gray-900">{{ c.province }}</dd>
                </div>
              </dl>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <h2 class="text-base font-semibold text-gray-900 mb-4">Summary</h2>
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-4 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold text-gray-900">{{ systems().length }}</p>
                  <p class="text-xs text-gray-500 mt-1">Systems</p>
                </div>
                <div class="text-center p-4 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold text-gray-900">{{ proposals().length }}</p>
                  <p class="text-xs text-gray-500 mt-1">Proposals</p>
                </div>
              </div>
              @if (c.notes) {
                <div class="mt-4 p-3 bg-amber-50 rounded-lg">
                  <p class="text-xs font-medium text-amber-700 mb-1">Notes</p>
                  <p class="text-sm text-gray-700">{{ c.notes }}</p>
                </div>
              }
            </div>
          </div>
        }
        @case ('Systems') {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (sys of systems(); track sys.id) {
              <a [routerLink]="['/systems', sys.id]" class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-sm font-semibold text-gray-900">{{ sys.name }}</h3>
                  <app-status-badge [label]="sys.status | titlecase" [color]="sys.status === 'healthy' ? 'green' : sys.status === 'attention' ? 'yellow' : sys.status === 'critical' ? 'red' : 'gray'" />
                </div>
                <p class="text-xs text-gray-500 mb-3">{{ sys.type | titlecase }} &bull; {{ sys.cells.length }} cell{{ sys.cells.length !== 1 ? 's' : '' }}</p>
                @if (sys.population) {
                  <p class="text-xs text-gray-500">Population: ~{{ sys.population.toLocaleString() }}</p>
                }
              </a>
            } @empty {
              <div class="col-span-2 text-center py-8 text-gray-400 text-sm">No systems found</div>
            }
          </div>
        }
        @case ('Proposals') {
          <div class="space-y-3">
            @for (prop of proposals(); track prop.id) {
              <a [routerLink]="['/proposals', prop.id]" class="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-semibold text-gray-900">{{ prop.title }}</h3>
                    <p class="text-xs text-gray-500 mt-1">{{ prop.date }} &bull; Prepared by {{ prop.preparedBy }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-bold text-gray-900">\${{ prop.total.toLocaleString() }}</p>
                    <app-status-badge
                      [label]="prop.status | titlecase"
                      [color]="prop.status === 'accepted' ? 'green' : prop.status === 'sent' ? 'blue' : prop.status === 'declined' ? 'red' : 'gray'" />
                  </div>
                </div>
              </a>
            } @empty {
              <div class="text-center py-8 text-gray-400 text-sm">No proposals found</div>
            }
          </div>
        }
      }
    } @else {
      <div class="text-center py-12">
        <p class="text-gray-500">Client not found</p>
        <a routerLink="/clients" class="text-accent-600 text-sm mt-2 inline-block">Back to Clients</a>
      </div>
    }
  `,
})
export class ClientDetailComponent {
  private route = inject(ActivatedRoute);
  private clientService = inject(ClientService);
  private systemService = inject(SystemService);
  private proposalService = inject(ProposalService);

  tabs = ['Overview', 'Systems', 'Proposals'];
  activeTab = signal('Overview');

  client = computed(() => {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    return this.clientService.getById(id);
  });

  systems = computed(() => {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    return this.systemService.getByClientId(id);
  });

  proposals = computed(() => {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    return this.proposalService.getByClientId(id);
  });
}
