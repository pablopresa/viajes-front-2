import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';

import { ItinerarioItem } from '../../core/models/itinerario-item';
import { ActividadFormComponent } from '../actividad-form/actividad-form.component';
import { TrayectoFormComponent } from '../trayecto-form/trayecto-form.component';
import { ItinerarioService } from '../../core/services/itinerario.service';
import { Actividad } from '../../core/models/actividad.model';
import { ActivatedRoute, RouterModule } from "@angular/router";
import { Trayecto } from '../../core/models/trayecto.model';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface CalendarItem extends ItinerarioItem {
  top: number;
  height: number;
  _uid: string;
}

type SelectionMode = 'NONE' | 'ACTIVIDAD' | 'TRAYECTO';

@Component({
  selector: 'app-itinerario-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastModule],
  providers: [DialogService, MessageService],
  templateUrl: './itinerario-detail.component.html',
  styleUrl: './itinerario-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItinerarioDetailComponent implements OnInit {

  @HostListener('document:keydown.escape') onEscape() {
    if (this.isSelecting) {
      this.cancelSelection();
      this.previewByDay = {};
    }
  }

  // ────────────────────────
  // Estado de selección
  // ────────────────────────
  selectionMode: SelectionMode = 'NONE';
  selectionStart: Date | null = null;
  selectionEnd: Date | null = null;
  isSelecting = false;
  hoverDate: Date | null = null;

  previewByDay: Record<string, { top: number; height: number }[]> = {};

  // ────────────────────────
  // Datos del calendario
  // ────────────────────────
  items: ItinerarioItem[] = [];
  days: Date[] = [];
  hours: string[] = [];
  itemsByDay: Record<string, CalendarItem[]> = {};

  viajeInicio!: Date;
  viajeFin!: Date;
  monedaBase!: string;

  viajeId!: number;

  readonly START_HOUR = 0;
  readonly END_HOUR = 23;
  readonly SLOT_MINUTES = 30;
  readonly PX_PER_SLOT = 24;

  // ────────────────────────
  // Servicios
  // ────────────────────────
  private location = inject(Location);
  private dialogService = inject(DialogService);
  private actividadService = inject(ItinerarioService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);

  // ────────────────────────
  // Init
  // ────────────────────────
  ngOnInit(): void {

    this.viajeId = Number(this.route.snapshot.paramMap.get('id'));

    const state = history.state as {
      itinerario?: ItinerarioItem[];
      fechaInicio?: string | Date;
      fechaFin?: string | Date;
      monedaBase?: string;
    };


    if (!state?.fechaInicio || !state?.fechaFin) {
      this.reset();
      return;
    }

    this.viajeInicio = new Date(state.fechaInicio);
    this.viajeFin = new Date(state.fechaFin);
    this.monedaBase = state.monedaBase ?? '';

    this.items = (state.itinerario ?? []).map(item => ({
      ...item,
      inicio: new Date(item.inicio),
      fin: new Date(item.fin)
    }));

    this.buildDaysFromViaje();
    this.buildHours();
    this.mapItems();
  }

  // ────────────────────────
  // Navegación
  // ────────────────────────
  goBack(): void {
    this.location.back();
  }

  // ────────────────────────
  // Toolbar
  // ────────────────────────
  agregarActividad(): void {
    this.startSelection('ACTIVIDAD');
  }

  agregarTrayecto(): void {
    this.startSelection('TRAYECTO');
  }

  private startSelection(mode: SelectionMode): void {
    this.selectionMode = mode;
    this.selectionStart = null;
    this.selectionEnd = null;
    this.previewByDay = {};
    this.isSelecting = true;
  }

  cancelSelection(): void {
    this.selectionMode = 'NONE';
    this.selectionStart = null;
    this.selectionEnd = null;
    this.previewByDay = {};
    this.isSelecting = false;
  }

  // ────────────────────────
  // Interacción slots
  // ────────────────────────
  onSlotClick(day: Date, slotIndex: number): void {
    if (!this.isSelecting) return;

    const slotStart = this.slotToDate(day, slotIndex);
    const slotEnd = this.endExclusive(slotStart);

    // Primer click
    if (!this.selectionStart) {
      this.selectionStart = slotStart;
      this.selectionEnd = slotEnd;
      this.updatePreview();
      return;
    }

    // Segundo click → finalizar selección
    this.selectionEnd = slotEnd;
    this.normalizeSelection();
    this.updatePreview();

    const esValido = this.rangoValido(this.selectionStart, this.selectionEnd);

    if (esValido) {
      this.confirmRange();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Rango inválido',
        detail: 'La actividad o trayecto se superpone con otro elemento.'
      });
      this.cancelSelection();
    }
  }

  private rangoValido(start: Date | null, end: Date | null): boolean {
    if (!start || !end) return false;

    const nuevoInicio = start.getTime();
    const nuevoFin = end.getTime(); // ya es exclusivo

    return !this.items.some(item => {
      const itemInicio = item.inicio.getTime();
      const itemFin = itemInicio + item.duracionMinutos * 60_000;

      // solapamiento real
      return nuevoInicio < itemFin && itemInicio < nuevoFin;
    });
  }


  onSlotHover(day: Date, slotIndex: number): void {
    if (!this.isSelecting || !this.selectionStart) return;

    const slotStart = this.slotToDate(day, slotIndex);
    this.selectionEnd = this.endExclusive(slotStart);
    this.normalizeSelection();
    this.updatePreview();
  }


  private slotToDate(day: Date, slotIndex: number): Date {
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    d.setMinutes(slotIndex * this.SLOT_MINUTES);
    return d;
  }

  private normalizeSelection(): void {
    if (!this.selectionStart || !this.selectionEnd) return;

    if (this.selectionEnd < this.selectionStart) {
      [this.selectionStart, this.selectionEnd] = [
        this.selectionEnd,
        this.selectionStart
      ];
    }
  }

  // ────────────────────────
  // Preview del rango
  // ────────────────────────
  private updatePreview(): void {
    if (!this.selectionStart || !this.selectionEnd) return;

    const result: Record<string, { top: number; height: number }[]> = {};

    for (const day of this.days) {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const rangeStart = new Date(
        Math.max(dayStart.getTime(), this.selectionStart.getTime())
      );

      const rangeEnd = new Date(
        Math.min(dayEnd.getTime(), this.selectionEnd.getTime())
      );

      if (rangeStart >= rangeEnd) continue;

      const minutesFromDayStart =
        rangeStart.getHours() * 60 + rangeStart.getMinutes();

      const durationMinutes =
        (rangeEnd.getTime() - rangeStart.getTime()) / 60000;

      result[this.dayKey(day)] = [{
        top: (minutesFromDayStart / this.SLOT_MINUTES) * this.PX_PER_SLOT,
        height: (durationMinutes / this.SLOT_MINUTES) * this.PX_PER_SLOT
      }];
    }

    this.previewByDay = result;
  }

  // ────────────────────────
  // Confirmación
  // ────────────────────────
  private confirmRange(): void {
    if (!this.selectionStart || !this.selectionEnd) return;

    if (this.selectionMode === 'ACTIVIDAD') {
      this.openActividadModal();
    } else if (this.selectionMode === 'TRAYECTO') {
      this.openTrayectoModal();
    }
  }

  // ────────────────────────
  // Modales
  // ────────────────────────
  private openActividadModal(): void {
    const ref = this.dialogService.open(ActividadFormComponent, {
      header: 'Nueva actividad',
      width: '600px',
      data: {
        inicio: this.selectionStart,
        fin: this.selectionEnd,
        monedaBase: this.monedaBase
      }
    });

    if (!ref) return;

    ref.onClose.subscribe((actividad: Actividad | null) => {
      if (!actividad) {
        this.cancelSelection();
        return;
      }

      this.actividadService
        .crearActividad(actividad, this.viajeId)
        .subscribe({
          next: () => {
            this.reloadItinerario();
            this.cancelSelection();
          },
          error: err => {
            console.error('Error creando actividad', err);
            this.cancelSelection();
          }
        });

    });
  }

  private openTrayectoModal(): void {
    const ref = this.dialogService.open(TrayectoFormComponent, {
      header: 'Nuevo trayecto',
      width: '600px',
      data: {
        inicio: this.selectionStart,
        fin: this.selectionEnd,
        monedaBase: this.monedaBase
      }
    });

    if (!ref) return;

    ref.onClose.subscribe((trayecto: Trayecto | null) => {
      if (!trayecto) {
        this.cancelSelection();
        return;
      }

      this.actividadService
        .crearActividad(trayecto, this.viajeId)
        .subscribe({
          next: () => {
            this.reloadItinerario();
            this.cancelSelection();
          },
          error: err => {
            console.error('Error creando actividad', err);
            this.cancelSelection();
          }
        });
    });
  }


  // ────────────────────────
  // Calendar helpers
  // ────────────────────────
  private addItemToCalendar(item: ItinerarioItem): void {
    this.items = [...this.items, item];
    this.mapItems();
  }

  private reset(): void {
    this.items = [];
    this.days = [];
    this.hours = [];
    this.itemsByDay = {};
  }

  private buildDaysFromViaje(): void {
    const days: Date[] = [];
    const current = new Date(this.viajeInicio);
    current.setHours(0, 0, 0, 0);

    const end = new Date(this.viajeFin);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    this.days = days;
  }

  private buildHours(): void {
    const result: string[] = [];

    for (let h = this.START_HOUR; h <= this.END_HOUR; h++) {
      result.push(`${h.toString().padStart(2, '0')}:00`);
      if (h < this.END_HOUR) {
        result.push(`${h.toString().padStart(2, '0')}:30`);
      }
    }

    this.hours = result;
  }

  private mapItems(): void {
    const result: Record<string, CalendarItem[]> = {};

    for (const day of this.days) {
      result[this.dayKey(day)] = [];
    }

    for (const item of this.items) {
      const key = this.dayKey(item.inicio);
      if (!result[key]) continue;

      const minutesFromStart =
        item.inicio.getHours() * 60 + item.inicio.getMinutes();

      const top =
        (minutesFromStart / this.SLOT_MINUTES) * this.PX_PER_SLOT;

      const height =
        (item.duracionMinutos / this.SLOT_MINUTES) * this.PX_PER_SLOT;

      result[key].push({
        ...item,
        top,
        height,
        _uid: crypto.randomUUID()
      });
    }

    this.itemsByDay = result;
  }

  dayKey(d: Date): string {
    return d?.toISOString().substring(0, 10);
  }

  private reloadItinerario(): void {
    this.actividadService
      .obtenerItinerario(this.viajeId)
      .subscribe({
        next: itinerario => {
          this.items = this.mapItinerario(itinerario).map(item => ({
            ...item,
            inicio: new Date(item.inicio),
            fin: new Date(item.fin)
          }));

          this.mapItems();
        },
        error: err => {
          console.error('Error recargando itinerario', err);
        }
      });

    this.cdr.markForCheck();
  }

  private mapItinerario(itinerario: any): ItinerarioItem[] {
    const actividades = itinerario.actividades.map((a: any) => ({
      id: a.id,
      tipo: 'ACTIVIDAD',
      nombre: a.nombre,
      inicio: new Date(a.horaInicio),
      fin: new Date(a.horaFin),
      duracionMinutos: a.duracionMinutos
    }));

    const trayectos = itinerario.trayectos.map((t: any) => ({
      id: t.id,
      tipo: 'TRAYECTO',
      nombre: t.nombre,
      inicio: new Date(t.horaInicio),
      fin: new Date(t.horaFin),
      duracionMinutos: t.duracionMinutos,
      origen: t.origen,
      destino: t.destino,
      medioTransporte: t.medioTransporte
    }));

    return [...actividades, ...trayectos]
      .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  }

  private endExclusive(date: Date): Date {
    return new Date(date.getTime() + this.SLOT_MINUTES * 60_000);
  }


}
