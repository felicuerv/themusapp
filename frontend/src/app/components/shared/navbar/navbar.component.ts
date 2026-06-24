import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav>
      <div class="container" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>Plataforma Legal</strong>
        </div>
        <div *ngIf="currentUser">
          <span style="margin-right: 1rem;">{{ currentUser.nombre }} ({{ currentUser.rol }})</span>

          <a *ngIf="currentUser.rol === 'cliente'" routerLink="/cliente/casos">Mis Casos</a>
          <a *ngIf="currentUser.rol === 'cliente'" routerLink="/cliente/casos/nuevo">Nuevo Caso</a>

          <a *ngIf="currentUser.rol === 'abogado'" routerLink="/abogado/casos">Casos</a>
          <a *ngIf="currentUser.rol === 'abogado'" routerLink="/abogado/perfil">Mi Perfil</a>

          <a *ngIf="currentUser.rol === 'admin'" routerLink="/admin/abogados">Abogados</a>
          <a *ngIf="currentUser.rol === 'admin'" routerLink="/admin/casos">Casos</a>

          <button class="btn btn-secondary" (click)="logout()" style="margin-left: 1rem;">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
