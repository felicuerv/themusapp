import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { CaseService } from '../../../services/case.service';

@Component({
  selector: 'app-nuevo-caso',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container">
      <div class="card" style="max-width: 600px; margin: 0 auto;">
        <h1 class="mb-3">Publicar Nuevo Caso</h1>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="titulo">Título del caso</label>
            <input
              type="text"
              id="titulo"
              [(ngModel)]="formData.titulo"
              name="titulo"
              required
              placeholder="Ej: Necesito asesoría legal para contrato laboral"
            />
          </div>

          <div class="form-group">
            <label for="tipo">Tipo de caso</label>
            <select id="tipo" [(ngModel)]="formData.tipo" name="tipo" required>
              <option value="">Seleccionar...</option>
              <option value="Civil">Civil</option>
              <option value="Penal">Penal</option>
              <option value="Laboral">Laboral</option>
              <option value="Familiar">Familiar</option>
              <option value="Comercial">Comercial</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción detallada</label>
            <textarea
              id="descripcion"
              [(ngModel)]="formData.descripcion"
              name="descripcion"
              required
              rows="6"
              placeholder="Describe tu caso con el mayor detalle posible..."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="urgencia">Urgencia</label>
            <select id="urgencia" [(ngModel)]="formData.urgencia" name="urgencia" required>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <div *ngIf="error" class="error mb-2">{{ error }}</div>
          <div *ngIf="success" class="success mb-2">{{ success }}</div>

          <div style="display: flex; gap: 1rem;">
            <button type="submit" class="btn btn-primary" [disabled]="loading">
              {{ loading ? 'Publicando...' : 'Publicar caso' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="goBack()">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class NuevoCasoComponent {
  formData = {
    titulo: '',
    descripcion: '',
    tipo: '',
    urgencia: 'media' as 'baja' | 'media' | 'alta'
  };
  error = '';
  success = '';
  loading = false;

  constructor(
    private caseService: CaseService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error = '';
    this.success = '';
    this.loading = true;

    this.caseService.createCase(this.formData).subscribe({
      next: () => {
        this.success = 'Caso publicado exitosamente';
        setTimeout(() => {
          this.router.navigate(['/cliente/casos']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al publicar el caso';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/cliente/casos']);
  }
}
