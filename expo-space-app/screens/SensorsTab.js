import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Polyline, Defs, LinearGradient, Stop } from 'react-native-svg';
import styles from '../styles';

export default function SensorsTab({ telemetry, thresholds }) {
  // Generate beautiful real-time temperature graph coordinates
  const t0 = telemetry.temperature;
  const t1 = t0 - 0.5 + Math.sin(Date.now() / 5000) * 0.2;
  const t2 = t0 + 0.3 + Math.sin(Date.now() / 6000) * 0.4;
  const t3 = t0 - 0.8 + Math.sin(Date.now() / 7000) * 0.3;
  const t4 = t0 + 0.2 + Math.sin(Date.now() / 8000) * 0.5;
  const t5 = t0 - 0.4 + Math.sin(Date.now() / 9000) * 0.2;
  const t6 = t0 + 0.1 + Math.sin(Date.now() / 10000) * 0.3;
  
  const valsTemp = [t6, t5, t4, t3, t2, t1, t0];
  const minT = 20;
  const maxT = 45;
  const ptsTemp = valsTemp.map((v, i) => `${i * 16.6},${35 - ((v - minT) / (maxT - minT)) * 25}`).join(' ');
  const pathTempFill = `M 0 40 L ` + valsTemp.map((v, i) => `${i * 16.6} ${35 - ((v - minT) / (maxT - minT)) * 25}`).join(' L ') + ` L 100 40 Z`;

  // Generate beautiful real-time radiation dosimetry coordinates
  const radBase = [32, 36, 22, 34, 38, 25, 29, 24];
  const radFluctuations = radBase.map((val, idx) => {
    const drift = Math.sin(Date.now() / 3000 + idx) * 2;
    return Math.max(10, Math.min(45, val + drift));
  });
  const ptsRad = radFluctuations.map((v, i) => `${(i * 100) / 7.0},${v}`).join(' ');
  const pathRadFill = `M 0 40 L ` + radFluctuations.map((v, i) => `${(i * 100) / 7.0} ${v}`).join(' L ') + ` L 100 40 Z`;

  return (
    <View style={styles.block}>
      <View style={styles.panelWide}>
        <Text style={styles.sectionHeaderTitle}>SENSORES EM TEMPO REAL — LIVE ARRAY</Text>
        <Text style={styles.sectionSubText}>Leitura das unidades de medição estocásticas e termostatos onboard.</Text>
 
        {/* Grid detail */}
        <View style={styles.listContainer}>
          <View style={styles.tableRowHeader}>
            <Text style={styles.colHeader}>ID</Text>
            <Text style={[styles.colHeader, { flex: 2 }]}>SISTEMA</Text>
            <Text style={styles.colHeader}>VALOR</Text>
            <Text style={styles.colHeader}>UNID</Text>
          </View>
 
          <View style={styles.tableRow}>
            <Text style={styles.tableColId}>TH-01</Text>
            <Text style={[styles.tableColSys, { flex: 2 }]}>Temp Avionics</Text>
            <Text style={[styles.tableColVal, { color: telemetry.temperature > thresholds.temperatureMax ? '#f87171' : '#10b981' }]}>
              {telemetry.temperature.toFixed(1)}
            </Text>
            <Text style={styles.tableColUnit}>°C</Text>
          </View>
 
          <View style={styles.tableRow}>
            <Text style={styles.tableColId}>TH-02</Text>
            <Text style={[styles.tableColSys, { flex: 2 }]}>Temp Battery Pack</Text>
            <Text style={styles.tableColVal}>{(telemetry.temperature - 1.5).toFixed(1)}</Text>
            <Text style={styles.tableColUnit}>°C</Text>
          </View>
 
          <View style={styles.tableRow}>
            <Text style={styles.tableColId}>TH-03</Text>
            <Text style={[styles.tableColSys, { flex: 2 }]}>Temp Payload Chamber</Text>
            <Text style={styles.tableColVal}>{(telemetry.temperature - 4.1).toFixed(1)}</Text>
            <Text style={styles.tableColUnit}>°C</Text>
          </View>
 
          <View style={styles.tableRow}>
            <Text style={styles.tableColId}>PR-01</Text>
            <Text style={[styles.tableColSys, { flex: 2 }]}>Chamber Pressure</Text>
            <Text style={styles.tableColVal}>101.5</Text>
            <Text style={styles.tableColUnit}>kPa</Text>
          </View>
 
          <View style={styles.tableRow}>
            <Text style={styles.tableColId}>RD-01</Text>
            <Text style={[styles.tableColSys, { flex: 2 }]}>External Dosimeter</Text>
            <Text style={[styles.tableColVal, { color: '#eab308' }]}>178.4</Text>
            <Text style={styles.tableColUnit}>μSv/h</Text>
          </View>
 
          <View style={styles.tableRow}>
            <Text style={styles.tableColId}>VB-01</Text>
            <Text style={[styles.tableColSys, { flex: 2 }]}>Micro-Vibration Sensor</Text>
            <Text style={[styles.tableColVal, { color: '#818cf8' }]}>{telemetry.vibration.toFixed(3)}</Text>
            <Text style={styles.tableColUnit}>g</Text>
          </View>
        </View>
      </View>
 
      {/* Core Thermal Gauge info card */}
      <View style={styles.panelWide}>
        <Text style={styles.wideCardTitle}>DIFERENCIAL TÉRMICO CRÍTICO (TH-01)</Text>
        <Text style={[styles.largeValue, { color: telemetry.temperature > thresholds.temperatureMax ? '#f87171' : '#22d3ee' }]}>
          {telemetry.temperature}°C
        </Text>
        <View style={styles.barOuter}>
          <View
            style={[
              styles.barInner,
              {
                width: `${Math.min(100, (telemetry.temperature / 60) * 100)}%`,
                backgroundColor: telemetry.temperature > thresholds.temperatureMax ? '#f87171' : '#22d3ee'
              }
            ]}
          />
        </View>
        <Text style={styles.subCardText}>Margem operacional segura: 10°C até {thresholds.temperatureMax}°C</Text>
      </View>

      {/* Temperature and Radiation charts side-by-side or stacked container */}
      <View style={{ gap: 16 }}>
        {/* Chart 1: TEMPERATURE HISTORY */}
        <View style={styles.panelWide}>
          <View style={styles.cardHeaderFlex}>
            <Text style={styles.wideCardTitle}>TEMPERATURE HISTORY — 60s (°C)</Text>
            <Text style={{ fontSize: 9, color: '#475569', fontFamily: 'monospace' }}>Current: {telemetry.temperature}°C</Text>
          </View>
          <View style={{ height: 100, width: '100%', marginTop: 6 }}>
            <Svg height="100%" width="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
              <Defs>
                <LinearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                  <Stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Polyline
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1.5"
                points={ptsTemp}
              />
              <Path
                d={pathTempFill}
                fill="url(#blueGlow)"
              />
            </Svg>
          </View>
        </View>

        {/* Chart 2: RADIATION DOSIMETRY HISTORY */}
        <View style={styles.panelWide}>
          <View style={styles.cardHeaderFlex}>
            <Text style={styles.wideCardTitle}>RADIATION DOSIMETRY HISTORY (μSv/h)</Text>
            <Text style={{ fontSize: 9, color: '#475569', fontFamily: 'monospace' }}>Current: 178 μSv/h</Text>
          </View>
          <View style={{ height: 100, width: '100%', marginTop: 6 }}>
            <Svg height="100%" width="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
              <Defs>
                <LinearGradient id="orangeGlow" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                  <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                points={ptsRad}
              />
              <Path
                d={pathRadFill}
                fill="url(#orangeGlow)"
              />
            </Svg>
          </View>
        </View>
      </View>
    </View>
  );
}
