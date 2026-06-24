import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Case, CreateCaseRequest, Application } from '../models/case.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private apiUrl = `${environment.apiUrl}/cases`;

  constructor(private http: HttpClient) {}

  createCase(data: CreateCaseRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getMyCases(): Observable<{ cases: Case[] }> {
    return this.http.get<{ cases: Case[] }>(`${this.apiUrl}/mine`);
  }

  getOpenCases(tipo?: string): Observable<{ cases: Case[] }> {
    const params = tipo ? { tipo } : {};
    return this.http.get<{ cases: Case[] }>(`${this.apiUrl}/open`, { params });
  }

  getCaseById(id: number): Observable<{ case: Case }> {
    return this.http.get<{ case: Case }>(`${this.apiUrl}/${id}`);
  }

  updateCase(id: number, estado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { estado });
  }

  applyToCase(caseId: number, mensaje?: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/applications/${caseId}`, { mensaje });
  }

  getApplicationsByCase(caseId: number): Observable<{ applications: Application[] }> {
    return this.http.get<{ applications: Application[] }>(
      `${environment.apiUrl}/applications/${caseId}`
    );
  }
}
