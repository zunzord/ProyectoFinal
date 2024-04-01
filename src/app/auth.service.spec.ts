import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new Subject<boolean>();

  // Observable que los componentes pueden suscribirse
  authState$ = this.authState.asObservable();

  constructor() { }

  // Llamar este método para emitir un evento de autenticación exitosa
  authenticate(success: boolean) {
    this.authState.next(success);
  }

  // Aquí puedes agregar métodos para manejar la lógica de autenticación
}