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
        lightness: 29
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
        color: "#ffffff"
      },
      {
        lightness: 18
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
        visibility: "on"
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
        color: "#333333"
      },
      {
        lightness: 40
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
  }
];

export const mapOptions = {
  center: { lat: 35.97, lng: -119.2 },
  zoom: 7,
  mapTypeControl: false,
  scrollwheel: false,
  fullscreenControl: false,
  streetViewControl: false,
  styles: myMapStyles
};
