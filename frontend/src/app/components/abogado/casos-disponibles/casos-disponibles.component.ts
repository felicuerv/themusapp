import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { CaseService } from '../../../services/case.service';
import { Case } from '../../../models/case.model';

@Component({
  selector: 'app-casos-disponibles',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container">
      <h1 class="mb-3">Casos Disponibles</h1>

      <div *ngIf="loading" class="loading">Cargando casos...</div>

      <div *ngIf="!loading && cases.length === 0" class="card">
        <p>No hay casos abiertos en este momento.</p>
      </div>

      <div *ngFor="let case of cases" class="card">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;">
            <h3 class="card-title">{{ case.titulo }}</h3>
            <p>{{ case.descripcion | slice:0:200 }}{{ case.descripcion.length > 200 ? '...' : '' }}</p>
            <p style="color: #666; font-size: 0.875rem; margin-top: 0.5rem;">
              Cliente: {{ case.client_nombre }}
            </p>
            <div style="margin-top: 1rem;">
              <span class="badge badge-primary">{{ case.tipo }}</span>
              <span class="badge"
                    [ngClass]="{
                      'badge-success': case.urgencia === 'baja',
                      'badge-warning': case.urgencia === 'media',
                      'badge-danger': case.urgencia === 'alta'
                    }">
                {{ case.urgencia }}
              </span>
            </div>
            <p style="margin-top: 0.5rem; color: #666; font-size: 0.875rem;">
              {{ case.applications_count }} postulaciones
              <span *ngIf="case.user_applied && case.user_applied > 0" class="badge badge-success" style="margin-left: 0.5rem;">
                Ya te postulaste
              </span>
            </p>
          </div>
          <div>
            <a [routerLink]="['/abogado/casos', case.id]" class="btn btn-primary">
              {{ case.user_applied && case.user_applied > 0 ? 'Ver detalle' : 'Postularme' }}
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CasosDisponiblesComponent implements OnInit {
  cases: Case[] = [];
  loading = true;

  constructor(private caseService: CaseService) {}

  ngOnInit(): void {
    this.loadCases();
  }

  loadCases(): void {
    this.caseService.getOpenCases().subscribe({
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
}
