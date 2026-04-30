// src/app/components/config/map-styles.js
export const MAP_STYLE = {
  version: 8,
  sources: {
    'campus': {
      type: 'geojson',
      data: '/assets/maps/export.geojson' 
    }
  },
  layers: [
    // Base background
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#f2efe9'
      }
    },
    // University area
    {
      id: 'university-area',
      type: 'fill',
      source: 'campus',
      filter: ['==', ['get', 'amenity'], 'university'],
      paint: {
        'fill-color': '#d4e4dd',
        'fill-opacity': 0.4
      }
    },
    // Parks and leisure
    {
      id: 'park',
      type: 'fill',
      source: 'campus',
      filter: ['==', ['get', 'leisure'], 'park'],
      paint: {
        'fill-color': '#c8facc',
        'fill-opacity': 0.8
      }
    },
    // Sports pitches
    {
      id: 'pitch',
      type: 'fill',
      source: 'campus',
      filter: ['==', ['get', 'leisure'], 'pitch'],
      paint: {
        'fill-color': '#8ee589',
        'fill-opacity': 0.7
      }
    },

    {
      id: 'pitch-label',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'leisure'], 'pitch'],
      layout: {
        'text-field': 'FOOTBALL GROUND',
        'text-font': ['Open Sans Bold'],
        'text-size': 9,
        'text-letter-spacing': 0.15,
        'text-transform': 'uppercase',
        'text-offset': [0, 0],
        'text-anchor': 'center',
        'text-max-width': 8
      },
      paint: {
        'text-color': '#2d5a27',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2,
        'text-halo-blur': 1,
        'text-opacity': 0.9
      }
    },

    // Helipad
    {
      id: 'helipad',
      type: 'fill',
      source: 'campus',
      filter: ['==', ['get', 'aeroway'], 'helipad'],
      paint: {
        'fill-color': '#d2d2d2',
        'fill-opacity': 0.8
      }
    },

    {
      id: 'helipad-label',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'aeroway'], 'helipad'],
      layout: {
        'text-field': 'HELIPAD',
        'text-font': ['Open Sans Bold'],
        'text-size': 10,
        'text-letter-spacing': 0.2,
        'text-transform': 'uppercase',
        'text-offset': [0, 0],
        'text-anchor': 'center'
      },
      paint: {
        'text-color': '#333333',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2,
        'text-halo-blur': 1,
        'text-opacity': 0.9
      }
    },

    // Buildings fill
    {
      id: 'buildings',
      type: 'fill',
      source: 'campus',
      filter: ['==', ['get', 'building'], 'yes'],
      paint: {
        'fill-color': '#d9d0c9',
        'fill-opacity': 0.9
      }
    },
    // Residential buildings
    {
      id: 'buildings-residential',
      type: 'fill',
      source: 'campus',
      filter: ['==', ['get', 'building'], 'residential'],
      paint: {
        'fill-color': '#d9d0c9',
        'fill-opacity': 0.9
      }
    },
    // Building outlines
    {
      id: 'buildings-outline',
      type: 'line',
      source: 'campus',
      filter: ['has', 'building'],
      paint: {
        'line-color': '#bfb8b1',
        'line-width': 0.5
      }
    },
    // Primary roads casing
    {
      id: 'road-primary-case',
      type: 'line',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'primary'],
      paint: {
        'line-color': '#e8a973',
        'line-width': 9
      }
    },
    // Primary roads
    {
      id: 'road-primary',
      type: 'line',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'primary'],
      paint: {
        'line-color': '#fcd6a4',
        'line-width': 7
      }
    },
    // Residential roads casing
    {
      id: 'road-residential-case',
      type: 'line',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'residential'],
      paint: {
        'line-color': '#d4d4d4',
        'line-width': 6
      }
    },
    // Residential roads
    {
      id: 'road-residential',
      type: 'line',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'residential'],
      paint: {
        'line-color': '#ffffff',
        'line-width': 4.5
      }
    },
    // Service roads casing
    {
      id: 'road-service-case',
      type: 'line',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'service'],
      paint: {
        'line-color': '#d4d4d4',
        'line-width': 4
      }
    },

     {
      id: 'road-residential-label',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'residential'],
      layout: {
        'symbol-placement': 'line',
        'text-field': 'ROAD',
        'text-font': ['Open Sans Bold'],
        'text-size': 9,
        'text-letter-spacing': 0.1,
        'text-transform': 'uppercase',
        'text-rotation-alignment': 'map',
        'text-pitch-alignment': 'viewport'
      },
      paint: {
        'text-color': '#666666',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1,
        'text-halo-blur': 0.5,
        'text-opacity': 0.6
      }
    },
    
    // Service roads
    {
      id: 'road-service',
      type: 'line',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'service'],
      paint: {
        'line-color': '#ffffff',
        'line-width': 3
      }
    },
      
      {
      id: 'road-service-label',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'service'],
      layout: {
        'symbol-placement': 'line',
        'text-field': 'ROAD',
        'text-font': ['Open Sans Bold'],
        'text-size': 8,
        'text-letter-spacing': 0.1,
        'text-transform': 'uppercase',
        'text-rotation-alignment': 'map',
        'text-pitch-alignment': 'viewport'
      },
      paint: {
        'text-color': '#777777',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1,
        'text-halo-blur': 0.5,
        'text-opacity': 0.5
      }
    },

    // Footpaths
    {
      id: 'path-footway',
      type: 'line',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'footway'],
      paint: {
        'line-color': '#fa8072',
        'line-width': 1.5,
        'line-dasharray': [3, 3]
      }
    },

    {
      id: 'path-footway-label',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'footway'],
      layout: {
        'symbol-placement': 'line',
        'text-field': 'FOOTPATH',
        'text-font': ['Open Sans Bold'],
        'text-size': 9,
        'text-letter-spacing': 0.1,
        'text-transform': 'uppercase',
        'text-rotation-alignment': 'map',
        'text-pitch-alignment': 'viewport'
      },
      paint: {
        'text-color': '#8B4513',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5,
        'text-halo-blur': 0.5,
        'text-opacity': 0.8
      }
    },

    // Building labels
    {
      id: 'building-labels',
      type: 'symbol',
      source: 'campus',
      filter: ['all', ['has', 'building'], ['has', 'name']],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Open Sans Regular'],
        'text-size': 10,
        'text-max-width': 10
      },
      paint: {
        'text-color': '#666666',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5
      }
    }
  ]
};