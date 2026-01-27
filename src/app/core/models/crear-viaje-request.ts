
export interface CrearViajeRequest {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  monedaBase: string;
  rigidezRegistro: string;
  presupuestoTotal: number;
  ciudades: number[];
}
