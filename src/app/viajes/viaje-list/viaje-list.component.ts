import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

import { Viaje } from '../../core/models/viaje.model';
import { ViajeService } from '../../core/services/viaje.service';

@Component({
  selector: 'app-viaje-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule
  ],
  templateUrl: './viaje-list.component.html',
  styleUrls: ['./viaje-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViajeListComponent implements OnInit {

  viajes: Viaje[] = [];
  viajes$ = this.viajeService.listarViajes();
  loading = true;

  constructor(private viajeService: ViajeService) {}

  ngOnInit(): void {
    this.viajeService.listarViajes().subscribe({
      next: viajes => {
        this.viajes = viajes;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
