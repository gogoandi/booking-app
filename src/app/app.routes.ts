import { Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";

import { LoginComponent } from "./auth/login/login.component";
import { RegisterComponent } from "./auth/register/register.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AuthGuard, GuestGuard } from "./auth/auth.guard";
import { AboutComponent } from "./about/about.component";
import { ContactComponent } from "./contact/contact.component";

export const appRoutes: Routes = [
    {path: '', component: HomeComponent },
    {path: 'about', component: AboutComponent},
    {path: 'contact', component: ContactComponent},
    {path: 'login', component: LoginComponent, canActivate: [GuestGuard]},
    {path: 'register', component: RegisterComponent, canActivate: [GuestGuard]},
    {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]}
]