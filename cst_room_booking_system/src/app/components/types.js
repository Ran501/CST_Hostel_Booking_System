// src/app/components/types.js
// This file serves as documentation for the data structures used in the application
// JavaScript doesn't have type interfaces, so these are provided as comments for reference

/**
 * @typedef {Object} Hostel
 * @property {string} id
 * @property {string} name
 * @property {number} lng
 * @property {number} lat
 * @property {string[]} [images]
 */

/**
 * @typedef {Object} HostelInfo
 * @property {string} id
 * @property {string} name
 * @property {number} lng
 * @property {number} lat
 * @property {string[]} [images]
 * @property {string} college
 * @property {number} [totalRooms]
 * @property {number} [occupiedRooms]
 * @property {number} [availableRooms]
 * @property {boolean} [isActive]
 * @property {string} [description]
 * @property {number} [totalFloors]
 * @property {number} [capacity]
 * @property {number} [roomCount]
 */

/**
 * @typedef {Object} StatsData
 * @property {number} totalAvailableRooms
 * @property {string} bookedRoom
 * @property {number} occupancyRate
 * @property {boolean} loading
 */

/**
 * @typedef {Object} MapSettings
 * @property {{lng: number, lat: number}} center
 * @property {number} zoom
 */

/**
 * @typedef {Object} DeviceMapSettings
 * @property {MapSettings} mobile
 * @property {MapSettings} tablet
 * @property {MapSettings} desktop
 */

/**
 * @typedef {Object.<string, maplibregl.Marker>} MarkerRefs
 */