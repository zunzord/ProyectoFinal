import { Component } from '@angular/core';
import { NativeBiometric } from 'capacitor-native-biometric';
import { Router } from '@angular/router';


@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})


export class TabsPage {

  

  constructor(private router: Router) {}

  goToMainMenu() {
    this.router.navigateByUrl('/tabs/tab1');
  }

  showError(message: string) {
    alert(message);
  }


  async loginBiometric() {
    const available = await NativeBiometric.isAvailable();
    if (available.isAvailable) {
      try {
        const result = await NativeBiometric.verifyIdentity({
          reason: 'Para validar tu identidad',
          title: 'Autenticación Biometrica',
          subtitle: 'Inicia sesión con biometría',
          description: 'Coloca tu dedo en el sensor',
        });
        this.goToMainMenu(); // Navegar al menú principal
      } catch (e) {
        this.showError('Falló la autenticación. Intenta de nuevo.'); // Mostrar mensaje de error
      }
    } else {
      this.showError('La biometría no está disponible en este dispositivo.');
    }
  }

}


