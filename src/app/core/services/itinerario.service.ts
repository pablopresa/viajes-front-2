import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Itinerario } from '../models/itinerario.model';
import { Actividad } from '../models/actividad.model';
import { ItinerarioItem } from '../models/itinerario-item';
import { Trayecto } from '../models/trayecto.model';

@Injectable({ providedIn: 'root' })
export class ItinerarioService {

  // private readonly apiUrl = '/api/viajes';
  private readonly apiUrl = 'http://localhost:8080/api/viajes';

  constructor(private http: HttpClient) { }

  obtenerItinerario(viajeId: number): Observable<Itinerario> {
    return this.http.get<Itinerario>(`${this.apiUrl}/${viajeId}/itinerario`);
  }

  crearActividad(actividad: Actividad | Trayecto, viajeId: number): Observable<ItinerarioItem> {
    return this.http.post<ItinerarioItem>(`${this.apiUrl}/${viajeId}/actividades`, actividad);
  }
}
