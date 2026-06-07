import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Polyline, Circle } from 'react-native-svg';
import styles from '../styles';

export default function EnergyTab({ telemetry }) {
  return (
    <View style={styles.block}>
      {/* Quadrant data review */}
      <View style={styles.gridContainer}>
        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>SOLAR INPUT</Text>
          <Text style={[styles.valText, { color: '#fbbf24' }]}>{telemetry.solarInput} W</Text>
          <Text style={styles.subCardText}>Geração Ativa</Text>
        </View>

        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>CAPACITY BASE</Text>
          <Text style={[styles.valText, { color: '#10b981' }]}>{telemetry.battery}%</Text>
          <Text style={styles.subCardText}>Carga Onboard</Text>
        </View>

        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>SYSTEM PRESET DRAW</Text>
          <Text style={[styles.valText, { color: '#f87171' }]}>620 W</Text>
          <Text style={styles.subCardText}>Consumo do Barramento</Text>
        </View>

        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>POWER BALANCE</Text>
          <Text style={[styles.valText, { color: (telemetry.solarInput - 620) >= 0 ? '#34d399' : '#f87171' }]}>
            {(telemetry.solarInput - 620) >= 0 ? `+${telemetry.solarInput - 620}` : telemetry.solarInput - 620} W
          </Text>
          <Text style={styles.subCardText}>Disponibilidade líquida</Text>
        </View>
      </View>

      {/* ENERGY CRITICAL TIMELINE — 2 HOURS */}
      <View style={styles.panelWide}>
        <Text style={styles.wideCardTitle}>ENERGY CRITICAL TIMELINE — 2 HOURS</Text>

        <View style={{ flexDirection: 'row', gap: 12, marginVertical: 4 }}>
          <View style={styles.flexRowItems}>
            <View style={{ width: 10, height: 3, backgroundColor: '#eab308' }} />
            <Text style={{ color: '#eab308', fontSize: 10, fontFamily: 'monospace' }}>Solar Output Wave</Text>
          </View>
          <View style={styles.flexRowItems}>
            <View style={{ width: 10, height: 3, backgroundColor: '#ef4444' }} />
            <Text style={{ color: '#ef4444', fontSize: 10, fontFamily: 'monospace' }}>Spacecraft Base Draw</Text>
          </View>
        </View>

        <View style={{ height: 120, width: '100%', marginTop: 8 }}>
          <Svg height="100%" width="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
            <Polyline 
              fill="none" 
              stroke="#eab308" 
              strokeWidth="1.5"
              points="0,15 15,25 30,12 45,28 60,14 75,22 90,12 100,18" 
            />
            <Polyline 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="1.2"
              points="0,35 20,32 40,38 60,34 80,33 100,36" 
            />
            {/* Solar area shade */}
            <Path d="M 0 50 L 0 15 L 15 25 L 30 12 L 45 28 L 60 14 L 75 22 L 90 12 L 100 18 L 100 50 Z" fill="rgba(245, 179, 8, 0.02)" />
          </Svg>
        </View>
      </View>

      {/* SYSTEM POWER DRAW (DISTRIBUTION) */}
      <View style={styles.panelWide}>
        <Text style={styles.wideCardTitle}>SYSTEM POWER DRAW (DISTRIBUTION)</Text>
        
        <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 12 }}>
          <View style={{ width: 144, height: 144, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Svg width="100%" height="100%" viewBox="0 0 42 42" style={{ transform: [{ rotate: '-90deg' }] }}>
              {/* Base circle background */}
              <Circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#1c2132" strokeWidth="4" />
              {/* Avionics payload (30%) */}
              <Circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4.2" strokeDasharray="30 100" strokeDashoffset="0" />
              {/* Radio Beacons (25%) */}
              <Circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#22d3ee" strokeWidth="4.2" strokeDasharray="25 100" strokeDashoffset="-30" />
              {/* ACS Gyroscopes (25%) */}
              <Circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#818cf8" strokeWidth="4.2" strokeDasharray="25 100" strokeDashoffset="-55" />
              {/* Thermal Heaters (20%) */}
              <Circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#ef4444" strokeWidth="4.2" strokeDasharray="20 100" strokeDashoffset="-80" />
            </Svg>
            <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 18, color: '#ffffff', fontWeight: 'bold', fontFamily: 'monospace' }}>620</Text>
              <Text style={{ fontSize: 8, color: '#64748b', textTransform: 'uppercase', fontFamily: 'monospace' }}>W DRAW</Text>
            </View>
          </View>
        </View>

        <View style={{ gap: 6, marginTop: 4 }}>
          <View style={styles.flexRowSpace}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#10b981' }} />
              <Text style={{ color: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}>Avionics payload</Text>
            </View>
            <Text style={{ color: '#cbd5e1', fontSize: 10, fontFamily: 'monospace' }}>30% (186W)</Text>
          </View>
          <View style={styles.flexRowSpace}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#22d3ee' }} />
              <Text style={{ color: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}>Radio Beacons</Text>
            </View>
            <Text style={{ color: '#cbd5e1', fontSize: 10, fontFamily: 'monospace' }}>25% (155W)</Text>
          </View>
          <View style={styles.flexRowSpace}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#818cf8' }} />
              <Text style={{ color: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}>ACS Gyroscopes</Text>
            </View>
            <Text style={{ color: '#cbd5e1', fontSize: 10, fontFamily: 'monospace' }}>25% (155W)</Text>
          </View>
          <View style={styles.flexRowSpace}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#ef4444' }} />
              <Text style={{ color: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}>Thermal Heaters</Text>
            </View>
            <Text style={{ color: '#cbd5e1', fontSize: 10, fontFamily: 'monospace' }}>20% (124W)</Text>
          </View>
        </View>
      </View>

      {/* Individual Arrays outputs */}
      <View style={styles.panelWide}>
        <Text style={styles.wideCardTitle}>PAINÉIS SOLARES INDIVIDUAIS (CAPTAÇÃO)</Text>

        <View style={styles.progressRow}>
          <View style={styles.flexRowSpace}>
            <Text style={styles.progressLabel}>SA-ALPHA (Eixo Leste)</Text>
            <Text style={styles.progressVal}>95% (204 W)</Text>
          </View>
          <View style={styles.barOuter}>
            <View style={[styles.barInner, { width: '95%', backgroundColor: '#eab308' }]} />
          </View>
        </View>

        <View style={styles.progressRow}>
          <View style={styles.flexRowSpace}>
            <Text style={styles.progressLabel}>SA-BETA (Eixo Oeste)</Text>
            <Text style={styles.progressVal}>75% (161 W)</Text>
          </View>
          <View style={styles.barOuter}>
            <View style={[styles.barInner, { width: '75%', backgroundColor: '#eab308' }]} />
          </View>
        </View>

        <View style={styles.progressRow}>
          <View style={styles.flexRowSpace}>
            <Text style={styles.progressLabel}>SA-GAMMA (Eixo Zenith)</Text>
            <Text style={styles.progressVal}>93% (200 W)</Text>
          </View>
          <View style={styles.barOuter}>
            <View style={[styles.barInner, { width: '93%', backgroundColor: '#eab308' }]} />
          </View>
        </View>

        <View style={styles.progressRow}>
          <View style={styles.flexRowSpace}>
            <Text style={styles.progressLabel}>SA-DELTA (Eixo Nadir)</Text>
            <Text style={styles.progressVal}>77% (166 W)</Text>
          </View>
          <View style={styles.barOuter}>
            <View style={[styles.barInner, { width: '77%', backgroundColor: '#eab308' }]} />
          </View>
        </View>
      </View>
    </View>
  );
}
