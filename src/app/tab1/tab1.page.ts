import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Geolocation } from '@capacitor/geolocation';
import { Storage } from '@ionic/storage-angular';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

declare var google: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, AfterViewInit {
  tareaForm!: FormGroup;
  @ViewChild('direccionInput') direccionInput!: ElementRef; // Accede al elemento del DOM
  @ViewChild('map') mapElement!: ElementRef;
  map: any;
  marker: any;
  longPressTimer: any;

  constructor(
    private formBuilder: FormBuilder,
    private storage: Storage,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
    private alertController: AlertController
    
  ) {}

  

  loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCtYOLsfQsqKdJAGO_7pgm821lyO_M9XRA&libraries=places`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        resolve();
      };
    });
  }

  ngOnInit() {
    
    this.inicializarFormulario();
    this.initAutocomplete();
    this.loadMaps();
      
   
    
  }

  ngAfterViewInit() { 
    this.loadGoogleMapsScript().then(() => {
      this.initializeMap();
    });
  }

  initializeOrResetMap() {
    if (!this.map) {
      // Si el mapa no existe, lo inicializa
      this.loadGoogleMapsScript().then(() => {
        const latLng = new google.maps.LatLng(-34.397, 150.644);
        const mapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
        };
  
        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        this.map.addListener('dblclick', async (e: google.maps.MapMouseEvent) => {
          const confirmacion = await this.confirmarGuardarUbicacion(latLng);
          if (confirmacion) {
            this.guardarUbicacionSeleccionada(e.latLng, "casa"); // Asumiendo "casa" como ejemplo
          }
        });
      });
    } else {
      // Si el mapa ya existe, simplemente asegúrate de que sea visible y refresca su estado
      this.mapElement.nativeElement.style.display = 'block';
      google.maps.event.trigger(this.map, 'resize');
      this.map.setCenter(new google.maps.LatLng(-34.397, 150.644)); // Ajusta a tus coordenadas predeterminadas
    }
  }

  initializeMap() {
    const latLng = new google.maps.LatLng(-34.397, 150.644);
    const mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.map.addListener('dblclick', (e: google.maps.MapMouseEvent) => this.confirmarGuardarUbicacion(latLng));
  }

  async loadMaps() {
    await this.loadGoogleMapsScript();
    const defaultCenter = { lat: -34.397, lng: 150.644 }; 
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 8,
      center: { lat: -34.397, lng: 150.644 },
    });
  
    
    this.marker = new google.maps.Marker({
      position: defaultCenter,
      map: this.map,
      title: 'Ubicación Seleccionada',
    });
    this.marker.setVisible(false);
  
   
    this.map.addListener('mousedown', (e: google.maps.MapMouseEvent) => {
      this.longPressTimer = setTimeout(() => {
        this.marker.setPosition(e.latLng);
        this.marker.setVisible(true);
         
      }, 3000); 
    });
    
    this.map.addListener('mouseup', () => {
      clearTimeout(this.longPressTimer);
    });
  }

  inicializarFormulario() {
    this.tareaForm = this.formBuilder.group({
      descripcion: ['', Validators.required],
      fechaVencimiento: ['', Validators.required],
      prioridad: ['media', Validators.required],
      categoria: this.formBuilder.array([]),
      recordatorio: [false],
      notas: ['']
    });
  }

  initAutocomplete(): void {
    
    setTimeout(() => {
      const inputElement = this.direccionInput.nativeElement.querySelector('input');
      const autocomplete = new google.maps.places.Autocomplete(inputElement);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        console.log(place.geometry.location.lat(), place.geometry.location.lng());
       
      });
    }, 1000);
  }

  async elegirMetodoRegistro(tipoUbicacion: 'casa' | 'trabajo') {
    const actionSheet = await this.actionSheetCtrl.create({
        header: 'Método de Registro',
        buttons: [
            {
                text: 'Manual',
                handler: () => {
                    // Mostrar mapa para selección manual
                    this.mostrarMapaParaSeleccion(tipoUbicacion);
                }
            },
            {
                text: 'Automático',
                handler: () => {
                    // Ejecutar registro automático de ubicación
                    this.registrarUbicacion(tipoUbicacion);
                }
            },
            {
                text: 'Cancelar',
                role: 'cancel'
            }
        ]
    });
    await actionSheet.present();
}

  

  async mostrarMapaParaSeleccion(tipoUbicacion: 'casa' | 'trabajo') {
    
    this.initializeOrResetMap();
    this.mapElement.nativeElement.style.display = 'block';

    
    if (!this.map) {
        await this.loadGoogleMapsScript();
    }
    
    
    this.initializeMap();

   
    google.maps.event.trigger(this.map, 'resize');
    this.map.setCenter({ lat: -34.397, lng: 150.644 }); 

    
    google.maps.event.clearListeners(this.map, 'dblclick');
    this.map.addListener('dblclick', async (e: any) => {
        const confirmacion = await this.confirmarGuardarUbicacion(e.latLng);
        if (confirmacion) {
            this.guardarUbicacionSeleccionada(e.latLng, tipoUbicacion);
        } else {
           
            this.mapElement.nativeElement.style.display = 'block';
        }
    });
}

  async confirmarGuardarUbicacion(latLng: { lat: number, lng: number }): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
        const alert = await this.alertController.create({
            header: 'Confirmar',
            message: '¿Deseas guardar esta ubicación?',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => {
                        this.mapElement.nativeElement.style.display = 'none'; 
                        resolve(false);
                    },
                },
                {
                    text: 'Aceptar',
                    handler: () => {
                        this.mapElement.nativeElement.style.display = 'none'; 
                        resolve(true);
                    },
                },
            ],
        });

        await alert.present();
    });
}
  
async guardarUbicacionSeleccionada(latLng: google.maps.LatLng, tipoUbicacion: 'casa' | 'trabajo') {
  // Llama a los métodos lat() y lng() para obtener los valores
  const coordenadas = { lat: latLng.lat(), lng: latLng.lng() };
  const usuarioId = await this.obtenerUsuarioId();
  await this.storage.set(`${tipoUbicacion}-${usuarioId}`, JSON.stringify(coordenadas));
  console.log(`Ubicación de ${tipoUbicacion} guardada:`, coordenadas);
}

  

  async guardarUbicacion(e: google.maps.MapMouseEvent, tipoUbicacion: 'casa' | 'trabajo') {
    if (!e.latLng) return;
    const usuarioId = await this.obtenerUsuarioId();
    const coordenadas = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    await this.storage.set(`${tipoUbicacion}-${usuarioId}`, JSON.stringify(coordenadas));
    console.log(`Ubicación de ${tipoUbicacion} guardada:`, coordenadas);
  }

  

  guardarTarea() {
    if (this.tareaForm.valid) {
      console.log('Tarea guardada', this.tareaForm.value);
      this.tareaForm.reset({
        prioridad: 'media',
        recordatorio: false 
      });
    } else {
      console.log('Formulario inválido');
    }
  }
  async obtenerUbicacionRegistrada(tipoUbicacion: 'casa' | 'trabajo') {
    const usuarioId = await this.obtenerUsuarioId();
    const ubicacion = await this.storage.get(`ubicacion_${tipoUbicacion}_${usuarioId}`);
    return JSON.parse(ubicacion);
  }

  async listarTareasBasadasEnUbicacion() {
    const usuarioId = await this.obtenerUsuarioId();
    const casa = JSON.parse(await this.storage.get(`casa-${usuarioId}`));
    const trabajo = JSON.parse(await this.storage.get(`trabajo-${usuarioId}`));
    
  }

  async registrarUbicacion(tipoUbicacion: 'casa' | 'trabajo') {
    const permiso = await Geolocation.requestPermissions();
    if (permiso.location === 'granted') {
      const ubicacion = await Geolocation.getCurrentPosition();
      const coordenadas = { lat: ubicacion.coords.latitude, lng: ubicacion.coords.longitude };
      const usuarioId = await this.obtenerUsuarioId();
      await this.storage.set(`${tipoUbicacion}-${usuarioId}`, JSON.stringify(coordenadas));
    }
  }

  async obtenerUsuarioId(): Promise<string> {
    const usuarioId = await this.storage.get('usuarioActual');
    return usuarioId ? usuarioId : '';
  }

  async presentarOpcionesUbicacion() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Registrar Ubicación',
      buttons: [
        {
          text: 'Personal',
          handler: () => {
            this.registrarUbicacion('casa');
          }
        },
        {
          text: 'Trabajo',
          handler: () => {
            this.registrarUbicacion('trabajo');
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  mostrarMapa = false; // Controla la visibilidad del mapa

mostrarMapaParaSeleccion2() {
  this.mostrarMapa = true;
  // Luego de establecer mostrarMapa a true, carga el mapa
  this.loadGoogleMapsScript().then(() => {
    this.initializeMap();
  });
}
  
}
