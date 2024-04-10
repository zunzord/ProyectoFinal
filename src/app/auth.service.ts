import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private authStatus = new BehaviorSubject<boolean>(false); 
  public authStatus$ = this.authStatus.asObservable(); 

  constructor() { }

  
  updateAuthStatus(isAuthenticated: boolean): void {
    this.authStatus.next(isAuthenticated);
  }
}