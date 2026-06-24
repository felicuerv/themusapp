import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="card" style="max-width: 400px; margin: 3rem auto;">
        <h1 class="text-center mb-3">Iniciar Sesión</h1>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="credentials.email"
              name="email"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="credentials.password"
              name="password"
              required
            />
          </div>

          <div *ngIf="error" class="error mb-2">{{ error }}</div>

          <button type="submit" class="btn btn-primary" style="width: 100%;">
            Iniciar Sesión
          </button>
        </form>

        <div class="text-center mt-3">
          <p>¿No tienes cuenta? <a routerLink="/register">Regístrate aquí</a></p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error = '';
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        const user = response.user;
        if (user.rol === 'cliente') {
          this.router.navigate(['/cliente']);
        } else if (user.rol === 'abogado') {
          this.router.navigate(['/abogado']);
        } else if (user.rol === 'admin') {
          this.router.navigate(['/admin']);
        }
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al iniciar sesión';
      }
    });
  }
}
