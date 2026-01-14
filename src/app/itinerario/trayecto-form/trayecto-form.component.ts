import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-trayecto-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    ButtonModule,
    SelectModule
  ],
  templateUrl: './trayecto-form.component.html',
  styleUrl: './trayecto-form.component.css',
})
export class TrayectoFormComponent {

  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);

  readonly inicio: Date = this.config.data.inicio;
  readonly fin: Date = this.config.data.fin;
  readonly monedaBase: string = this.config.data.monedaBase;

  mediosDeTransporte = [
    { label: 'Avión', value: 'AVION' },
    { label: 'Tren', value: 'TREN' },
    { label: 'Bus', value: 'BUS' },
    { label: 'Barco', value: 'BARCO' },
    { label: 'Pie', value: 'PIE' },
  ];

  form = this.fb.nonNullable.group({
    nombre: [''],
    ubicacion: [''],
    origen: ['', Validators.required],
    destino: ['', Validators.required],
    medioTransporte: ['', Validators.required],
    duracionMinutos: [
      this.calcularDuracion(),
      [Validators.required, Validators.min(1)]
    ],
    costoEstimado: [null as number | null],
    descripcion: ['']
  });

  private calcularDuracion(): number {
    const diffMs = this.fin.getTime() - this.inicio.getTime();
    return Math.max(1, Math.round(diffMs / 60000));
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.buildActividad());
  }

  private buildActividad() {
    const fecha = this.formatDateLocal(this.inicio);
    const horaInicio = this.formatDateTimeLocal(this.inicio);
  
    return {
      nombre: this.obtenerNombre(),
      fecha,
      horaInicio,
      duracionMinutos: this.form.controls.duracionMinutos.value,
      ubicacion: this.form.controls.ubicacion.value ?? '',
      costo: null,
      descripcion: this.obtenerNombre(),
      costoEstimado: this.form.controls.costoEstimado.value,
      origen: this.form.controls.origen.value,
      destino: this.form.controls.destino.value,
      tipo: 'TRAYECTO'
    };
  }

  private obtenerNombre(): string{
    return this.form.controls.medioTransporte.value + ' de ' + this.form.controls.origen.value + ' a ' + this.form.controls.destino.value;
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }

  private formatDateLocal(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  
  private formatDateTimeLocal(date: Date): string {
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${this.formatDateLocal(date)}T${h}:${min}`;
  }
  
}