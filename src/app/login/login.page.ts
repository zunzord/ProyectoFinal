import { Component } from '@angular/core';
import { NativeBiometric } from 'capacitor-native-biometric';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular'; // Importa Storage
import { App } from '@capacitor/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as CryptoJS from 'crypto-js';



interface Usuario {
  nombre: string;
  apellido: string;
  correo: string;
  clave: string;
  id: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  clave: string = '';
  mostrarInputClave: boolean = false; // Controla la visibilidad del input de clave
  generarUUID(): string {
    return 'xxxx-xxxx-4xxx-yxxx-xxxx-yyyy'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  constructor(private router: Router, private alertController: AlertController, private storage: Storage,private afAuth: AngularFireAuth,  ) {
    this.storage.create();
   this.iniciarAutenticacion();
    
  }

  async iniciarAutenticacion() {
    // Espera a que el usuario coloque su dedo durante 15 segundos
    setTimeout(() => {
      this.loginBiometric();
    }, 15000); // 15 segundos
    this.router.navigateByUrl('./login.page');
  }

  
  manejarToque() {
    // Muestra el input para ingresar la clave
    this.mostrarInputClave = true;
    // Aquí podrías restablecer el valor de `clave` si es necesario
    this.clave = '';
  }

  irARegistro() {
    // Navegar a la página de registro
    this.router.navigateByUrl('./login.page');
  }

  async mostrarRegistro() {
    const alert = await this.alertController.create({
        header: 'Registro',
        inputs: [
            { name: 'nombre', type: 'text', placeholder: 'Nombre' },
            { name: 'apellido', type: 'text', placeholder: 'Apellido' },
            { name: 'correo', type: 'email', placeholder: 'Correo' },
            { name: 'clave', type: 'password', placeholder: 'Clave' }
        ],
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Registrar',
                handler: async (data) => {
                    const idUnico = this.generarUUID();
                    const claveHash = CryptoJS.SHA256(data.clave).toString(CryptoJS.enc.Hex);
                    const usuarios: Usuario[] = await this.storage.get('usuarios') || [];
                    const usuarioExistente = usuarios.find(usuario => usuario.correo === data.correo);

                    if (!usuarioExistente) {
                        // No existe el usuario, así que procedemos a agregarlo.
                        usuarios.push({
                            nombre: data.nombre,
                            apellido: data.apellido,
                            correo: data.correo,
                            clave: claveHash,
                            id: idUnico
                        });
                        await this.storage.set('usuarios', usuarios);
                        this.mostrarAlerta('REGISTRADO!', 'Ya puede utilizar sus credenciales.');
                        this.router.navigateByUrl('/login');
                    } else {
                        // Usuario ya existe, mostrar error.
                        this.mostrarAlerta('Error', 'Ya existe una cuenta con este correo electrónico.');
                    }
                }
            }
        ]
    });

    await alert.present();
}

  async registrarUsuario(nombre: string, apellido: string, correo: string, clave: string) {
    // Aquí iría el código para guardar los datos del usuario, por ejemplo, en Ionic Storage o alguna otra base de datos.
    
    // Simular registro de huella dactilar
    const tokenHuella = this.generarTokenHuella();
    console.log(`Registro completado. Token de huella: ${tokenHuella}`);
  
    // Opcionalmente, mostrar un mensaje de éxito o realizar alguna acción adicional
    this.mostrarAlertaRegistroExitoso();
  }
  
  generarTokenHuella(): string {
    // Generar un token único para la huella dactilar. Esto es solo una simulación.
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  async mostrarAlertaRegistroExitoso() {
    const alert = await this.alertController.create({
      header: 'Registro Exitoso',
      message: 'Tu huella ha sido registrada. Usa tu huella para iniciar sesión.',
      buttons: ['OK']
      
    });
  
    await alert.present();
    this.router.navigateByUrl('./login.page');
  }
  
  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
  
    await alert.present();
  }

  async loginConClave() {
    const alert = await this.alertController.create({
      header: 'Iniciar Sesión',
      inputs: [
        {
          name: 'correo',
          type: 'email',
          placeholder: 'Correo'
        },
        {
          name: 'clave',
          type: 'password',
          placeholder: 'Clave'
        }
      ],
      buttons: [
        {
          text: 'Ingresar',
          handler: async (data) => {
            const usuarios: Usuario[] = await this.storage.get('usuarios') || [];
            const claveHash = CryptoJS.SHA256(data.clave).toString(CryptoJS.enc.Hex);
            const usuarioValido = usuarios.find(usuario => usuario.correo === data.correo && usuario.clave === claveHash);
    
            if (usuarioValido) {
              // Almacenar el identificador del usuario de manera cifrada en Ionic Storage
              const claveHashUsuario = CryptoJS.SHA256(usuarioValido.id).toString(CryptoJS.enc.Hex);
              await this.storage.set('usuarioActual', claveHashUsuario);
  
              this.mostrarAlerta('Bienvenido', 'Los datos ingresados son correctos.');
              this.router.navigateByUrl('/tabs/tabs/tab1');
            } else {
              this.mostrarAlerta('Error', 'Los datos ingresados son incorrectos o no existen.');
              this.router.navigateByUrl('/login');
            }
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Olvidé mi contraseña',
          handler: async () => {
            // Lógica para recuperar contraseña
          }
        },
      ]
    });
  
    await alert.present();
  }
  
  async olvideContraseña() {
    const alert = await this.alertController.create({
      header: 'Recuperar Contraseña',
      message: 'Ingresa tu correo electrónico para enviar las instrucciones de recuperación.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo electrónico'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Enviar',
          handler: data => {
            this.enviarCorreoRecuperacion(data.email);
          }
        }
      ]
    });
  
    await alert.present();
  }
  
  async enviarCorreoRecuperacion(email: string) {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
      this.mostrarAlerta('Correo enviado', 'Revisa tu correo electrónico para las instrucciones de recuperación.');
    } catch (error) {
      console.error(error);
      this.mostrarAlerta('Error', 'Hubo un problema al enviar el correo de recuperación. Asegúrate de que el correo electrónico esté registrado.');
    }
  }
  
 

  async loginBiometric() {
    const available = await NativeBiometric.isAvailable();
    if (!available.isAvailable || !this.mostrarInputClave) {
      // Si no está disponible o si ya se está mostrando el input de clave, muestra la opción de ingresar clave
      this.mostrarInputClave = true;
      // Espera otros 20 segundos para ingresar la clave
      setTimeout(() => {
        if (!this.clave) {
          // Si después de 20 segundos no se ha ingresado una clave, cierra la aplicación
          App.exitApp(); // Usa el plugin de Cordova para cerrar la app
        }
      }, 20000); // 20 segundos
    } else {
      // Aquí continúa la lógica de autenticación biométrica...
    }
  }
}








/*-------------------------------------------------------------------------------------------------------------------------------------------------------------*/

/*import { Component } from '@angular/core';
import { NativeBiometric } from 'capacitor-native-biometric';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular'; // Importa Storage
import { App } from '@capacitor/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as CryptoJS from 'crypto-js';



interface Usuario {
  nombre: string;
  apellido: string;
  correo: string;
  clave: string;
  id: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  clave: string = '';
  mostrarInputClave: boolean = false; // Controla la visibilidad del input de clave

  constructor(private router: Router, private alertController: AlertController, private storage: Storage,private afAuth: AngularFireAuth,  ) {
    this.storage.create();
    this.iniciarAutenticacion();
    
  }

  async iniciarAutenticacion() {
    // Espera a que el usuario coloque su dedo durante 15 segundos
    setTimeout(() => {
      this.loginBiometric();
    }, 15000); // 15 segundos
    this.router.navigateByUrl('./login.page');
  }

  
  manejarToque() {
    // Muestra el input para ingresar la clave
    this.mostrarInputClave = true;
    // Aquí podrías restablecer el valor de `clave` si es necesario
    this.clave = '';
  }

  irARegistro() {
    // Navegar a la página de registro
    this.router.navigateByUrl('./login.page');
  }

  async mostrarRegistro() {
    const alert = await this.alertController.create({
      header: 'Registro',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre'
        },
        {
          name: 'apellido',
          type: 'text',
          placeholder: 'Apellido'
        },
        {
          name: 'correo',
          type: 'email',
          placeholder: 'Correo'
        },
        {
          name: 'clave',
          type: 'password',
          placeholder: 'Clave'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Registrar',
          handler: async (data) => {
            // Aquí se verifica si ya existe un registro con el mismo nombre o correo
    
            const usuarios = await this.storage.get('usuarios') || [];
            const idUnico = this.generarUUID(); // Asume que ya tienes este método
            const claveHash = CryptoJS.SHA256(data.clave).toString(CryptoJS.enc.Hex); // Aplica hash a la contraseña

            
            interface Usuario {
              nombre: string;
              apellido: string;
              correo: string;
              clave: string;
            }
            const usuarioExistente = usuarios.find((usuario:any )=> usuario.nombre === data.nombre || usuario.correo === data.correo);

            
  
            if (usuarioExistente) {
              // Si encuentra un usuario existente con el mismo nombre o correo, verifica la clave
              if (usuarioExistente.clave === data.clave) {
                // Clave coincide, permitir acceso
                this.router.navigateByUrl('/tabs/tab1');
              } else {
                // Clave no coincide, mostrar error
                this.mostrarAlerta('Error', 'La clave no coincide con nuestros registros.');
              }
            } else {
              // Si no encuentra un usuario existente, opcionalmente podrías permitir el registro aquí
              usuarios.push(data);
              await this.storage.set('usuarios', usuarios);
              this.mostrarAlerta('REGISTRADO!', 'Ya puede utilizar sus credenciales');
              this.router.navigateByUrl('/login'); // O mostrar alguna alerta de éxito de registro
            }
          }
        }
      ]
      
    });

    
  
    await alert.present();
  }
  generarUUID(): string {
    return 'xxxx-xxxx-4xxx-yxxx-xxxx-xxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  async registrarUsuario(nombre: string, apellido: string, correo: string, clave: string) {
    // Aquí iría el código para guardar los datos del usuario, por ejemplo, en Ionic Storage o alguna otra base de datos.
    
    // Simular registro de huella dactilar
    const tokenHuella = this.generarTokenHuella();
    console.log(`Registro completado. Token de huella: ${tokenHuella}`);
  
    // Opcionalmente, mostrar un mensaje de éxito o realizar alguna acción adicional
    this.mostrarAlertaRegistroExitoso();
  }
  
  generarTokenHuella(): string {
    // Generar un token único para la huella dactilar. Esto es solo una simulación.
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  async mostrarAlertaRegistroExitoso() {
    const alert = await this.alertController.create({
      header: 'Registro Exitoso',
      message: 'Tu huella ha sido registrada. Usa tu huella para iniciar sesión.',
      buttons: ['OK']
      
    });
  
    await alert.present();
    this.router.navigateByUrl('./login.page');
  }
  
  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
  
    await alert.present();
  }

  async loginConClave() {
    const alert = await this.alertController.create({
      header: 'Iniciar Sesión',
      inputs: [
        {
          name: 'correo',
          type: 'email',
          placeholder: 'Correo'
        },
        {
          name: 'clave',
          type: 'password',
          placeholder: 'Clave'
        }
      ],
      buttons: [
        
        
        {
          text: 'Ingresar',
          handler: async (data) => {
            const usuarios: Usuario[] = await this.storage.get('usuarios') || [];
            const claveHash = CryptoJS.SHA256(this.clave).toString(CryptoJS.enc.Hex);
            const usuarioValido = usuarios.find(usuario => usuario.correo === data.correo && usuario.clave === claveHash);
  
            if (usuarioValido) {
             
              this.mostrarAlerta('Bienvenido', 'Los datos ingresados son correctos.');
              
              this.router.navigateByUrl('/tabs');
            } else {
             
              this.mostrarAlerta('Error', 'Los datos ingresados son incorrectos o no existen.');
              this.router.navigateByUrl('/login');this.router.navigateByUrl('/login');
            }
          }
        },

        {
          text: 'Cancelar',
          role: 'cancel',
        },

        {
          text: 'Olvidé mi contraseña',
          handler: async (data) => {
            // Aquí puedes llamar a otro método que maneje la recuperación de la contraseña.
            // Por ejemplo, mostrando otro alert para que el usuario ingrese su correo electrónico.
            this.olvideContraseña(); // Pasamos el correo por si ya lo ha introducido
          }
        },
      ]
    });
  
    await alert.present();
  }

  async olvideContraseña() {
    const alert = await this.alertController.create({
      header: 'Recuperar Contraseña',
      message: 'Ingresa tu correo electrónico para enviar las instrucciones de recuperación.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo electrónico'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Enviar',
          handler: data => {
            this.enviarCorreoRecuperacion(data.email);
          }
        }
      ]
    });
  
    await alert.present();
  }
  
  async enviarCorreoRecuperacion(email: string) {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
      this.mostrarAlerta('Correo enviado', 'Revisa tu correo electrónico para las instrucciones de recuperación.');
    } catch (error) {
      console.error(error);
      this.mostrarAlerta('Error', 'Hubo un problema al enviar el correo de recuperación. Asegúrate de que el correo electrónico esté registrado.');
    }
  }
  
 

  async loginBiometric() {
    const available = await NativeBiometric.isAvailable();
    if (!available.isAvailable || !this.mostrarInputClave) {
      // Si no está disponible o si ya se está mostrando el input de clave, muestra la opción de ingresar clave
      this.mostrarInputClave = true;
      // Espera otros 20 segundos para ingresar la clave
      setTimeout(() => {
        if (!this.clave) {
          // Si después de 20 segundos no se ha ingresado una clave, cierra la aplicación
          App.exitApp(); // Usa el plugin de Cordova para cerrar la app
        }
      }, 20000); // 20 segundos
    } else {
      // Aquí continúa la lógica de autenticación biométrica...
    }
  }
}*/



