import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { CaseService } from '../../../services/case.service';
import { Case } from '../../../models/case.model';

@Component({
  selector: 'app-detalle-caso-abogado',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
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
          </div>
          <p style="white-space: pre-wrap;">{{ case.descripcion }}</p>
          <p style="color: #666; font-size: 0.875rem; margin-top: 1rem;">
            Cliente: {{ case.client_nombre }}<br>
            Publicado: {{ case.created_at | date:'medium' }}
          </p>
        </div>

        <div class="card">
          <h2 class="mb-2">Postularme a este caso</h2>

          <div *ngIf="alreadyApplied" class="success mb-2">
            Ya te has postulado a este caso.
          </div>

          <form *ngIf="!alreadyApplied" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="mensaje">Mensaje de presentación (opcional)</label>
              <textarea
                id="mensaje"
                [(ngModel)]="mensaje"
                name="mensaje"
                rows="4"
                placeholder="Cuéntale al cliente por qué eres la mejor opción para este caso..."
              ></textarea>
            </div>

            <div *ngIf="error" class="error mb-2">{{ error }}</div>
            <div *ngIf="success" class="success mb-2">{{ success }}</div>

            <button type="submit" class="btn btn-primary" [disabled]="submitting">
              {{ submitting ? 'Enviando...' : 'Enviar postulación' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class DetalleCasoAbogadoComponent implements OnInit {
  case: Case | null = null;
  loading = true;
  caseId!: number;
  mensaje = '';
  alreadyApplied = false;
  submitting = false;
  error = '';
  success = '';

  constructor(
    private route: ActivatedRoute,
    private caseService: CaseService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.caseId = +params['id'];
      this.loadCase();
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

  onSubmit(): void {
    this.error = '';
    this.success = '';
    this.submitting = true;

    this.caseService.applyToCase(this.caseId, this.mensaje).subscribe({
      next: () => {
        this.success = 'Postulación enviada exitosamente';
        this.alreadyApplied = true;
        this.submitting = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al enviar postulación';
        if (this.error.includes('Ya te has postulado')) {
          this.alreadyApplied = true;
        }
        this.submitting = false;
      }
    });
  }
}
