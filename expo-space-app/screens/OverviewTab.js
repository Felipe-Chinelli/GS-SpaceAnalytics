import React from 'react';
import { View, Text } from 'react-native';
import { Cpu, Zap, Radio, Compass, Battery as BatteryIcon } from 'lucide-react-native';
import Svg, { Path, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import styles from '../styles';

export default function OverviewTab({ telemetry, thresholds, currentLimitDbm, logs }) {
  return (
    <View style={styles.block}>
      {/* Realtime Cards Grid */}
      <View style={styles.gridContainer}>
        <View style={styles.cardHalf}>
          <View style={styles.cardHeaderFlex}>
            <Text style={styles.cardLabel}>CORE TEMP</Text>
            <Cpu size={12} color="#06b6d4" />
          </View>
          <Text style={[styles.valText, { color: telemetry.temperature > thresholds.temperatureMax ? '#ef4444' : '#22d3ee' }]}>
            {telemetry.temperature}°C
          </Text>
          <Text style={styles.subCardText}>Máx tolerado: {thresholds.temperatureMax}°C</Text>
        </View>

        <View style={styles.cardHalf}>
          <View style={styles.cardHeaderFlex}>
            <Text style={styles.cardLabel}>SOLAR ARRAY</Text>
            <Zap size={12} color="#f59e0b" />
          </View>
          <Text style={[styles.valText, { color: telemetry.isEclipse ? '#3b82f6' : '#eab308' }]}>
            {telemetry.solarInput} W
          </Text>
          <Text style={styles.subCardText}>
            {telemetry.isEclipse ? 'Sombra da Terra' : 'Incidência Direta'}
          </Text>
        </View>

        <View style={styles.cardHalf}>
          <View style={styles.cardHeaderFlex}>
            <Text style={styles.cardLabel}>TELEMETRIA RF</Text>
            <Radio size={12} color="#10b981" />
          </View>
          <Text style={[styles.valText, { color: telemetry.signalStrength < currentLimitDbm ? '#ef4444' : '#34d399' }]}>
            {telemetry.signalStrength}dBm
          </Text>
          <Text style={styles.subCardText}>Mínimo: {currentLimitDbm}dBm</Text>
        </View>

        <View style={styles.cardHalf}>
          <View style={styles.cardHeaderFlex}>
            <Text style={styles.cardLabel}>ACS ATTITUDE</Text>
            <Compass size={12} color="#6366f1" />
          </View>
          <Text style={[styles.valText, { color: telemetry.attitudeError > thresholds.attitudeMax ? '#ef4444' : '#a5b4fc' }]}>
            {telemetry.attitudeError}°
          </Text>
          <Text style={styles.subCardText}>Tolerado: {thresholds.attitudeMax}°</Text>
        </View>
      </View>

      {/* Battery bar display */}
      <View style={styles.panelWide}>
        <View style={styles.cardHeaderFlex}>
          <View style={styles.flexRowItems}>
            <BatteryIcon size={16} color="#34d399" />
            <Text style={styles.wideCardTitle}>BATERIA CORESAT SENSOR</Text>
          </View>
          <Text style={[styles.wideCardValue, { color: telemetry.battery < thresholds.batteryMin ? '#ef4444' : '#ffffff' }]}>{telemetry.battery}%</Text>
        </View>
        <View style={styles.barOuter}>
          <View
            style={[
              styles.barInner,
              {
                width: `${telemetry.battery}%`,
                backgroundColor: telemetry.battery < thresholds.batteryMin ? '#ef4444' : '#10b981'
              }
            ]}
          />
        </View>
        <View style={styles.barLegends}>
          <Text style={styles.legendText}>Gatilho de Descarga: {thresholds.batteryMin}%</Text>
          <Text style={[styles.legendText, { color: telemetry.battery < thresholds.batteryMin ? '#f87171' : '#34d399' }]}>
            {telemetry.battery < thresholds.batteryMin ? 'ALERT TRIGGERED' : 'BATERIA ADEQUADA'}
          </Text>
        </View>
      </View>

      {/* LIVE TELEMETRY — ALL SYSTEMS */}
      <View style={styles.panelWide}>
        <View style={styles.cardHeaderFlex}>
          <Text style={styles.wideCardTitle}>LIVE TELEMETRY — ALL SYSTEMS</Text>
          <View style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
            <Text style={{ color: '#818cf8', fontSize: 8, fontWeight: 'bold', fontFamily: 'monospace' }}>LIVE FEED</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginVertical: 4, flexWrap: 'wrap' }}>
          <View style={styles.flexRowItems}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22d3ee' }} />
            <Text style={{ color: '#22d3ee', fontSize: 9, fontFamily: 'monospace' }}>Core Temp Line (Avg: {telemetry.temperature}°C)</Text>
          </View>
          <View style={styles.flexRowItems}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }} />
            <Text style={{ color: '#10b981', fontSize: 9, fontFamily: 'monospace' }}>Signal Line (Avg: {telemetry.signalStrength}dBm)</Text>
          </View>
        </View>

        <View style={{ height: 120, width: '100%', marginTop: 8 }}>
          <Svg height="100%" width="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="glowTemp" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
                <Stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </LinearGradient>
              <LinearGradient id="glowSignal" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                <Stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </LinearGradient>
            </Defs>

            {/* Grid lines */}
            <Line x1="0" y1="20" x2="400" y2="20" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4,4" />
            <Line x1="0" y1="50" x2="400" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4,4" />
            <Line x1="0" y1="80" x2="400" y2="80" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4,4" />
            <Line x1="0" y1="110" x2="400" y2="110" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4,4" />

            {/* Temperature Area & Line */}
            <Path
              d={`M 0 80 L 60 ${80 - Math.abs(telemetry.temperature - 30) * 1.5} L 120 83 L 180 87 L 240 82 L 300 89 L 360 ${88 + Math.sin(Date.now() / 1000) * 3} L 400 85`}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2"
            />
            <Path
               d={`M 0 80 L 60 ${80 - Math.abs(telemetry.temperature - 30) * 1.5} L 120 83 L 180 87 L 240 82 L 300 89 L 360 ${88 + Math.sin(Date.now() / 1000) * 3} L 400 85 L 400 120 L 0 120 Z`}
               fill="url(#glowTemp)"
            />

            {/* Signal Strength Area & Line */}
            <Path
              d={`M 0 40 L 60 42 L 120 ${35 + (telemetry.signalStrength + 91) * 0.4} L 180 43 L 240 38 L 300 42 L 360 40 L 400 35`}
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
            />
            <Path
               d={`M 0 40 L 60 42 L 120 ${35 + (telemetry.signalStrength + 91) * 0.4} L 180 43 L 240 38 L 300 42 L 360 40 L 400 35 L 400 120 L 0 120 Z`}
               fill="url(#glowSignal)"
            />
          </Svg>
        </View>
      </View>

      {/* Quick ground station overview links */}
      <View style={styles.panelWide}>
        <View style={styles.cardHeaderFlex}>
          <View style={styles.flexRowItems}>
            <Radio size={14} color="#22d3ee" />
            <Text style={styles.wideCardTitle}>UPLINK DISPONÍVEL DSN (ATIVIDADES)</Text>
          </View>
        </View>
        <View style={styles.stationsRow}>
          <View style={styles.stationBadge}>
            <Text style={styles.stationBadgeText}>Goldstone: ATIVO</Text>
          </View>
          <View style={styles.stationBadge}>
            <Text style={styles.stationBadgeText}>TDRSS Relay: CONECTADO</Text>
          </View>
        </View>
      </View>

      {/* Recent commands logs */}
      <View style={styles.logSection}>
        <Text style={styles.logSectionTitle}>LOG OPERACIONAL DA MISSÃO</Text>
        {logs.map((lg) => (
          <View key={lg.id} style={styles.logRowItem}>
            <Text style={styles.logTimestamp}>{lg.time}</Text>
            <View style={styles.logEventDetail}>
              <Text style={styles.logEventTitle}>{lg.event}</Text>
              <Text style={styles.logEventSubText}>{lg.info}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
