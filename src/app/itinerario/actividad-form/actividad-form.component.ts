import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-actividad-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    ButtonModule
  ],
  templateUrl: './actividad-form.component.html',
  styleUrl: './actividad-form.component.css'
})
export class ActividadFormComponent {

  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);

  readonly inicio: Date = this.config.data.inicio;
  readonly fin: Date = this.config.data.fin;

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    ubicacion: [''],
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

    const fecha = this.inicio.toISOString().substring(0, 10);
    const horaInicio = this.inicio.toISOString().substring(0, 16);

    this.dialogRef.close({
      nombre: this.form.value.nombre!,
      fecha,
      horaInicio,
      duracionMinutos: this.form.value.duracionMinutos!,
      ubicacion: this.form.value.ubicacion ?? '',
      costo: null,
      descripcion: this.form.value.descripcion ?? '',
      costoEstimado: this.form.value.costoEstimado,
      tipo: 'ACTIVIDAD'
    });
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
