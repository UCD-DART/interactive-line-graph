export const myMapStyles = [
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#78909c"
      },
      {
        lightness: 17
      }
    ]
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [
      {
        color: "a7c0cd"
      },
      {
        lightness: 20
      }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#ffffff"
      },
      {
        lightness: 17
      }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#fff"
      },
      {
        lightness: 50
      },
      {
        weight: 0
      }
    ]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [
      {
        color: "#00000"
      },
      {
        lightness: 18
      },
      {
        visibility: "on"
      }
    ]
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [
      {
        color: "#ffffff"
      },
      {
        lightness: 16
      },
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      {
        color: "#f5f5f5"
      },
      {
        lightness: 21
      }
    ]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#dedede"
      },
      {
        lightness: 21
      }
    ]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        visibility: "off"
      },
      {
        color: "#ffffff"
      },
      {
        lightness: 16
      }
    ]
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        saturation: 36
      },
      {
        color: "#000000"
      },
      {
        lightness: 10
      },
      {
        zIndex: 99999999
      }
    ]
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "on"
      }
    ]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [
      {
        color: "#f2f2f2"
      },
      {
        lightness: 19
      }
    ]
  },
  {
    featureType: "administrative",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#fefefe"
      },
      {
        lightness: 20
      }
    ]
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#fefefe"
      },
      {
        lightness: 17
      },
      {
        weight: 1.2
      }
    ]
  },
  {
    featureType: "all",
    stylers: [{ visibility: "simplified" }]
  }
];

export const mapOptions = {
  center: { lat: 35.97, lng: -119.2 },
  zoom: 8,
  mapTypeControl: false,
  scrollwheel: false,
  fullscreenControl: false,
  streetViewControl: false,
  styles: myMapStyles
};

export const invasiveMapOptions = {
  center: { lat: 35.8146995, lng: -119.4412634 },
  zoom: 7,
  mapTypeControl: false,
  scrollwheel: false,
  fullscreenControl: false,
  streetViewControl: false,
  styles: myMapStyles
};
