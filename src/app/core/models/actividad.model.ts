export interface Actividad {
    id: number;
    nombre: string;
    descripcion?: string;
    ubicacion?: string;
  
    horaInicio: string;   // ISO datetime
    horaFin: string;      // ISO datetime
    duracionMinutos: number;
  
    costoEstimado?: number;
  }
  