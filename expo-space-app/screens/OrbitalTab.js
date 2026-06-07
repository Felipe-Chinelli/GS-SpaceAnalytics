import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import styles from '../styles';

export default function OrbitalTab({ telemetry = {}, thresholds = {} }) {
  const lat = typeof telemetry.latitude === 'number' ? telemetry.latitude : -15.79;
  const lon = typeof telemetry.longitude === 'number' ? telemetry.longitude : -47.88;
  const velocity = typeof telemetry.velocity === 'number' ? telemetry.velocity : 27584;
  const altitude = typeof telemetry.altitude === 'number' ? telemetry.altitude : 408.5;
  const attitudeError = typeof telemetry.attitudeError === 'number' ? telemetry.attitudeError : 0.08;
  const attitudeMax = typeof thresholds.attitudeMax === 'number' ? thresholds.attitudeMax : 0.12;

  const cx = (telemetry.timestamp || 0) % 100;
  const cy = 25 + Math.sin((telemetry.timestamp || 0) / 10) * 15;

  return (
    <View style={styles.block}>
      <View style={styles.gridContainer}>
        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>ALTITUDE ORBITAL</Text>
          <Text style={[styles.valText, { color: '#0ea5e9' }]}>{altitude.toFixed(1)} km</Text>
          <Text style={styles.subCardText}>Perigeu e Apogeu balanceados</Text>
        </View>

        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>VELOCIDADE LINEAR</Text>
          <Text style={[styles.valText, { color: '#22d3ee' }]}>{velocity} km/h</Text>
          <Text style={styles.subCardText}>Média: 7.66 km/s</Text>
        </View>

        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>PERIOD ORBITAL</Text>
          <Text style={[styles.valText, { color: '#38bdf8' }]}>92.4 min</Text>
          <Text style={styles.subCardText}>Tempo de revolução total</Text>
        </View>

        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>INCLINAÇÃO RADIAL</Text>
          <Text style={[styles.valText, { color: '#a78bfa' }]}>51.6°</Text>
          <Text style={styles.subCardText}>Inclination angular plano</Text>
        </View>
      </View>

      {/* Ground Track — Real-Time Flight Path */}
      <View style={styles.panelWide}>
        <View style={styles.cardHeaderFlex}>
          <Text style={styles.wideCardTitle}>Ground Track — Real-Time Flight Path</Text>
          <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
            <Text style={{ color: '#10b981', fontSize: 8, fontWeight: 'bold', fontFamily: 'monospace' }}>ZOOM: 1.0x</Text>
          </View>
        </View>

        <View style={{ height: 160, width: '100%', backgroundColor: '#050812', borderRadius: 8, overflow: 'hidden', position: 'relative', marginTop: 8, borderWidth: 1, borderColor: '#141a30' }}>
          <Svg height="100%" width="100%" viewBox="0 0 100 50">
            {/* Sine wave path representation */}
            <Path d="M 0 25 Q 25 5, 50 25 T 100 25" fill="none" stroke="#22d3ee" strokeWidth="0.8" strokeDasharray="2,2" />
            {/* Glowing sat indicator */}
            <Circle cx={cx} cy={cy} r="3" fill="#10b981" opacity={0.6} />
            <Circle cx={cx} cy={cy} r="1.5" fill="#10b981" />
          </Svg>
          
          <View style={{ position: 'absolute', bottom: 8, left: 8 }}>
            <Text style={{ color: '#cbd5e1', fontSize: 9, fontFamily: 'monospace' }}>
              Lat: {lat.toFixed(2)}°N, Lon: {lon.toFixed(2)}°E
            </Text>
          </View>

          <View style={{ position: 'absolute', top: 8, right: 8 }}>
            <Text style={{ color: '#64748b', fontSize: 8, fontFamily: 'monospace', textTransform: 'uppercase' }}>
              Vel: {(velocity / 3.6).toFixed(1)} m/s
            </Text>
          </View>
        </View>
      </View>

      {/* Space weather position */}
      <View style={styles.panelWide}>
        <Text style={styles.wideCardTitle}>INDICADOR DE VISIBILIDADE HELIOMÉTRICA</Text>
        <View style={[styles.eclipseBox, { backgroundColor: telemetry.isEclipse ? '#1e1b4b' : '#3c2a01' }]}>
          <Text style={[styles.eclipseHeader, { color: telemetry.isEclipse ? '#818cf8' : '#f59e0b' }]}>
            {telemetry.isEclipse ? 'TERRITORIAL ECLIPSE (SOMBRA)' : 'ILUMINAÇÃO SOLAR PLENA'}
          </Text>
          <Text style={styles.eclipseBody}>
            {telemetry.isEclipse 
              ? 'Satélite orbitando em eclipse solar terrestre. Painéis fotovoltaicos com rendimento zerado sob subsistema secundário.'
              : 'Geração eletromagnética em pleno aproveitamento termo-bateria. Sensores primários nominalmente calibrados.'
            }
          </Text>
        </View>
      </View>

      {/* Attitude Coordinate alignment error list */}
      <View style={styles.panelWide}>
        <Text style={styles.wideCardTitle}>DIRECIONAMENTO ACS GIROSCÓPIO CONTROL</Text>
        <Text style={styles.sectionSubText}>Valores de rotação e conservação de momento angular angular residual.</Text>
        
        <View style={styles.geoColumns}>
          <View style={styles.geoCell}>
             <Text style={styles.geoLabel}>ERRO ATITUDE</Text>
             <Text style={[styles.geoVal, { color: attitudeError > attitudeMax ? '#ef4444' : '#a5b4fc' }]}>
              {attitudeError.toFixed(3)}°
            </Text>
          </View>
          <View style={styles.geoCell}>
            <Text style={styles.geoLabel}>ACS LIMIT</Text>
            <Text style={styles.geoVal}>{attitudeMax}°</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
