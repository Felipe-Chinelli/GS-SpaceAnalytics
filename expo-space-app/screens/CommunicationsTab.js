import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Polyline, Defs, LinearGradient, Stop } from 'react-native-svg';
import styles from '../styles';

export default function CommunicationsTab({ telemetry, currentLimitDbm, groundStations }) {
  // Map live telemetry signal strength to dynamic SVG coordinate
  const s0 = telemetry.signalStrength;
  const normalizedSigIndex = Math.max(5, Math.min(45, 40 - (s0 + 110) * 0.5));
  const sigPoints = `0,25 10,21 20,29 30,22 40,32 50,15 60,18 70,12 80,18 90,36 100,${normalizedSigIndex}`;
  const sigFill = `M 0 50 L 0 25 L 10 21 L 20 29 L 30 22 L 40 32 L 50 15 L 60 18 L 70 12 L 80 18 L 90 36 L 100 ${normalizedSigIndex} L 100 50 Z`;

  return (
    <View style={styles.block}>
      <View style={styles.gridContainer}>
        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>RF SIGNAL STRENGTH</Text>
          <Text style={[styles.valText, { color: telemetry.signalStrength < currentLimitDbm ? '#ef4444' : '#10b981' }]}>
            {telemetry.signalStrength} dBm
          </Text>
          <Text style={styles.subCardText}>Segurança: &gt; {currentLimitDbm}dBm</Text>
        </View>

        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>ENLACE LATENCY</Text>
          <Text style={[styles.valText, { color: '#06b6d4' }]}>245 ms</Text>
          <Text style={styles.subCardText}>Tempo de Ida e Volta</Text>
        </View>

        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>DDS TRANSMISSÃO RATE</Text>
          <Text style={[styles.valText, { color: '#818cf8' }]}>1162 kbps</Text>
          <Text style={styles.subCardText}>Largura S-Band Ativa</Text>
        </View>

        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>PACKET CORRUPTION</Text>
          <Text style={[styles.valText, { color: '#fbbf24' }]}>0.3%</Text>
          <Text style={styles.subCardText}>Perda de Pacotes</Text>
        </View>
      </View>

      {/* SIGNAL STRENGTH STATUS (LIVE FEED) */}
      <View style={styles.panelWide}>
        <View style={styles.cardHeaderFlex}>
          <Text style={styles.wideCardTitle}>SIGNAL STRENGTH STATUS (LIVE FEED)</Text>
          <Text style={{ fontSize: 9, color: '#34d399', fontFamily: 'monospace' }}>
            Nível: {telemetry.signalStrength} dBm
          </Text>
        </View>

        <View style={{ height: 120, width: '100%', marginTop: 8 }}>
          <Svg height="100%" width="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="greenGlowComms" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                <Stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              points={sigPoints}
            />
            <Path
              d={sigFill}
              fill="url(#greenGlowComms)"
            />
          </Svg>
        </View>
      </View>

      {/* Ground stations statuses */}
      <View style={styles.panelWide}>
        <Text style={styles.wideCardTitle}>ESTAÇÕES REGISTRADAS DISCIPLINADAS (DSN)</Text>
        <Text style={styles.sectionSubText}>Pontos de rastreamento federados para captação orbital.</Text>

        <View style={styles.stationList}>
          {groundStations.map((station, index) => (
            <View key={index} style={styles.stationItem}>
              <View>
                <Text style={styles.stationName}>{station.name}</Text>
                <Text style={styles.stationSpec}>{station.spec}</Text>
              </View>
              <View style={[styles.statusIndicator, { backgroundColor: station.color + '22', borderColor: station.color }]}>
                <Text style={[styles.statusText, { color: station.color }]}>{station.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Sample package listings */}
      <View style={styles.panelWide}>
        <Text style={styles.wideCardTitle}>LOG DE TELEMETRIA RF RECENTE</Text>
        <View style={styles.commsLogs}>
          <View style={styles.commsLogRow}>
            <Text style={styles.commsLogTime}>08:07:52</Text>
            <Text style={styles.commsLogId}>PKT-1037</Text>
            <Text style={styles.commsLogSize}>1438 B</Text>
            <Text style={styles.commsLogStatusOk}>CRC_OK</Text>
          </View>
          <View style={styles.commsLogRow}>
            <Text style={styles.commsLogTime}>08:07:39</Text>
            <Text style={styles.commsLogId}>PKT-1036</Text>
            <Text style={styles.commsLogSize}>1228 B</Text>
            <Text style={styles.commsLogStatusOk}>CRC_OK</Text>
          </View>
          <View style={styles.commsLogRow}>
            <Text style={styles.commsLogTime}>08:07:27</Text>
            <Text style={styles.commsLogId}>PKT-1035</Text>
            <Text style={styles.commsLogSize}>1148 B</Text>
            <Text style={styles.commsLogStatusOk}>CRC_OK</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
