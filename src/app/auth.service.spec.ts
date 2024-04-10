import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new Subject<boolean>();

  
  authState$ = this.authState.asObservable();

  constructor() { }

  
  authenticate(success: boolean) {
    this.authState.next(success);
  }

  
}