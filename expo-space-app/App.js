import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Text,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Bell,
  Compass,
  Cpu,
  Globe,
  Radio,
  Sparkles,
  Zap
} from 'lucide-react-native';

// Imported modular style definitions
import styles from './styles';

// Imported modular tab components
import OverviewTab from './screens/OverviewTab';
import SensorsTab from './screens/SensorsTab';
import EnergyTab from './screens/EnergyTab';
import CommunicationsTab from './screens/CommunicationsTab';
import OrbitalTab from './screens/OrbitalTab';
import DirectorTab from './screens/DirectorTab';
import AlertsTab from './screens/AlertsTab';

export default function App() {
  // -------------------------------------------------------------
  // 1. STATE VARIABLES & PERSISTENCE
  // -------------------------------------------------------------
  const [activeTab, setActiveTab] = useState('overview'); // overview, sensors, energy, communications, orbital, director, alerts
  const [apiKey, setApiKey] = useState(
    process.env.EXPO_PUBLIC_GEMINI_API_KEY || 
    process.env.GEMINI_API_KEY || 
    ''
  );
  const [recordingKey, setRecordingKey] = useState(false);

  // Core configuration thresholds (Saved permanently via AsyncStorage)
  const [thresholds, setThresholds] = useState({
    temperatureMax: 36,
    batteryMin: 93,
    signalMin: 33, // corresponds to -83 dBm limit
    attitudeMax: 0.12
  });

  // State forms for editing thresholds
  const [formTemp, setFormTemp] = useState('36');
  const [formBat, setFormBat] = useState('93');
  const [formSig, setFormSig] = useState('33');
  const [formAtt, setFormAtt] = useState('0.12');

  // Simulated live telemetry matching mobile metrics and orbits
  const [telemetry, setTelemetry] = useState({
    temperature: 35.4,
    battery: 92,
    solarInput: 834,
    signalStrength: -91, // dbm representation in calculations
    attitudeError: 0.08,
    altitude: 408.5,
    velocity: 27584,
    latitude: -15.7942,
    longitude: -47.8822,
    isEclipse: false,
    vibration: 0.002,
    timestamp: Math.floor(Date.now() / 1000)
  });

  // Alert and diagnostic history states
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([
    { id: '1', time: '12:00:00', event: 'Sistemas Inicializados', info: 'Barramento de energia do satélite ativo.' }
  ]);

  // AI module states
  const [aiReport, setAiReport] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Time MET representation
  const [metTime, setMetTime] = useState('MET 08:09:21');

  // Ground Stations telemetry reference
  const groundStations = [
    { name: 'Goldstone, USA', spec: '34m — Enlace Primário', status: 'ACTIVE', color: '#10b981' },
    { name: 'Canberra, AUS', spec: '70m — Enlace Secundário', status: 'STANDBY', color: '#64748b' },
    { name: 'Madrid, ESP', spec: '34m — Reservado', status: 'SCHEDULED', color: '#3b82f6' },
    { name: 'TDRSS Relay', spec: 'Banda Ku — Ativo', status: 'ACTIVE', color: '#10b981' }
  ];

  // -------------------------------------------------------------
  // 2. LOADING SAVED CONFIGURATION AT SYSTEM SETUP
  // -------------------------------------------------------------
  useEffect(() => {
    async function loadSavedParams() {
      try {
        const savedThresholds = await AsyncStorage.getItem('space_thresholds');
        const savedKey = await AsyncStorage.getItem('space_gemini_key');
        
        if (savedThresholds) {
          const parsed = JSON.parse(savedThresholds);
          setThresholds(parsed);
          setFormTemp(parsed.temperatureMax.toString());
          setFormBat(parsed.batteryMin.toString());
          setFormSig(parsed.signalMin.toString());
          setFormAtt(parsed.attitudeMax.toString());
        }
        if (savedKey) {
          setApiKey(savedKey);
        } else {
          const envKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
          if (envKey) {
            setApiKey(envKey);
          }
        }
      } catch (e) {
        console.warn('Erro ao ler AsyncStorage:', e);
      }
    }
    loadSavedParams();
  }, []);

  // -------------------------------------------------------------
  // 3. PERSISTENCE HELPER ACTIONS
  // -------------------------------------------------------------
  const saveThresholds = async () => {
    const temp = parseFloat(formTemp);
    const bat = parseFloat(formBat);
    const sig = parseFloat(formSig);
    const att = parseFloat(formAtt);

    if (isNaN(temp) || isNaN(bat) || isNaN(sig) || isNaN(att)) {
      alert('Por favor, digite números válidos em todos os campos!');
      return;
    }

    const nextT = {
      temperatureMax: temp,
      batteryMin: bat,
      signalMin: sig,
      attitudeMax: att
    };

    try {
      setThresholds(nextT);
      await AsyncStorage.setItem('space_thresholds', JSON.stringify(nextT));
      addLogRecord('Limiares Modificados', 'Novos valores gravados no AsyncStorage com sucesso.');
      alert('Limiares salvos com sucesso e persistidos localmente!');
    } catch (e) {
      alert('Falha ao salvar dados de persistência.');
    }
  };

  const saveApiKey = async (key) => {
    try {
      setApiKey(key);
      await AsyncStorage.setItem('space_gemini_key', key);
      setRecordingKey(true);
      setTimeout(() => setRecordingKey(false), 2000);
    } catch (e) {
      alert('Falha ao gravar chave de API.');
    }
  };

  const addLogRecord = (event, info) => {
    const timeNow = new Date().toLocaleTimeString();
    setLogs(prev => [
      { id: `${Date.now()}-${Math.random()}`, time: timeNow, event, info },
      ...prev.slice(0, 10)
    ]);
  };

  // -------------------------------------------------------------
  // 4. PHYSICS SIMULATOR INTERVAL
  // -------------------------------------------------------------
  useEffect(() => {
    const clockTimer = setInterval(() => {
      const now = new Date();
      setMetTime(`MET ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
    }, 1000);

    const simulationTimer = setInterval(() => {
      setTelemetry(prev => {
        const isEclipse = Math.sin(Date.now() / 38000) < -0.2;
        
        // Solar Panel fluctuations based on orbital angles
        const baseSolar = isEclipse ? 0 : 800 + Math.sin(Date.now() / 1500) * 45;
        const currentSolar = Math.max(0, Math.round(baseSolar + (Math.random() - 0.5) * 12));

        // Anomaly cycles: 0 = thermal spikes, 1 = battery drain, 2 = signal noise, 3 = ACS attitude error
        const secondsEpoch = Math.floor(Date.now() / 1000);
        const anomalyCycle = Math.floor(secondsEpoch / 14) % 4;
        const isAnomalyActive = (secondsEpoch % 14) < 6;

        // Core telemetry calculation with anomalies
        let tempBase = isEclipse ? 24.2 : 33.5 + Math.sin(Date.now() / 8000) * 3;
        if (isAnomalyActive && anomalyCycle === 0) {
          tempBase += 6.5; // Simulate hot weather solar spike
        }
        const temperature = parseFloat((tempBase + (Math.random() - 0.5) * 0.4).toFixed(1));

        let chargingSpeed = currentSolar > 0 ? 0.25 : -0.45;
        if (isAnomalyActive && anomalyCycle === 1) {
          chargingSpeed -= 1.8; // Heavy discharge anomaly active
        }
        const battery = parseFloat(Math.max(10, Math.min(100, prev.battery + chargingSpeed)).toFixed(1));

        let driftFactor = 1;
        if (isAnomalyActive && anomalyCycle === 3) {
          driftFactor = 2.1; // Thrust alignment leak
        }
        const attitudeError = parseFloat(Math.abs(Math.sin(Date.now() / 11000) * 0.16 * driftFactor + (Math.random() - 0.5) * 0.02).toFixed(3));

        let signalInterference = 0;
        if (isAnomalyActive && anomalyCycle === 2) {
          signalInterference = -12; // Radio noise block
        }
        const signalStrength = Math.max(-115, Math.min(-60, Math.round(-80 + Math.sin(Date.now() / 7000) * 12 + signalInterference + (Math.random() - 0.5) * 2)));

        const vibration = parseFloat(Math.max(0.0001, 0.002 + Math.sin(Date.now() / 3000) * 0.001).toFixed(3));
        const altitude = parseFloat((408.5 + Math.sin(Date.now() / 20000) * 1.5).toFixed(1));
        const velocity = parseFloat((27584 + Math.sin(Date.now() / 25000) * 4).toFixed(0));
        const latitude = parseFloat((Math.sin(Date.now() / 30000) * 51.6).toFixed(4));
        const longitude = parseFloat((((Date.now() / 6000) % 360) - 180).toFixed(4));

        return {
          temperature,
          battery,
          solarInput: currentSolar,
          signalStrength,
          attitudeError,
          altitude,
          velocity,
          latitude,
          longitude,
          isEclipse,
          vibration,
          timestamp: Math.floor(Date.now() / 1000)
        };
      });
    }, 2000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(simulationTimer);
    };
  }, []);

  // -------------------------------------------------------------
  // 5. DECISION TREE RESOLVER FOR WARNINGS & ALERTS
  // -------------------------------------------------------------
  useEffect(() => {
    const active = [];

    if (telemetry.temperature > thresholds.temperatureMax) {
      active.push({
        id: 'temp',
        system: 'Thermal',
        severity: 'CRITICAL',
        msg: `Temperatura Crítica: ${telemetry.temperature}°C (Máx: ${thresholds.temperatureMax}°C)`
      });
    }

    if (telemetry.battery < thresholds.batteryMin) {
      active.push({
        id: 'power',
        system: 'Power',
        severity: 'CRITICAL',
        msg: `Tensão Critica Bateria: ${telemetry.battery}% (Segurança: ${thresholds.batteryMin}%)`
      });
    }

    // Convert thresholds.signalMin to its corresponding negative dBm representative:
    const limitDbm = -(thresholds.signalMin + 50); // e.g. 33 -> -83 dBm
    if (telemetry.signalStrength < limitDbm) {
      active.push({
        id: 'comms',
        system: 'Communications',
        severity: 'CRITICAL',
        msg: `Sinal Fraco: ${telemetry.signalStrength}dBm (Min: ${limitDbm}dBm)`
      });
    }

    if (telemetry.attitudeError > thresholds.attitudeMax) {
      active.push({
        id: 'attitude',
        system: 'Orbital',
        severity: 'WARNING',
        msg: `Desvio de ACS: ${telemetry.attitudeError}° (Tolerado: ${thresholds.attitudeMax}°)`
      });
    }

    // Append logs for newly triggered alerts
    active.forEach(item => {
      const exists = alerts.some(al => al.id === item.id);
      if (!exists) {
        addLogRecord(`Alerta Disparado: ${item.system}`, item.msg);
      }
    });

    setAlerts(active);
  }, [telemetry, thresholds]);

  // -------------------------------------------------------------
  // 6. GEMINI DIRECT API SOLVER THROUGH FETCH
  // -------------------------------------------------------------
  const diagnoseSateAndRunAI = async () => {
    if (!apiKey.trim()) {
      alert('Insira a sua chave API do Gemini nas configurações para ativar os pareceres inteligentes!');
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiReport('');

    // Formulate a structured diagnostic context
    const limitDbm = -(thresholds.signalMin + 50);
    const dynamicPrompt = `Você é o diretor de vôo inteligente especialista do satélite SCD-4 Cubesat Elite de previsão.
Analise agora o seguinte status de telemetria em órbita:
- Temperatura dos Painéis: ${telemetry.temperature}°C (Limite tolerável: ${thresholds.temperatureMax}°C)
- Estado de Carga da Bateria: ${telemetry.battery}% (Limite mínimo de segurança: ${thresholds.batteryMin}%)
- Intensidade de Comunicação RF: ${telemetry.signalStrength} dBm (Limite aceitável de ruído: ${limitDbm} dBm)
- Giroscópio Attitude Error: ${telemetry.attitudeError}° (Erro tolerado ACS: ${thresholds.attitudeMax}°)
- Altitude Orbital Atual: ${telemetry.altitude} km
- Velocidade Linear: ${telemetry.velocity} km/h
- Estado de Luz Solar: ${telemetry.isEclipse ? 'Eclipsado (Sombra da Terra)' : 'Luz solar capturada nominalmente'}

Alertas Ativos detectados pelo sistema:
${alerts.length === 0 ? 'NENHUM ANOMALIA ESTRUTURAL ATIVA' : alerts.map(a => `- ALERTA: [${a.system}] ${a.msg}`).join('\n')}

Por favor, gere um curto parecer operacional do satélite em português brasileiro em exatamente 3 seções curtas com formatação simples:
1. DIAGNÓSTICO DO CENÁRIO (Resumo do estado físico de anomalia ou se está tudo ok)
2. RISCO POTENCIAL PRESCIENT (O que pode acontecer se não for corrigido)
3. MANOBRAS OPERACIONAIS RECOMENDADAS (Quais comandos os operadores de solo devem emitir via enlace para sanar quaisquer problemas)`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: dynamicPrompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 800
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Retorno inconsistente da API da IA. Verifique se o token inserido é válido.');
      }

      const json = await response.json();
      const outputText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (outputText) {
        setAiReport(outputText);
        addLogRecord('Diagnóstico de IA Emitido', 'Relatório preditivo consolidado com inteligência artificial.');
      } else {
        throw new Error('Resposta de modelo nula. Verifique se escolheu o token correto.');
      }
    } catch (e) {
      console.warn(e);
      setAiError(e.message || 'Erro inesperado.');
    } finally {
      setAiLoading(false);
    }
  };

  // Helper limits values
  const currentLimitDbm = -(thresholds.signalMin + 50);

  // -------------------------------------------------------------
  // 7. USER INTERFACE RENDERING (DARK SPACE MODE)
  // -------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070A13" />

      {/* HEADER BAR */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Compass size={20} color="#2dd4bf" />
            </View>
            <View>
              <Text style={styles.logoTitle}>ORION MOBILE</Text>
              <Text style={styles.logoSubtitle}>SCD-4 Telemetry Assistant</Text>
            </View>
          </View>
          <View style={styles.badgeBox}>
            <Text style={styles.badgeText}>{metTime}</Text>
          </View>
        </View>
      </View>

      {/* HORIZONTAL STREAMING NAVIGATION SCROLL */}
      <View style={styles.navBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navBarScroll}
        >
          <TouchableOpacity
            onPress={() => setActiveTab('overview')}
            style={[styles.navBtn, activeTab === 'overview' && styles.navBtnActive]}
          >
            <Compass size={13} color={activeTab === 'overview' ? '#2dd4bf' : '#64748b'} />
            <Text style={[styles.navBtnText, activeTab === 'overview' && styles.navBtnTextActive]}>Overview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('sensors')}
            style={[styles.navBtn, activeTab === 'sensors' && styles.navBtnActive]}
          >
            <Cpu size={13} color={activeTab === 'sensors' ? '#818cf8' : '#64748b'} />
            <Text style={[styles.navBtnText, activeTab === 'sensors' && styles.navBtnTextActive]}>Sensors</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('energy')}
            style={[styles.navBtn, activeTab === 'energy' && styles.navBtnActive]}
          >
            <Zap size={13} color={activeTab === 'energy' ? '#f59e0b' : '#64748b'} />
            <Text style={[styles.navBtnText, activeTab === 'energy' && styles.navBtnTextActive]}>Energy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('communications')}
            style={[styles.navBtn, activeTab === 'communications' && styles.navBtnActive]}
          >
            <Radio size={13} color={activeTab === 'communications' ? '#22d3ee' : '#64748b'} />
            <Text style={[styles.navBtnText, activeTab === 'communications' && styles.navBtnTextActive]}>Comms</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('orbital')}
            style={[styles.navBtn, activeTab === 'orbital' && styles.navBtnActive]}
          >
            <Globe size={13} color={activeTab === 'orbital' ? '#6366f1' : '#64748b'} />
            <Text style={[styles.navBtnText, activeTab === 'orbital' && styles.navBtnTextActive]}>Orbital</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('director')}
            style={[styles.navBtn, activeTab === 'director' && styles.navBtnActive]}
          >
            <Sparkles size={13} color={activeTab === 'director' ? '#818cf8' : '#64748b'} />
            <Text style={[styles.navBtnText, activeTab === 'director' && styles.navBtnTextActive]}>Diretor IA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('alerts')}
            style={[styles.navBtn, activeTab === 'alerts' && styles.navBtnActive, alerts.length > 0 && styles.navBtnAlertDanger]}
          >
            <Bell size={13} color={activeTab === 'alerts' ? '#ef4444' : alerts.length > 0 ? '#fb7185' : '#64748b'} />
            <Text style={[styles.navBtnText, activeTab === 'alerts' && styles.navBtnTextActive, alerts.length > 0 && { color: '#f87171' }]}>
              Alerts ({alerts.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* APP BODY CONTROLLER */}
      <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent}>
        {activeTab === 'overview' && (
          <OverviewTab
            telemetry={telemetry}
            thresholds={thresholds}
            currentLimitDbm={currentLimitDbm}
            logs={logs}
          />
        )}

        {activeTab === 'sensors' && (
          <SensorsTab
            telemetry={telemetry}
            thresholds={thresholds}
          />
        )}

        {activeTab === 'energy' && (
          <EnergyTab
            telemetry={telemetry}
          />
        )}

        {activeTab === 'communications' && (
          <CommunicationsTab
            telemetry={telemetry}
            currentLimitDbm={currentLimitDbm}
            groundStations={groundStations}
          />
        )}

        {activeTab === 'orbital' && (
          <OrbitalTab
            telemetry={telemetry}
            thresholds={thresholds}
          />
        )}

        {activeTab === 'director' && (
          <DirectorTab
            telemetry={telemetry}
            aiLoading={aiLoading}
            aiReport={aiReport}
            aiError={aiError}
            diagnoseSateAndRunAI={diagnoseSateAndRunAI}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsTab
            alerts={alerts}
            formTemp={formTemp}
            setFormTemp={setFormTemp}
            formBat={formBat}
            setFormBat={setFormBat}
            formSig={formSig}
            setFormSig={setFormSig}
            formAtt={formAtt}
            setFormAtt={setFormAtt}
            saveThresholds={saveThresholds}
            apiKey={apiKey}
            saveApiKey={saveApiKey}
            recordingKey={recordingKey}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
