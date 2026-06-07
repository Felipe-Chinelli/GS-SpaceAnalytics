/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExpoFile {
  path: string;
  description: string;
  code: string;
}

export const EXPO_FILES: ExpoFile[] = [
  {
    path: "package.json",
    description: "Configuração de dependências incluindo Expo Router, AsyncStorage, Reanimated e Expo Notifications.",
    code: `{
  "name": "space-predictive-analytics",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "expo-status-bar": "~1.12.1",
    "@react-native-async-storage/async-storage": "1.23.1",
    "react": "18.2.0",
    "react-native": "0.74.1",
    "lucide-react-native": "^0.379.0",
    "react-native-reanimated": "~3.10.1",
    "expo-notifications": "~0.28.1"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "typescript": "~5.3.3"
  },
  "private": true
}`
  },
  {
    path: "context/MissionContext.tsx",
    description: "Gerenciador de Estado Global com React Context API que sincroniza dados com AsyncStorage.",
    code: `import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Telemetry {
  temperature: number;
  battery: number;
  solarInput: number;
  signalStrength: number;
  attitudeError: number;
  altitude: number;
  velocity: number;
  isEclipse: boolean;
}

export interface Thresholds {
  temperatureMax: number;
  batteryMin: number;
  signalMin: number;
  attitudeMax: number;
}

export interface MissionConfig {
  missionName: string;
  commandCenter: string;
  satelliteModel: string;
}

interface MissionContextProps {
  telemetry: Telemetry;
  thresholds: Thresholds;
  config: MissionConfig;
  alerts: Array<{ id: string; msg: string; severity: string }>;
  updateThresholds: (t: Thresholds) => Promise<void>;
  updateConfig: (c: MissionConfig) => Promise<void>;
  simulateTelemetryTick: () => void;
  triggerAIGeminiAnalysis: () => Promise<string>;
}

const MissionContext = createContext<MissionContextProps | undefined>(undefined);

export function MissionProvider({ children }: { children: React.ReactNode }) {
  const [telemetry, setTelemetry] = useState<Telemetry>({
    temperature: 42,
    battery: 85,
    solarInput: 120,
    signalStrength: 92,
    attitudeError: 0.05,
    altitude: 418,
    velocity: 27580,
    isEclipse: false
  });

  const [thresholds, setThresholds] = useState<Thresholds>({
    temperatureMax: 85,
    batteryMin: 20,
    signalMin: 30,
    attitudeMax: 0.5
  });

  const [config, setConfig] = useState<MissionConfig>({
    missionName: "ALFA-ORBITER-1",
    commandCenter: "COLO-INPE-BRAZIL",
    satelliteModel: "SCD-3 Cubesat"
  });

  const [alerts, setAlerts] = useState<any[]>([]);

  // Carrega preferências salvas no AsyncStorage ao iniciar
  useEffect(() => {
    async function loadSavedData() {
      try {
        const savedThresholds = await AsyncStorage.getItem('@thresholds');
        const savedConfig = await AsyncStorage.getItem('@config');
        if (savedThresholds) setThresholds(JSON.parse(savedThresholds));
        if (savedConfig) setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Erro ao carregar AsyncStorage:", e);
      }
    }
    loadSavedData();
  }, []);

  // Sincroniza limiares de alerta
  const updateThresholds = async (newT: Thresholds) => {
    setThresholds(newT);
    await AsyncStorage.setItem('@thresholds', JSON.stringify(newT));
  };

  // Sincroniza informações de Missão
  const updateConfig = async (newC: MissionConfig) => {
    setConfig(newC);
    await AsyncStorage.setItem('@config', JSON.stringify(newC));
  };

  // Algoritmo simples de detecção de anomalia (Gera Alertas)
  useEffect(() => {
    const activeAlerts = [];
    if (telemetry.temperature > thresholds.temperatureMax) {
      activeAlerts.push({ id: '1', msg: 'Temperatura Elevada nos Sistemas!', severity: 'CRÍTICO' });
    }
    if (telemetry.battery < thresholds.batteryMin) {
      activeAlerts.push({ id: '2', msg: 'Bateria em Nível Crítico!', severity: 'CRÍTICO' });
    }
    if (telemetry.signalStrength < thresholds.signalMin) {
      activeAlerts.push({ id: '3', msg: 'Atenuação Severa de Sinal (Deep Space Loss)!', severity: 'WARNING' });
    }
    if (telemetry.attitudeError > thresholds.attitudeMax) {
      activeAlerts.push({ id: '4', msg: 'Erro de Alinhamento ACS Excessivo!', severity: 'WARNING' });
    }
    setAlerts(activeAlerts);
  }, [telemetry, thresholds]);

  // Simulação de telemetria baseada em física orbital
  const simulateTelemetryTick = () => {
    setTelemetry(prev => {
      const isEclipse = Math.sin(Date.now() / 30000) < -0.3;
      const solarInput = isEclipse ? 0 : Math.max(0, 150 + Math.sin(Date.now() / 1000) * 15);
      const battery = Math.max(0, Math.min(100, prev.battery + (solarInput > 0 ? 0.3 : -0.5)));
      const temperature = prev.temperature + (solarInput > 0 ? 0.4 : -0.6) + (Math.random() - 0.5) * 0.5;
      const signalStrength = Math.max(0, Math.min(100, 90 + Math.sin(Date.now() / 15000) * 8 + (Math.random() - 0.5) * 2));
      const attitudeError = Math.abs(Math.sin(Date.now() / 12000) * 0.15 + (Math.random() - 0.5) * 0.02);

      return {
        temperature,
        battery,
        solarInput,
        signalStrength,
        attitudeError,
        altitude: prev.altitude + (Math.random() - 0.5) * 0.1,
        velocity: prev.velocity + (Math.random() - 0.5) * 2,
        isEclipse
      };
    });
  };

  const triggerAIGeminiAnalysis = async (): Promise<string> => {
    try {
      // Exemplo de chamada para o back-end de sua API que usa o Gemini
      const res = await fetch("https://sua-api.com/api/gemini/analyze", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telemetry, thresholds })
      });
      const data = await res.json();
      return data.analysis;
    } catch (e) {
      return "Erro de rede ao conectar com a IA Inteligente da Missão.";
    }
  };

  return (
    <MissionContext.Provider value={{
      telemetry, thresholds, config, alerts,
      updateThresholds, updateConfig, simulateTelemetryTick,
      triggerAIGeminiAnalysis
    }}>
      {children}
    </MissionContext.Provider>
  );
}

export const useMission = () => {
  const context = useContext(MissionContext);
  if (!context) throw new Error('useMission deve ser usado sob um MissionProvider');
  return context;
};`
  },
  {
    path: "app/_layout.tsx",
    description: "Expo Router: Roteamento baseado em arquivos com Drawer e Stack de navegação.",
    code: `import React from 'react';
import { Tabs } from 'expo-router';
import { MissionProvider } from '../context/MissionContext';
import { Activity, Bell, Settings, Radio } from 'lucide-react-native';

export default function Layout() {
  return (
    <MissionProvider>
      <Tabs screenOptions={{
        tabBarStyle: { backgroundColor: '#0B0F19', borderTopColor: '#1F2937' },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#6B7280',
        headerStyle: { backgroundColor: '#0F172A', borderBottomWidth: 1, borderBottomColor: '#1F2937' },
        headerTintColor: '#E2E8F0',
      }}>
        <Tabs.Screen 
          name="index" 
          options={{ 
            title: "Simulação",
            tabBarIcon: ({ color }) => <Activity size={22} color={color} />
          }} 
        />
        <Tabs.Screen 
          name="alerts" 
          options={{ 
            title: "Thresholds & Alertas",
            tabBarIcon: ({ color }) => <Bell size={22} color={color} />
          }} 
        />
        <Tabs.Screen 
          name="predictive" 
          options={{ 
            title: "IA Preditiva",
            tabBarIcon: ({ color }) => <Radio size={22} color={color} />
          }} 
        />
        <Tabs.Screen 
          name="settings" 
          options={{ 
            title: "Config Missão",
            tabBarIcon: ({ color }) => <Settings size={22} color={color} />
          }} 
        />
      </Tabs>
    </MissionProvider>
  );
}`
  },
  {
    path: "app/index.tsx",
    description: "Tela Inicial do Applet: Telemetria de Sensores em Tempo Real (Painel Orbital e Energia).",
    code: `import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useMission } from '../context/MissionContext';

export default function DashboardScreen() {
  const { telemetry, simulateTelemetryTick, config } = useMission();

  // Aciona simulação repetitiva
  useEffect(() => {
    const timer = setInterval(() => {
      simulateTelemetryTick();
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.missionText}>MISSÃO CORRENTE</Text>
        <Text style={styles.title}>{config.missionName}</Text>
        <Text style={styles.subtitle}>Modelo: {config.satelliteModel}</Text>
      </View>

      <Text style={styles.sectionHeader}>DADOS DA ÓRBITA</Text>
      <View style={styles.cardGroup}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Altitude Orbital</Text>
          <Text style={styles.cardVal}>{telemetry.altitude.toFixed(1)} km</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Velocidade Linear</Text>
          <Text style={styles.cardVal}>{telemetry.velocity.toFixed(0)} km/h</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>SENSORES TÉRMICOS & ENERGIA</Text>
      <View style={styles.rowCard}>
        <Text style={styles.cardLabel}>Temperatura Principal</Text>
        <Text style={[styles.cardVal, { color: telemetry.temperature > 80 ? '#EF4444' : '#10B981' }]}>
          {telemetry.temperature.toFixed(1)} °C
        </Text>
      </View>

      <View style={styles.rowCard}>
        <Text style={styles.cardLabel}>Bateria Lítio</Text>
        <Text style={styles.cardVal}>{telemetry.battery.toFixed(0)}%</Text>
        <View style={styles.barOuter}>
          <View style={[styles.barInner, { width: \`\${telemetry.battery}%\`, backgroundColor: telemetry.battery < 25 ? '#EF4444' : '#10B981' }]} />
        </View>
      </View>

      <View style={styles.rowCard}>
        <Text style={styles.cardLabel}>Eclipse Space Indicator</Text>
        <Text style={[styles.cardVal, { color: telemetry.isEclipse ? '#3B82F6' : '#F59E0B' }]}>
          {telemetry.isEclipse ? "ECLIPSADO (Sombra)" : "LUZ SOLAR NOMINAL"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', padding: 15 },
  header: { marginBottom: 20, padding: 15, borderRadius: 10, backgroundColor: '#111827' },
  missionText: { color: '#10B981', fontWeight: 'bold', fontSize: 12 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#9CA3AF', fontSize: 13 },
  sectionHeader: { color: '#9CA3AF', fontSize: 12, fontWeight: 'bold', marginVertical: 10 },
  cardGroup: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  card: { flex: 1, padding: 15, borderRadius: 10, backgroundColor: '#1F2937' },
  rowCard: { padding: 15, borderRadius: 10, backgroundColor: '#1F2937', marginBottom: 10 },
  cardLabel: { color: '#9CA3AF', fontSize: 12 },
  cardVal: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  barOuter: { height: 6, backgroundColor: '#374151', borderRadius: 3, marginTop: 10 },
  barInner: { height: '100%', borderRadius: 3 }
});`
  },
  {
    path: "app/alerts.tsx",
    description: "Formulário de Limiares com AsyncStorage + Visualizador de Sinais de Alertas em Tempo Real.",
    code: `import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert as RNAlert } from 'react-native';
import { useMission } from '../context/MissionContext';

export default function AlertsConfigScreen() {
  const { thresholds, updateThresholds, alerts } = useMission();
  const [tempLimit, setTempLimit] = useState(thresholds.temperatureMax.toString());
  const [batteryLimit, setBatteryLimit] = useState(thresholds.batteryMin.toString());

  const handleSave = async () => {
    const t = parseFloat(tempLimit);
    const b = parseFloat(batteryLimit);

    if (isNaN(t) || isNaN(b)) {
      RNAlert.alert("Erro", "Limites devem ser números válidos");
      return;
    }

    await updateThresholds({
      ...thresholds,
      temperatureMax: t,
      batteryMin: b
    });
    RNAlert.alert("Sucesso", "Limiares atualizados de forma segura via AsyncStorage!");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Configurações de Alerta</Text>
      <Text style={styles.description}>Os dados do formulário abaixo são salvos de forma persistente.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Temp. Máxima Permitida (°C)</Text>
        <TextInput 
          style={styles.input}
          keyboardType="numeric"
          value={tempLimit}
          onChangeText={setTempLimit}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bateria Mínima Permitida (%)</Text>
        <TextInput 
          style={styles.input}
          keyboardType="numeric"
          value={batteryLimit}
          onChangeText={setBatteryLimit}
        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.btnText}>SALVAR CONFIGURAÇÃO</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>ALERTAS ATIVOS DO SISTEMA (\${alerts.length})</Text>
      {alerts.length === 0 ? (
        <View style={styles.nominalContainer}>
          <Text style={styles.nominalText}>SISTEMAS OPERANDO COM PARÂMETROS NOMINAIS</Text>
        </View>
      ) : (
        alerts.map((al, index) => (
          <View key={index} style={[styles.alertCard, { borderColor: al.severity === 'CRÍTICO' ? '#EF4444' : '#F59E0B' }]}>
            <Text style={[styles.alertSeverity, { color: al.severity === 'CRÍTICO' ? '#EF4444' : '#F59E0B' }]}>{al.severity}</Text>
            <Text style={styles.alertMsg}>{al.msg}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', padding: 20 },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  description: { color: '#9CA3AF', fontSize: 13, marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  label: { color: '#9CA3AF', fontSize: 12, marginBottom: 5 },
  input: { backgroundColor: '#1F2937', color: '#FFFFFF', padding: 12, borderRadius: 8 },
  saveBtn: { backgroundColor: '#10B981', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  btnText: { color: '#000000', fontWeight: 'bold' },
  sectionTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginTop: 30, marginBottom: 15 },
  nominalContainer: { padding: 15, borderRadius: 8, backgroundColor: '#064E3B', borderWidth: 1, borderColor: '#10B981' },
  nominalText: { color: '#10B981', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  alertCard: { padding: 15, borderRadius: 8, backgroundColor: '#1E1B4B', borderWidth: 1, marginBottom: 10 },
  alertSeverity: { fontSize: 11, fontWeight: 'bold', marginBottom: 3 },
  alertMsg: { color: '#E2E8F0', fontSize: 13 }
});`
  },
  {
    path: "app/predictive.tsx",
    description: "Integração Inteligente com a API Gemini para fornecer diagnósticos e planos de contingência orbitais baseados em I.A.",
    code: `import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useMission } from '../context/MissionContext';

export default function PredictiveScreen() {
  const { triggerAIGeminiAnalysis, telemetry } = useMission();
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    setAnalysis('');
    try {
      const result = await triggerAIGeminiAnalysis();
      setAnalysis(result);
    } catch (e) {
      setAnalysis("Não foi possível processar a diagnose orbital com a IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Diagnósticos Preditivos (IA Gemini)</Text>
      <Text style={styles.description}>Esta ferramenta analisa toda a telemetria atual para prever falhas estruturais, mecânicas ou térmicas.</Text>

      <TouchableOpacity style={styles.scanBtn} onPress={runAnalysis} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.btnText}>CONSULTAR DIRETOR IA DE VÔO</Text>
        )}
      </TouchableOpacity>

      {analysis ? (
        <View style={styles.analysisResult}>
          <Text style={styles.resultHeader}>RECON DIRETORIA GERAL:</Text>
          <Text style={styles.resultText}>{analysis}</Text>
        </View>
      ) : (
        <Text style={styles.placeholder}>Clique acima para enviar a telemetria orbital sincronizada para a inteligência preditiva.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', padding: 20 },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  description: { color: '#9CA3AF', fontSize: 13, marginBottom: 20 },
  scanBtn: { backgroundColor: '#8B5CF6', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFFFFF', fontWeight: 'bold' },
  analysisResult: { marginTop: 20, padding: 15, borderRadius: 8, backgroundColor: '#1E1B4B', borderWidth: 1, borderColor: '#8B5CF6' },
  resultHeader: { color: '#A78BFA', fontWeight: 'bold', fontSize: 13, marginBottom: 10 },
  resultText: { color: '#E2E8F0', fontStyle: 'italic', fontSize: 13 },
  placeholder: { color: '#4B5563', fontSize: 12, marginTop: 40, textAlign: 'center' }
});`
  }
];
