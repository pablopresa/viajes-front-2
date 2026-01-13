import { Routes } from '@angular/router';

export const VIAJE_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./viaje-list/viaje-list.component')
        .then(c => c.ViajeListComponent)
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./viaje-create/viaje-create.component')
        .then(c => c.ViajeCreateComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./viaje-detail/viaje-detail.component')
        .then(c => c.ViajeDetailComponent)
  },
  {
    path: ':id/itinerario',
    loadComponent: () =>
      import('../itinerario/itinerario-detail/itinerario-detail.component')
        .then(c => c.ItinerarioDetailComponent)
  }
];
