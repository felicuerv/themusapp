import { Routes } from '@angular/router';
import { authGuard, clienteGuard, abogadoGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'cliente',
    canActivate: [authGuard, clienteGuard],
    children: [
      {
        path: '',
        redirectTo: 'casos',
        pathMatch: 'full'
      },
      {
        path: 'casos',
        loadComponent: () => import('./components/cliente/mis-casos/mis-casos.component').then(m => m.MisCasosComponent)
      },
      {
        path: 'casos/nuevo',
        loadComponent: () => import('./components/cliente/nuevo-caso/nuevo-caso.component').then(m => m.NuevoCasoComponent)
      },
      {
        path: 'casos/:id',
        loadComponent: () => import('./components/cliente/detalle-caso/detalle-caso.component').then(m => m.DetalleCasoComponent)
      }
    ]
  },
  {
    path: 'abogado',
    canActivate: [authGuard, abogadoGuard],
    children: [
      {
        path: '',
        redirectTo: 'casos',
        pathMatch: 'full'
      },
      {
        path: 'perfil',
        loadComponent: () => import('./components/abogado/perfil/perfil.component').then(m => m.PerfilComponent)
      },
      {
        path: 'casos',
        loadComponent: () => import('./components/abogado/casos-disponibles/casos-disponibles.component').then(m => m.CasosDisponiblesComponent)
      },
      {
        path: 'casos/:id',
        loadComponent: () => import('./components/abogado/detalle-caso-abogado/detalle-caso-abogado.component').then(m => m.DetalleCasoAbogadoComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'abogados',
        pathMatch: 'full'
      },
      {
        path: 'abogados',
        loadComponent: () => import('./components/admin/abogados/abogados.component').then(m => m.AbogadosComponent)
      },
      {
        path: 'casos',
        loadComponent: () => import('./components/admin/casos/casos.component').then(m => m.CasosAdminComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
