import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { DynamicDialogRef, DynamicDialogConfig } from "primeng/dynamicdialog";
import { ItinerarioItem } from "../../core/models/itinerario-item";
import { Util } from "../../core/commons/util";

@Component({
  selector: 'app-itinerario-detalle-modal',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule
  ],
  templateUrl: './itinerario-detail-modal.component.html'
})
export class ItinerarioDetailModalComponent {

  item!: ItinerarioItem;
  ciudades: { label: string; value: number }[] = [];
  monedaBase!: string;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.item = config.data.item;
    this.ciudades = config.data.ciudades;
    this.monedaBase = config.data.monedaBase;
  }

  esActividad(): boolean {
    return this.item.tipo === 'ACTIVIDAD';
  }

  esTrayecto(): boolean {
    return this.item.tipo === 'TRAYECTO';
  }

  adjuntarArchivo(): void {
    console.log('Adjuntar archivo');
  }

  public obtenerNombreCiudad(ciudadId: any): string | undefined {
    return this.ciudades.find((x: any) => x.value == ciudadId)?.label;
  }

  public obtenerDuracionString(duracionMins: number): string {
    if (duracionMins < 60) {
      return `${duracionMins} mins.`;
    }

    const horas = Math.floor(duracionMins / 60);
    const minutos = duracionMins % 60;

    if (minutos === 0) {
      return `${horas} h`;
    }

    return `${horas}:${minutos.toString().padStart(2, '0')} h`;
  }

  public capitalize(texto: string | undefined): string {
    const ret = Util.capitalize(texto ?? '');
    return ret;
  }
}
