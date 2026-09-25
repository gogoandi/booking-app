import { Component, computed, inject, type Signal } from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';

import { UserModel } from '../../auth/user.model';

interface DashboardOutletData {
  user: UserModel | null;
}

@Component({
  selector: 'app-dashboard-notifications',
  standalone: true,
  templateUrl: './dashboard-notifications.component.html',
  styleUrl: './dashboard-notifications.component.css',
})
export class DashboardNotificationsComponent {
  private dashboardData = inject(ROUTER_OUTLET_DATA) as Signal<DashboardOutletData | null>;

  user = computed(() => this.dashboardData()?.user ?? null);
}
