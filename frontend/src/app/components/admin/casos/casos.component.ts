import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-casos-admin',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container">
      <h1 class="mb-3">Gestión de Casos</h1>

      <div *ngIf="loading" class="loading">Cargando casos...</div>

      <div *ngIf="!loading && cases.length === 0" class="card">
        <p>No hay casos registrados.</p>
      </div>

      <div *ngFor="let case of cases" class="card">
        <div>
          <h3>{{ case.titulo }}</h3>
          <p>{{ case.descripcion | slice:0:200 }}{{ case.descripcion.length > 200 ? '...' : '' }}</p>
          <p style="color: #666;">
            <strong>Cliente:</strong> {{ case.client_nombre }} ({{ case.client_email }})
          </p>
          <div style="margin: 1rem 0;">
            <span class="badge badge-primary">{{ case.tipo }}</span>
            <span class="badge"
                  [ngClass]="{
                    'badge-success': case.urgencia === 'baja',
                    'badge-warning': case.urgencia === 'media',
                    'badge-danger': case.urgencia === 'alta'
                  }">
              {{ case.urgencia }}
            </span>
            <span class="badge"
                  [ngClass]="{
                    'badge-success': case.estado === 'abierto',
                    'badge-warning': case.estado === 'en_proceso',
                    'badge-danger': case.estado === 'cerrado'
                  }">
              {{ case.estado }}
            </span>
          </div>
          <p style="color: #666; font-size: 0.875rem;">
            {{ case.applications_count }} postulaciones |
            Publicado: {{ case.created_at | date:'short' }}
          </p>
          <div style="margin-top: 1rem;">
            <button
              *ngIf="case.estado !== 'abierto'"
              class="btn btn-success"
              (click)="updateCaseStatus(case.id, 'abierto')"
            >
              Marcar como Abierto
            </button>
            <button
              *ngIf="case.estado !== 'en_proceso'"
              class="btn btn-secondary"
              (click)="updateCaseStatus(case.id, 'en_proceso')"
              style="margin-left: 0.5rem;"
            >
              Marcar en Proceso
            </button>
            <button
              *ngIf="case.estado !== 'cerrado'"
              class="btn btn-danger"
              (click)="updateCaseStatus(case.id, 'cerrado')"
              style="margin-left: 0.5rem;"
            >
              Cerrar Caso
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CasosAdminComponent implements OnInit {
  cases: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCases();
  }

  loadCases(): void {
    this.http.get<any>(`${environment.apiUrl}/admin/cases`).subscribe({
      next: (response) => {
        this.cases = response.cases;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar casos:', err);
        this.loading = false;
      }
    });
  }

  updateCaseStatus(caseId: number, estado: string): void {
    this.http.patch(`${environment.apiUrl}/admin/cases/${caseId}`, { estado }).subscribe({
      next: () => {
        this.loadCases();
      },
      error: (err) => {
        console.error('Error al actualizar caso:', err);
      }
    });
  }
}
