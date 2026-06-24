import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LawyerProfile } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LawyerService {
  private apiUrl = `${environment.apiUrl}/lawyers`;

  constructor(private http: HttpClient) {}

  getLawyerProfile(id: number): Observable<{ lawyer: any }> {
    return this.http.get<{ lawyer: any }>(`${this.apiUrl}/${id}`);
  }

  updateLawyerProfile(id: number, data: Partial<LawyerProfile>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  getAllLawyers(): Observable<{ lawyers: any[] }> {
    return this.http.get<{ lawyers: any[] }>(this.apiUrl);
  }
}
