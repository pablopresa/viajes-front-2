import { Itinerario } from "./itinerario.model";

export interface Viaje {
  id: number;
  nombre: string;
  fechaInicio: string; // yyyy-MM-dd
  fechaFin: string;
  monedaBase: 'EUR' | 'USD';
  rigidezRegistro: 'BAJA' | 'MEDIA' | 'ALTA';
  presupuestoTotal: number;
  tipoCambio: number;
  itinerario: Itinerario;
}
