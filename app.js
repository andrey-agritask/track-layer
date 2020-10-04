/* global document, google */
import {GoogleMapsOverlay as DeckOverlay} from '@deck.gl/google-maps';
import {GeoJsonLayer, ArcLayer, LineLayer, PathLayer} from '@deck.gl/layers';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

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
    center: {lat: 51.47, lng: 0.45},
    zoom: 5
  });

  const rawData = require('./track-m.json');
  const rawDataSegments = rawData.segments;
  const data = rawDataSegments.map(segment => {
    let path = google.maps.geometry.encoding.decodePath(segment.path);
    path = path.map(o => [o.lng(), o.lat()]);
     return {
       path,
       color: [255, 0, 0],
     };
  });

  const layer = new PathLayer({
    id: 'path-layer',
    data,
    pickable: true,
    widthScale: 20,
    widthMinPixels: 20,
    getPath: d => d.path,
    getColor: d => d.color,
    getWidth: d => 20
  });

  const overlay = new DeckOverlay({
    layers: [
      layer
    ]
  });

  overlay.setMap(map);
});
