import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Itinerario } from '../models/itinerario.model';

@Injectable({ providedIn: 'root' })
export class ItinerarioService {

  private readonly apiUrl = 'http://localhost:8080/api/viajes';

  constructor(private http: HttpClient) {}

  obtenerItinerario(viajeId: number): Observable<Itinerario> {
    return this.http.get<Itinerario>(`${this.apiUrl}/${viajeId}/itinerario`);
  }
}
