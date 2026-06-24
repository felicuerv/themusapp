import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { LawyerService } from '../../../services/lawyer.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container">
      <div class="card" style="max-width: 600px; margin: 0 auto;">
        <h1 class="mb-3">Mi Perfil Profesional</h1>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="matricula">Matrícula Profesional</label>
            <input
              type="text"
              id="matricula"
              [(ngModel)]="formData.matricula"
              name="matricula"
              placeholder="Ej: 12345"
            />
          </div>

          <div class="form-group">
            <label for="ciudad">Ciudad</label>
            <input
              type="text"
              id="ciudad"
              [(ngModel)]="formData.ciudad"
              name="ciudad"
              placeholder="Ej: Buenos Aires"
            />
          </div>

          <div class="form-group">
            <label for="especialidades">Especialidades (separadas por coma)</label>
            <input
              type="text"
              id="especialidades"
              [(ngModel)]="especialidadesStr"
              name="especialidades"
              placeholder="Ej: Penal, Civil, Laboral"
            />
          </div>

          <div class="form-group">
            <label for="bio">Biografía / Presentación</label>
            <textarea
              id="bio"
              [(ngModel)]="formData.bio"
              name="bio"
              rows="5"
              placeholder="Cuéntanos sobre tu experiencia profesional..."
            ></textarea>
          </div>

          <div *ngIf="error" class="error mb-2">{{ error }}</div>
          <div *ngIf="success" class="success mb-2">{{ success }}</div>

          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'Guardando...' : 'Guardar perfil' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class PerfilComponent implements OnInit {
  formData = {
    matricula: '',
    especialidades: [] as string[],
    bio: '',
    ciudad: ''
  };
  especialidadesStr = '';
  error = '';
  success = '';
  loading = false;
  userId!: number;

  constructor(
    private lawyerService: LawyerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.userId = user.id;
      this.loadProfile();
    }
  }

  loadProfile(): void {
    this.lawyerService.getLawyerProfile(this.userId).subscribe({
      next: (response) => {
        const profile = response.lawyer;
        this.formData.matricula = profile.matricula || '';
        this.formData.especialidades = profile.especialidades || [];
        this.formData.bio = profile.bio || '';
        this.formData.ciudad = profile.ciudad || '';
        this.especialidadesStr = this.formData.especialidades.join(', ');
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
      }
    });
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';
    this.loading = true;

    this.formData.especialidades = this.especialidadesStr
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);

    this.lawyerService.updateLawyerProfile(this.userId, this.formData).subscribe({
      next: () => {
        this.success = 'Perfil actualizado exitosamente';
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al actualizar perfil';
        this.loading = false;
      }
    });
  }
}
