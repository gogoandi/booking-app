import { Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";

import { LoginComponent } from "./auth/login/login.component";
import { RegisterComponent } from "./auth/register/register.component";

export const appRoutes: Routes = [
    {path: '', component: HomeComponent },
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent}
]