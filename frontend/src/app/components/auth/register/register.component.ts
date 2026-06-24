import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="card" style="max-width: 400px; margin: 3rem auto;">
        <h1 class="text-center mb-3">Registro</h1>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="nombre">Nombre completo</label>
            <input
              type="text"
              id="nombre"
              [(ngModel)]="formData.nombre"
              name="nombre"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="formData.email"
              name="email"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="formData.password"
              name="password"
              required
            />
          </div>

          <div class="form-group">
            <label for="rol">Tipo de cuenta</label>
            <select id="rol" [(ngModel)]="formData.rol" name="rol" required>
              <option value="">Seleccionar...</option>
              <option value="cliente">Cliente (Busco abogado)</option>
              <option value="abogado">Abogado (Ofrezco servicios)</option>
            </select>
          </div>

          <div *ngIf="error" class="error mb-2">{{ error }}</div>

          <button type="submit" class="btn btn-primary" style="width: 100%;">
            Registrarse
          </button>
        </form>

        <div class="text-center mt-3">
          <p>¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión aquí</a></p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  formData = {
    nombre: '',
    email: '',
    password: '',
    rol: '' as 'cliente' | 'abogado' | ''
  };
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error = '';

    if (!this.formData.rol) {
      this.error = 'Por favor selecciona un tipo de cuenta';
      return;
    }

    const registerData = {
      ...this.formData,
      rol: this.formData.rol as 'cliente' | 'abogado'
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        const user = response.user;
        if (user.rol === 'cliente') {
          this.router.navigate(['/cliente']);
        } else if (user.rol === 'abogado') {
          this.router.navigate(['/abogado/perfil']);
        }
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al registrarse';
      }
    });
  }
}
