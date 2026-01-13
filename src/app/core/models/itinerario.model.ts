import { Actividad } from './actividad.model';
import { Trayecto } from './trayecto.model';

export interface Itinerario {
  id: number;
  notaGeneral?: string | null;
  actividades: Actividad[];
  trayectos: Trayecto[];
}
