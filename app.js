/* global document, google */
import { GoogleMapsOverlay as DeckOverlay } from '@deck.gl/google-maps';
import { IconLayer, PathLayer } from '@deck.gl/layers';

// Set your Google Maps API key here or via environment variable
const GOOGLE_MAPS_API_KEY = process.env.GoogleMapsAPIKey; // eslint-disable-line
const GOOGLE_MAPS_API_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry&v=3.39`;

function loadScript(url) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  const head = document.querySelector('head');
  head.appendChild(script);
  return new Promise(resolve => {
    script.onload = resolve;
  });
}

loadScript(GOOGLE_MAPS_API_URL).then(() => {
  const map = new google.maps.Map(document.getElementById('map'), {
    mapTypeId:'hybrid',
    center: {lat: -12.908583, lng: -45.778699},
    zoom: 16
  });

  // const rawData = require('./track-m.json');
  const rawData = require('./tracks-l.json');
  const rawDataSegments = rawData instanceof Array ? rawData.flatMap((ovr) => ovr.segments) : rawData.segments;
  const paths = rawDataSegments.map(segment => {
    let path = google.maps.geometry.encoding.decodePath(segment.path);
    path = path.map(o => [o.lng(), o.lat()]);
     return {
       path,
     };
  });

  // fit the map to all tracks
  const coords = paths.flatMap(p => p.path).flatMap(p => ({ lat: p[1], lng: p[0] }));
  console.log('%s points loaded', coords.length);
  const bounds = coords.reduce((bounds, c) => {
    bounds.extend(c);
    return bounds;
  }, new google.maps.LatLngBounds());
  map.fitBounds(bounds);

  const markers = [];
  rawDataSegments.forEach(segment => {
    segment.markers.forEach(marker => {
      markers.push({
        coordinates: [ marker.position.lng, marker.position.lat ],
        direction: marker.direction,
        color: marker.color
      });
    });
  });

  const ICON_MAPPING = {
    marker: {x: 0, y: 0, width: 24, height: 24, mask: true}
  };

  const pathLayer = new PathLayer({
    id: 'path-layer',
    data: paths,
    pickable: true,
    widthScale: 1,
    widthMinPixels: 2,
    getPath: d => d.path,
    getColor: d => [0, 0, 255],
    getWidth: d => 5
  });

  const iconLayer = new IconLayer({
    id: 'icon-layer',
    data: markers,
    pickable: true,
    iconAtlas: '/sprite.png',
    iconMapping: ICON_MAPPING,
    getIcon: d => 'marker',

    sizeScale: 1,
    getPosition: d => d.coordinates,
    getSize: d => 24,
    getColor: d => {
      switch (d.color) {
        case 'red':
          return [255, 0, 0];
        case 'green':
          return [0, 128, 0];
        case 'yellow':
        default:
          return [255, 255, 0];
      }
    },
    getAngle: d => Number.isFinite(d.direction) ? d.direction : 0
  });

  const overlay = new DeckOverlay({
    layers: [
      pathLayer,
      iconLayer,
    ]
  });

  overlay.setMap(map);
});
