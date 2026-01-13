import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';

import { ViajeService } from '../../core/services/viaje.service';

import { CrearViajeRequest } from '../../core/models/crear-viaje-request';

@Component({
  standalone: true,
  selector: 'app-viaje-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    InputNumberModule,
    ButtonModule
  ],
  templateUrl: './viaje-create.component.html',
  styleUrls: ['./viaje-create.component.css']
})
export class ViajeCreateComponent {

  cancelar() {
    throw new Error('Method not implemented.');
  }

  private fb: FormBuilder = inject(FormBuilder);
  private viajeService = inject(ViajeService);
  private router: Router = inject(Router);

  loading = false;
  error?: string;

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    fechaInicio: [new Date(), Validators.required],
    fechaFin: [new Date(), Validators.required],
    monedaBase: ['EUR', Validators.required],
    rigidezRegistro: ['MEDIA', Validators.required],
    presupuestoTotal: [0, Validators.min(0)],
    tipoCambio: [1, Validators.min(0)],
    id: [0]
  });

  monedas = [
    { label: 'EUR', value: 'EUR' },
    { label: 'USD', value: 'USD' }
  ];

  rigideces = [
    { label: 'Baja', value: 'BAJA' },
    { label: 'Media', value: 'MEDIA' },
    { label: 'Alta', value: 'ALTA' }
  ];

  guardar(): void {
    if (this.form.invalid || this.loading) {
      return;
    }

    this.loading = true;
    this.error = undefined;

    const raw = this.form.getRawValue();

    const viaje: CrearViajeRequest = {
      nombre: raw.nombre,
      fechaInicio: this.formatDate(raw.fechaInicio),
      fechaFin: this.formatDate(raw.fechaFin),
      monedaBase: raw.monedaBase,
      rigidezRegistro: raw.rigidezRegistro,
      presupuestoTotal: raw.presupuestoTotal,
      tipoCambio: raw.tipoCambio
    };

    this.viajeService.crearViaje(viaje).subscribe({
      next: () => this.router.navigate(['/viajes']),
      error: err => {
        console.error(err);
        this.error = 'Error al crear el viaje';
        this.loading = false;
      }
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
