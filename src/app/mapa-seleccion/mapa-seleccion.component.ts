import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';

@Component({
  selector: 'app-mapa-seleccion',
  templateUrl: './mapa-seleccion.component.html',
  styleUrls: ['./mapa-seleccion.component.scss'],
})
export class MapaSeleccionComponent {
  @ViewChild('map') mapElement!: ElementRef;
  map: any;
  mostrarMapa: boolean = false;

  constructor() { }

  ngOnInit() {}

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

  initializeMap() {
    const latLng = new google.maps.LatLng(-34.397, 150.644);
    const mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }

  mostrarMapaParaSeleccion2() {
    this.mostrarMapa = true;
    this.loadGoogleMapsScript().then(() => {
      this.initializeMap();
    });
  }
}

   


