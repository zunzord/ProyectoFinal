import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Cambia Subject por BehaviorSubject para mantener un estado inicial
  private authStatus = new BehaviorSubject<boolean>(false); // Inicia como no autenticado
  public authStatus$ = this.authStatus.asObservable(); // Exponer como observable para suscripción

  constructor() { }

  // Método para actualizar el estado de autenticación
  updateAuthStatus(isAuthenticated: boolean): void {
    this.authStatus.next(isAuthenticated);
  }
}