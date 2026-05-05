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
    // ============ BACKGROUND ============
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#e8ecf1'
      }
    },

    // ============ LAND USE ============
    // University area
    {
      id: 'university-area',
      type: 'fill',
      source: 'campus',
      filter: ['==', ['get', 'amenity'], 'university'],
      paint: {
        'fill-color': '#e2e6ea',
        'fill-opacity': 0.5,
        'fill-outline-color': '#cbd3da'
      }
    },

    // Parks and green spaces
    {
      id: 'park',
      type: 'fill',
      source: 'campus',
      filter: ['==', ['get', 'leisure'], 'park'],
      paint: {
        'fill-color': '#a8e6a0',
        'fill-opacity': 0.6,
        'fill-outline-color': '#6fbf4c'
      }
    },

    // Park label
    {
      id: 'park-label',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'leisure'], 'park'],
      layout: {
        'text-field': '🌳 Park',
        'text-font': ['Open Sans Semibold'],
        'text-size': 10,
        'text-offset': [0, -1],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#2d5a27',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5
      }
    },

    // ============ SPORTS FACILITIES ============
    // Sports pitches
    {
      id: 'pitch',
      type: 'fill',
      source: 'campus',
      filter: ['==', ['get', 'leisure'], 'pitch'],
      paint: {
        'fill-color': '#5cb85c',
        'fill-opacity': 0.7,
        'fill-outline-color': '#3d8b3d'
      }
    },
    // Pitch stripes (decorative)
    {
      id: 'pitch-stripes',
      type: 'fill',
      source: 'campus',
      filter: ['==', ['get', 'leisure'], 'pitch'],
      paint: {
        'fill-pattern': 'stripe',
        'fill-opacity': 0.3
      }
    },
    {
      id: 'pitch-label',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'leisure'], 'pitch'],
      layout: {
        'text-field': '⚽ {name}',
        'text-font': ['Open Sans Bold'],
        'text-size': 11,
        'text-offset': [0, -1.5],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#2d5a27',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5
      }
    },

    // ============ HELIPAD ============
    {
      id: 'helipad',
      type: 'fill',
      source: 'campus',
      filter: ['==', ['get', 'aeroway'], 'helipad'],
      paint: {
        'fill-color': '#d4c9a8',
        'fill-opacity': 0.8,
        'fill-outline-color': '#b8a97c'
      }
    },
    // Helipad H marking
    {
      id: 'helipad-marking',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'aeroway'], 'helipad'],
      layout: {
        'text-field': 'H',
        'text-font': ['Open Sans Bold'],
        'text-size': 18,
        'text-offset': [0, 0],
        'text-anchor': 'center'
      },
      paint: {
        'text-color': '#8b7355',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    },
    {
      id: 'helipad-label',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'aeroway'], 'helipad'],
      layout: {
        'text-field': '🚁 HELIPAD',
        'text-font': ['Open Sans Bold'],
        'text-size': 9,
        'text-offset': [0, -1.2],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#8b7355',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5
      }
    },

    // ============ BUILDINGS ============
    // Building shadow (3D effect)
    {
      id: 'buildings-shadow',
      type: 'fill',
      source: 'campus',
      filter: ['has', 'building'],
      paint: {
        'fill-color': '#000000',
        'fill-opacity': 0.08,
        'fill-translate': [2, 2]
      }
    },
    // All buildings
    {
      id: 'buildings',
      type: 'fill',
      source: 'campus',
      filter: ['==', ['get', 'building'], 'yes'],
      paint: {
        'fill-color': '#f5f5f0',
        'fill-opacity': 0.95,
        'fill-outline-color': '#d4cfc4'
      }
    },
    // Residential buildings (darker)
    {
      id: 'buildings-residential',
      type: 'fill',
      source: 'campus',
      filter: ['==', ['get', 'building'], 'residential'],
      paint: {
        'fill-color': '#e8e4d8',
        'fill-opacity': 0.95,
        'fill-outline-color': '#cdc7b8'
      }
    },
    // Hostel buildings (highlight with warm color)
    {
      id: 'buildings-hostels',
      type: 'fill',
      source: 'campus',
      filter: ['in', ['get', 'name'], ['literal', ['RK Hostel', 'NK Hostel', 'Hostel F', 'Block AB', 'Block CD', 'Block C']]],
      paint: {
        'fill-color': '#ffdb99',
        'fill-opacity': 0.85,
        'fill-outline-color': '#e6b85c'
      }
    },
    // Important buildings (Library, Infirmary, etc.)
    {
      id: 'buildings-important',
      type: 'fill',
      source: 'campus',
      filter: ['in', ['get', 'name'], ['literal', ['Library', 'College Infirmary', 'Yangsel Cafeteria', 'Tashi Namgay Grand']]],
      paint: {
        'fill-color': '#ffb366',
        'fill-opacity': 0.85,
        'fill-outline-color': '#e6953e'
      }
    },
    // Building outlines
    {
      id: 'buildings-outline',
      type: 'line',
      source: 'campus',
      filter: ['has', 'building'],
      paint: {
        'line-color': '#bbb5a8',
        'line-width': 0.8,
        'line-opacity': 0.8
      }
    },

    // ============ BUILDING LABELS ============
    {
      id: 'building-labels',
      type: 'symbol',
      source: 'campus',
      filter: ['all', ['has', 'building'], ['has', 'name']],
      layout: {
        'text-field': '🏛️ {name}',
        'text-font': ['Open Sans Semibold'],
        'text-size': 10,
        'text-max-width': 8,
        'text-offset': [0, -0.8],
        'text-anchor': 'top',
        'text-allow-overlap': false
      },
      paint: {
        'text-color': '#5c5243',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5
      }
    },

    // ============ POINTS OF INTEREST ============
    // Restaurant/Cafeteria
    {
      id: 'restaurant-icon',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'amenity'], 'restaurant'],
      layout: {
        'text-field': '🍽️',
        'text-font': ['Open Sans Regular'],
        'text-size': 14,
        'text-offset': [0, 0],
        'text-anchor': 'center'
      }
    },
    {
      id: 'restaurant-label',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'amenity'], 'restaurant'],
      layout: {
        'text-field': '{name}',
        'text-font': ['Open Sans Regular'],
        'text-size': 9,
        'text-offset': [0, 1.2],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#d35400',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.2
      }
    },
    // School
    {
      id: 'school-icon',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'amenity'], 'school'],
      layout: {
        'text-field': '🏫',
        'text-font': ['Open Sans Regular'],
        'text-size': 14,
        'text-offset': [0, 0],
        'text-anchor': 'center'
      }
    },
    {
      id: 'school-label',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'amenity'], 'school'],
      layout: {
        'text-field': '{name}',
        'text-font': ['Open Sans Regular'],
        'text-size': 10,
        'text-offset': [0, 1.2],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#2c3e50',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.2
      }
    },
    // Hospital/Infirmary
    {
      id: 'hospital-icon',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'amenity'], 'hospital'],
      layout: {
        'text-field': '🏥',
        'text-font': ['Open Sans Regular'],
        'text-size': 14,
        'text-offset': [0, 0],
        'text-anchor': 'center'
      }
    },
    {
      id: 'hospital-label',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'amenity'], 'hospital'],
      layout: {
        'text-field': 'Infirmary',
        'text-font': ['Open Sans Regular'],
        'text-size': 9,
        'text-offset': [0, 1.2],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#c0392b',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.2
      }
    },

    // ============ ROADS (Google Maps style) ============
    // Primary roads - casing (highway edge)
    {
      id: 'road-primary-case',
      type: 'line',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'primary'],
      paint: {
        'line-color': '#ccb38c',
        'line-width': 12,
        'line-blur': 0.5
      }
    },
    // Primary roads - fill
    {
      id: 'road-primary',
      type: 'line',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'primary'],
      paint: {
        'line-color': '#ffd89b',
        'line-width': 8
      }
    },
    // Primary road centerline
    {
      id: 'road-primary-center',
      type: 'line',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'primary'],
      paint: {
        'line-color': '#fcd6a4',
        'line-width': 2,
        'line-dasharray': [4, 3],
        'line-opacity': 0.6
      }
    },
    // Primary road label
    {
      id: 'road-primary-label',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'primary'],
      layout: {
        'symbol-placement': 'line',
        'text-field': 'AH-48',
        'text-font': ['Open Sans Bold'],
        'text-size': 9,
        'text-letter-spacing': 0.1,
        'text-rotation-alignment': 'map',
        'text-pitch-alignment': 'viewport'
      },
      paint: {
        'text-color': '#8b6914',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5
      }
    },

    // Residential roads - casing
    {
      id: 'road-residential-case',
      type: 'line',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'residential'],
      paint: {
        'line-color': '#c9c9c9',
        'line-width': 8
      }
    },
    // Residential roads - fill
    {
      id: 'road-residential',
      type: 'line',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'residential'],
      paint: {
        'line-color': '#f0f0f0',
        'line-width': 5.5
      }
    },
    {
      id: 'road-residential-label',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'residential'],
      layout: {
        'symbol-placement': 'line',
        'text-field': 'Local Road',
        'text-font': ['Open Sans Regular'],
        'text-size': 8,
        'text-letter-spacing': 0.1,
        'text-rotation-alignment': 'map',
        'text-pitch-alignment': 'viewport',
        'text-opacity': 0.5
      },
      paint: {
        'text-color': '#888888',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      }
    },

    // Service roads - casing
    {
      id: 'road-service-case',
      type: 'line',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'service'],
      paint: {
        'line-color': '#bdbdbd',
        'line-width': 5.5
      }
    },
    // Service roads - fill
    {
      id: 'road-service',
      type: 'line',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'service'],
      paint: {
        'line-color': '#ffffff',
        'line-width': 3.5
      }
    },
    {
      id: 'road-service-label',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'service'],
      layout: {
        'symbol-placement': 'line',
        'text-field': 'Service Road',
        'text-font': ['Open Sans Regular'],
        'text-size': 7,
        'text-letter-spacing': 0.1,
        'text-rotation-alignment': 'map',
        'text-pitch-alignment': 'viewport',
        'text-opacity': 0.4
      },
      paint: {
        'text-color': '#999999',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      }
    },

    // Footpaths (Google Maps style dashed)
    {
      id: 'path-footway',
      type: 'line',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'footway'],
      paint: {
        'line-color': '#888888',
        'line-width': 2,
        'line-dasharray': [2, 2],
        'line-opacity': 0.7
      }
    },
    {
      id: 'path-footway-label',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'highway'], 'footway'],
      layout: {
        'symbol-placement': 'line',
        'text-field': 'Footpath',
        'text-font': ['Open Sans Regular'],
        'text-size': 7,
        'text-letter-spacing': 0.1,
        'text-rotation-alignment': 'map',
        'text-pitch-alignment': 'viewport',
        'text-opacity': 0.5
      },
      paint: {
        'text-color': '#666666',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      }
    },

    // ============ WATER FEATURES ============
    // (Add if your GeoJSON has water features)
    // {
    //   id: 'water',
    //   type: 'fill',
    //   source: 'campus',
    //   filter: ['==', ['get', 'natural'], 'water'],
    //   paint: {
    //     'fill-color': '#a8d1ff',
    //     'fill-opacity': 0.6
    //   }
    // },

    // ============ NATURAL FEATURES ============
    // Trees/vegetation
    {
      id: 'trees',
      type: 'circle',
      source: 'campus',
      filter: ['==', ['get', 'natural'], 'tree'],
      paint: {
        'circle-radius': 4,
        'circle-color': '#4caf50',
        'circle-opacity': 0.7,
        'circle-stroke-color': '#2e7d32',
        'circle-stroke-width': 0.5
      }
    },

    // ============ GATE/ENTRANCE ============
    {
      id: 'gate-icon',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'barrier'], 'gate'],
      layout: {
        'text-field': '🚪',
        'text-font': ['Open Sans Regular'],
        'text-size': 12,
        'text-offset': [0, 0],
        'text-anchor': 'center'
      }
    },
    {
      id: 'gate-label',
      type: 'symbol',
      source: 'campus',
      filter: ['==', ['get', 'barrier'], 'gate'],
      layout: {
        'text-field': '{name}',
        'text-font': ['Open Sans Regular'],
        'text-size': 9,
        'text-offset': [0, 1],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#555555',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.2
      }
    }
  ]
};