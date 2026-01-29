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
  private readonly apiUrl = 'http://192.168.1.4:8080/api';

  constructor(private http: HttpClient) { }

  obtenerItinerario(viajeId: number): Observable<Itinerario> {
    return this.http.get<Itinerario>(`${this.apiUrl}/viajes/${viajeId}/itinerario`);
  }

  crearActividad(item: Actividad | Trayecto, viajeId: number): Observable<ItinerarioItem> {
    return this.http.post<ItinerarioItem>(`${this.apiUrl}/viajes/${viajeId}/actividades`, item);
  }

  agregarAdjunto(form: FormData): Observable<any> {
    return this.http.post( `${this.apiUrl}/adjuntos`, form);
  }

  descargarAdjunto(adjuntoId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/adjuntos/${adjuntoId}`,
      { responseType: 'blob', observe: 'response' }
    );
  }
}
