export interface Trayecto {
    id: number;
    nombre: string;
    descripcion?: string;
  
    origen: string;
    destino: string;
    medioTransporte: string;
  
    horaInicio: string;   // ISO datetime
    horaFin: string;      // ISO datetime
    duracionMinutos: number;
  
    costoEstimado?: number;
  }
  