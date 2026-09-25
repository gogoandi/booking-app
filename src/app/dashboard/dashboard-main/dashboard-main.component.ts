import { Component, computed, inject, type Signal } from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';

import { UserModel } from '../../auth/user.model';

interface DashboardOutletData {
  user: UserModel | null;
}

@Component({
  selector: 'app-dashboard-main',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-main.component.html',
  styleUrl: './dashboard-main.component.css',
})
export class DashboardMainComponent {
  private dashboardData = inject(ROUTER_OUTLET_DATA) as Signal<DashboardOutletData | null>;

  user = computed(() => this.dashboardData()?.user ?? null);
}