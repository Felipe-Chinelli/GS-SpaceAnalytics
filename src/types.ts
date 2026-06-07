/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Core Telemetry Definition for the Spacecraft
export interface Telemetry {
  temperature: number;      // °C
  battery: number;          // %
  solarInput: number;       // W
  signalStrength: number;   // %
  attitudeError: number;    // ° degrees deviation
  altitude: number;         // km
  velocity: number;         // km/h
  isEclipse: boolean;       // whether spacecraft is in Earth's shadow
  latitude: number;         // orbital coordinates
  longitude: number;        // orbital coordinates
  vibration: number;        // orbital micro-vibration (g)
  timestamp: number;        // epoch
}

// User-configurable Alarm Thresholds
export interface AlertThresholds {
  temperatureMax: number;   // °C (threshold for thermal alarm)
  batteryMin: number;       // % (threshold for critical energy alarm)
  signalMin: number;        // % (threshold for signal degradation)
  attitudeMax: number;      // ° (threshold for alignment error)
}

// Incident / Active Warning definition
export interface Alert {
  id: string;
  system: 'Thermal' | 'Power' | 'Communication' | 'Orbital';
  severity: 'CRITICAL' | 'WARNING' | 'NOMINAL';
  message: string;
  timestamp: string;
  active: boolean;
}

// Mission configuration inputs
export interface MissionConfig {
  missionName: string;
  commandCenter: string;
  satelliteModel: string;
  launchDate: string;
  targetOrbit: 'LEO' | 'MEO' | 'GEO' | 'HEO';
  predictionInterval: number; // minutes
}

// Mission History record for local persistence mock
export interface HistoryRecord {
  id: string;
  timestamp: string;
  event: string;
  summary: string;
  type: 'INFO' | 'ALERT' | 'DIAGNOSTIC' | 'ORBITAL_MANEUVER';
}
