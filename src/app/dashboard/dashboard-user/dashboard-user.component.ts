import { Component, computed, inject, type Signal } from '@angular/core';
import { ROUTER_OUTLET_DATA, RouterLink } from '@angular/router';

import { UserModel } from '../../auth/user.model';
import { ButtonComponent } from '../../shared/button/button.component';

interface DashboardOutletData {
  user: UserModel | null;
}

@Component({
  selector: 'app-dashboard-user',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  templateUrl: './dashboard-user.component.html',
  styleUrl: './dashboard-user.component.css',
})
export class DashboardUserComponent {
  private dashboardData = inject(ROUTER_OUTLET_DATA) as Signal<DashboardOutletData | null>;

  user = computed(() => this.dashboardData()?.user ?? null);
}
