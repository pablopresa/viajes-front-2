
export interface CrearViajeRequest {
    nombre: string;
    fechaInicio: string; // yyyy-MM-dd
    fechaFin: string;
    monedaBase: string;
    rigidezRegistro: string;
    presupuestoTotal: number;
    tipoCambio: number;
  }
  