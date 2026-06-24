import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { CaseService } from '../../../services/case.service';
import { Case, Application } from '../../../models/case.model';

@Component({
  selector: 'app-detalle-caso',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container">
      <div *ngIf="loading" class="loading">Cargando...</div>

      <div *ngIf="!loading && case">
        <div class="card">
          <h1>{{ case.titulo }}</h1>
          <div style="margin: 1rem 0;">
            <span class="badge badge-primary">{{ case.tipo }}</span>
            <span class="badge"
                  [ngClass]="{
                    'badge-success': case.urgencia === 'baja',
                    'badge-warning': case.urgencia === 'media',
                    'badge-danger': case.urgencia === 'alta'
                  }">
              Urgencia: {{ case.urgencia }}
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
          <p style="white-space: pre-wrap;">{{ case.descripcion }}</p>
          <p style="color: #666; font-size: 0.875rem; margin-top: 1rem;">
            Publicado: {{ case.created_at | date:'medium' }}
          </p>
        </div>

        <div class="card">
          <h2 class="mb-2">Postulaciones ({{ applications.length }})</h2>

          <div *ngIf="applications.length === 0">
            <p>No hay postulaciones aún.</p>
          </div>

          <div *ngFor="let app of applications" class="card" style="background: #f9f9f9;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div>
                <h3 style="margin-bottom: 0.5rem;">
                  {{ app.lawyer_nombre }}
                  <span *ngIf="app.verificado" class="badge badge-success" style="margin-left: 0.5rem;">
                    Verificado
                  </span>
                </h3>
                <p style="color: #666; font-size: 0.875rem;">{{ app.lawyer_email }}</p>
                <p *ngIf="app.matricula" style="color: #666; font-size: 0.875rem;">
                  Matrícula: {{ app.matricula }}
                </p>
                <div *ngIf="app.especialidades && app.especialidades.length > 0" style="margin-top: 0.5rem;">
                  <span *ngFor="let esp of app.especialidades" class="badge badge-primary" style="margin-right: 0.5rem;">
                    {{ esp }}
                  </span>
                </div>
                <p *ngIf="app.mensaje" style="margin-top: 1rem;">{{ app.mensaje }}</p>
              </div>
            </div>
            <p style="color: #666; font-size: 0.875rem; margin-top: 1rem;">
              Postulación: {{ app.fecha | date:'medium' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DetalleCasoComponent implements OnInit {
  case: Case | null = null;
  applications: Application[] = [];
  loading = true;
  caseId!: number;

  constructor(
    private route: ActivatedRoute,
    private caseService: CaseService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.caseId = +params['id'];
      this.loadCase();
      this.loadApplications();
    });
  }

  loadCase(): void {
    this.caseService.getCaseById(this.caseId).subscribe({
      next: (response) => {
        this.case = response.case;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar caso:', err);
        this.loading = false;
      }
    });
  }

  loadApplications(): void {
    this.caseService.getApplicationsByCase(this.caseId).subscribe({
      next: (response) => {
        this.applications = response.applications;
      },
      error: (err) => {
        console.error('Error al cargar postulaciones:', err);
      }
    });
  }
}
