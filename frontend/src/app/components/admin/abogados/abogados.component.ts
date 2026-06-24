import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { LawyerService } from '../../../services/lawyer.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-abogados',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container">
      <h1 class="mb-3">Gestión de Abogados</h1>

      <div *ngIf="loading" class="loading">Cargando abogados...</div>

      <div *ngIf="!loading && lawyers.length === 0" class="card">
        <p>No hay abogados registrados.</p>
      </div>

      <div *ngFor="let lawyer of lawyers" class="card">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;">
            <h3>
              {{ lawyer.nombre }}
              <span *ngIf="lawyer.verificado" class="badge badge-success" style="margin-left: 0.5rem;">
                Verificado
              </span>
              <span *ngIf="!lawyer.verificado" class="badge badge-warning" style="margin-left: 0.5rem;">
                Pendiente
              </span>
            </h3>
            <p style="color: #666;">{{ lawyer.email }}</p>
            <p *ngIf="lawyer.matricula"><strong>Matrícula:</strong> {{ lawyer.matricula }}</p>
            <p *ngIf="lawyer.ciudad"><strong>Ciudad:</strong> {{ lawyer.ciudad }}</p>
            <div *ngIf="lawyer.especialidades && lawyer.especialidades.length > 0" style="margin-top: 0.5rem;">
              <strong>Especialidades:</strong>
              <span *ngFor="let esp of lawyer.especialidades" class="badge badge-primary" style="margin-left: 0.5rem;">
                {{ esp }}
              </span>
            </div>
            <p *ngIf="lawyer.bio" style="margin-top: 0.5rem;">{{ lawyer.bio }}</p>
          </div>
          <div>
            <button
              *ngIf="!lawyer.verificado"
              class="btn btn-success"
              (click)="verifyLawyer(lawyer.id)"
            >
              Verificar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AbogadosComponent implements OnInit {
  lawyers: any[] = [];
  loading = true;

  constructor(
    private lawyerService: LawyerService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadLawyers();
  }

  loadLawyers(): void {
    this.lawyerService.getAllLawyers().subscribe({
      next: (response) => {
        this.lawyers = response.lawyers;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar abogados:', err);
        this.loading = false;
      }
    });
  }

  verifyLawyer(lawyerId: number): void {
    this.http.patch(`${environment.apiUrl}/admin/lawyers/${lawyerId}`, {}).subscribe({
      next: () => {
        this.loadLawyers();
      },
      error: (err) => {
        console.error('Error al verificar abogado:', err);
      }
    });
  }
}
