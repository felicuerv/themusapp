import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { CaseService } from '../../../services/case.service';
import { Case } from '../../../models/case.model';

@Component({
  selector: 'app-mis-casos',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h1>Mis Casos</h1>
        <a routerLink="/cliente/casos/nuevo" class="btn btn-primary">+ Nuevo Caso</a>
      </div>

      <div *ngIf="loading" class="loading">Cargando casos...</div>

      <div *ngIf="!loading && cases.length === 0" class="card">
        <p>No tienes casos publicados aún.</p>
        <a routerLink="/cliente/casos/nuevo" class="btn btn-primary mt-2">Publicar mi primer caso</a>
      </div>

      <div *ngFor="let case of cases" class="card">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;">
            <h3 class="card-title">{{ case.titulo }}</h3>
            <p>{{ case.descripcion | slice:0:150 }}{{ case.descripcion.length > 150 ? '...' : '' }}</p>
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
              <span class="badge"
                    [ngClass]="{
                      'badge-success': case.estado === 'abierto',
                      'badge-warning': case.estado === 'en_proceso',
                      'badge-danger': case.estado === 'cerrado'
                    }">
                {{ case.estado }}
              </span>
            </div>
            <p style="margin-top: 0.5rem; color: #666; font-size: 0.875rem;">
              {{ case.applications_count }} postulaciones
            </p>
          </div>
          <div>
            <a [routerLink]="['/cliente/casos', case.id]" class="btn btn-secondary">Ver detalle</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MisCasosComponent implements OnInit {
  cases: Case[] = [];
  loading = true;

  constructor(private caseService: CaseService) {}

  ngOnInit(): void {
    this.loadCases();
  }

  loadCases(): void {
    this.caseService.getMyCases().subscribe({
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
