/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Battery, 
  Bell, 
  Cpu, 
  Compass, 
  CheckCircle, 
  AlertTriangle, 
  Save, 
  Terminal, 
  Sparkles, 
  RefreshCw, 
  Download, 
  Copy, 
  FileCode, 
  Globe, 
  Radio, 
  Zap,
  Shield,
  Layers,
  ChevronRight,
  TrendingUp,
  Sliders,
  Signal,
  Gauge,
  Info
} from 'lucide-react';
import { Telemetry, AlertThresholds, Alert, MissionConfig, HistoryRecord } from './types';
import { EXPO_FILES, ExpoFile } from './data/expoTemplateCode';

type SubTab = 'overview' | 'sensors' | 'energy' | 'communications' | 'orbital' | 'alerts';

export default function App() {
  // -----------------------------------------
  // 1. Initial State Setup & Local Persistence
  // -----------------------------------------
  const [missionConfig, setMissionConfig] = useState<MissionConfig>(() => {
    const saved = localStorage.getItem('space_mission_config');
    return saved ? JSON.parse(saved) : {
      missionName: "ORION-PREDICTIVE-X",
      commandCenter: "COLO-INPE-BRAZIL",
      satelliteModel: "SCD-4 Cubesat Elite",
      launchDate: "2026-06-03",
      targetOrbit: "LEO",
      predictionInterval: 5
    };
  });

  const [thresholds, setThresholds] = useState<AlertThresholds>(() => {
    const saved = localStorage.getItem('space_thresholds');
    return saved ? JSON.parse(saved) : {
      temperatureMax: 36,
      batteryMin: 93,
      signalMin: 33, // corresponds to -83 dBm limit
      attitudeMax: 0.12
    };
  });

  // Simulated live telemetry matching user interface metrics and statistics
  const [telemetry, setTelemetry] = useState<Telemetry>({
    temperature: 35.4,
    battery: 92,
    solarInput: 834,
    signalStrength: 91, // dbm representation in calculations
    attitudeError: 0.08,
    altitude: 408.5,
    vibration: 0.002,
    longitude: -47.8822,
    latitude: -15.7942,
    velocity: 27584,
    isEclipse: false,
    timestamp: Math.floor(Date.now() / 1000)
  });

  const [vibrationHistory, setVibrationHistory] = useState<number[]>([0.002, 0.003, 0.001, 0.002, 0.004, 0.002, 0.003]);
  const [tempHistory, setTempHistory] = useState<number[]>([34.1, 34.5, 34.9, 35.1, 35.2, 35.4, 35.4]);
  const [powerBalanceHistory, setPowerBalanceHistory] = useState<number[]>([214, 218, 210, 205, 212, 215, 214]);

  // Network State
  const [issLoading, setIssLoading] = useState(false);
  const [issFallback, setIssFallback] = useState(false);

  // Gemini Analyzer status
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Active Alerts and Logs Lists
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [logs, setLogs] = useState<HistoryRecord[]>([
    {
      id: "init",
      timestamp: new Date().toLocaleTimeString(),
      event: "Módulo Flight Control Conectado",
      summary: "Todos os barramentos de energia Solar Arrays Alpha/Beta sincronizados.",
      type: "INFO"
    }
  ]);

  // Form states
  const [formConfig, setFormConfig] = useState<MissionConfig>({ ...missionConfig });
  const [formThresholds, setFormThresholds] = useState<AlertThresholds>({ ...thresholds });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Navigation tabs (Web vs Expo Mobile Exporter)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expo_exporter'>('dashboard');
  
  // Dashboard Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('overview');

  // Selected file on mobile codeset
  const [selectedMobileFile, setSelectedMobileFile] = useState<ExpoFile>(EXPO_FILES[1]);
  const [copiedText, setCopiedText] = useState(false);

  // VS Code Local Connection Simulator States
  const [localIp, setLocalIp] = useState("192.168.1.100");
  const [localPort, setLocalPort] = useState("8081");
  const [connectionType, setConnectionType] = useState<'exp' | 'http'>('exp');

  // -----------------------------------------
  // 2. State persistence & logging
  // -----------------------------------------
  const saveConfigValues = (newC: MissionConfig) => {
    localStorage.setItem('space_mission_config', JSON.stringify(newC));
    setMissionConfig(newC);
    addLogRecord("Configuração Salva", `Mission: ${newC.missionName}, Orbit: ${newC.targetOrbit}`, "INFO");
  };

  const saveThresholdValues = (newT: AlertThresholds) => {
    localStorage.setItem('space_thresholds', JSON.stringify(newT));
    setThresholds(newT);
    
    // ADJUST & FIX TELEMETRY VALUES TO SAFE CONFORMING RANGES!
    setTelemetry(prev => {
      let temp = prev.temperature;
      let bat = prev.battery;
      let sig = prev.signalStrength;
      let att = prev.attitudeError;

      let correctedAny = false;
      let logMsgs: string[] = [];

      // If temperature is breaching the new Max, cool it down!
      if (temp > newT.temperatureMax) {
        temp = parseFloat((newT.temperatureMax - 2.5 - Math.random() * 2).toFixed(1));
        correctedAny = true;
        logMsgs.push(`Resfriamento ativo purgado para ${temp}°C (Temp limite: ${newT.temperatureMax}°C)`);
      }
      // If battery is breaching the new Min, fast-charge it!
      if (bat < newT.batteryMin) {
        bat = parseFloat((newT.batteryMin + 4.5 + Math.random() * 3).toFixed(1));
        if (bat > 100) bat = 100;
        correctedAny = true;
        logMsgs.push(`Painéis alinhados ao sol. Nível de bateria elevado para ${bat}% (Min: ${newT.batteryMin}%)`);
      }
      // If signal is below thresholds minimum (dBm limit is calculatedLimitDbm)
      const calculatedLimitDbm = -(newT.signalMin + 50); // e.g. 33 -> -83dBm
      if (sig < calculatedLimitDbm) {
        sig = calculatedLimitDbm + 12;
        if (sig > -60) sig = -60;
        correctedAny = true;
        logMsgs.push(`Potência de onda amplificada para ${sig} dBm (Mínimo: ${calculatedLimitDbm} dBm)`);
      }
      // If attitude drift is breaching Max
      if (att > newT.attitudeMax) {
        att = parseFloat(Math.max(0.02, newT.attitudeMax - 0.04 - Math.random() * 0.03).toFixed(3));
        correctedAny = true;
        logMsgs.push(`Motores RCS acionados. Erro ACS reduzido para ${att}° (Max: ${newT.attitudeMax}°)`);
      }

      if (correctedAny) {
        // Add a nice log record
        setTimeout(() => {
          addLogRecord("Manobra Corretiva Ativa", "Subsistemas ajustados remotamente pelos novos limites.", "ORBITAL_MANEUVER");
          logMsgs.forEach(msg => {
            addLogRecord("Anomalia Resolvida", msg, "INFO");
          });
        }, 300);
      }

      return {
        ...prev,
        temperature: temp,
        battery: bat,
        signalStrength: sig,
        attitudeError: att
      };
    });

    addLogRecord("Limiares de Alerta Sincronizados", `Limites atualizados: Temp: ${newT.temperatureMax}°C, Bat: ${newT.batteryMin}%`, "INFO");
  };

  const addLogRecord = (event: string, summary: string, type: 'INFO' | 'ALERT' | 'DIAGNOSTIC' | 'ORBITAL_MANEUVER') => {
    const fresh: HistoryRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      event,
      summary,
      type
    };
    setLogs(prev => [fresh, ...prev.slice(0, 18)]);
  };

  // Fetch real ISS coordinates proxy
  const syncISSGeodesics = async () => {
    setIssLoading(true);
    try {
      const response = await fetch('/api/nasa/iss');
      if (!response.ok) throw new Error('Falha na resposta do satélite');
      const payload = await response.json();
      if (payload.success) {
        setIssFallback(payload.fallback || false);
        setTelemetry(prev => ({
          ...prev,
          latitude: payload.data.latitude,
          longitude: payload.data.longitude,
          altitude: payload.data.altitude,
          velocity: payload.data.velocity * 0.277778, // convert km/h to m/s if space orbital display matches
        }));
        addLogRecord("ISS Telemetria Sincronizada", `Coordenadas da Estação espacial recebidas via API real.`, "INFO");
      }
    } catch (e) {
      console.warn(e);
      addLogRecord("Falha API de Monitoramento", "Acionado gerador orbital contingencial.", "ALERT");
    } finally {
      setIssLoading(false);
    }
  };

  // -----------------------------------------
  // 3. Simulated Telemetry Generator Loop
  // -----------------------------------------
  useEffect(() => {
    syncISSGeodesics();

    const interval = setInterval(() => {
      setTelemetry(prev => {
        const isEclipse = Math.sin(Date.now() / 42000) < -0.2;
        
        // Solar panels fluctuates
        const baseSolar = isEclipse ? 0 : 800 + Math.sin(Date.now() / 1500) * 45;
        const currentSolar = Math.max(0, parseFloat((baseSolar + (Math.random() - 0.5) * 10).toFixed(0)));
        
        // Dynamic cyclic space weather anomalies to trigger warnings and alarms more frequently
        const secondsEpoch = Math.floor(Date.now() / 1000);
        // Anomaly cycles: 0 = thermal spike, 1 = battery drain, 2 = antenna fade, 3 = ACS drift
        const anomalyCycle = Math.floor(secondsEpoch / 14) % 4;
        const isAnomalyActive = (secondsEpoch % 14) < 6; // active for 6 seconds out of every 14 seconds

        // Temperature depends on solar intake + payload calculations + anomaly 0
        let tempBase = isEclipse ? 24 : 33.5 + Math.sin(Date.now() / 8000) * 3;
        if (isAnomalyActive && anomalyCycle === 0) {
          tempBase += 5.5 + Math.sin(Date.now() / 500) * 1.5; // push temperature above normal levels
        }
        const temperature = parseFloat((tempBase + (Math.random() - 0.5) * 0.4).toFixed(1));

        // Battery level charges slowly in sunshine, discharges rapidly during eclipse or anomaly 1
        let chargingSpeed = currentSolar > 0 ? 0.25 : -0.45;
        if (isAnomalyActive && anomalyCycle === 1) {
          chargingSpeed -= 1.8; // battery is draining
        }
        const battery = parseFloat(Math.max(10, Math.min(100, prev.battery + chargingSpeed)).toFixed(1));

        // Attitude parameters (ACS control drift) - anomaly 3 triggers alignment drift
        let driftMultiplier = 1;
        if (isAnomalyActive && anomalyCycle === 3) {
          driftMultiplier = 1.9; // ACS attitude failure
        }
        const attitudeError = parseFloat(Math.abs(Math.sin(Date.now() / 11000) * 0.16 * driftMultiplier + (Math.random() - 0.5) * 0.02).toFixed(3));

        // Communication Signal (dbm scale -60 to -115) - anomaly 2 triggers antenna attenuation
        let signalInterference = 0;
        if (isAnomalyActive && anomalyCycle === 2) {
          signalInterference = -10; // attenuate communication
        }
        const signalStrength = Math.max(-115, Math.min(-60, Math.round(-80 + Math.sin(Date.now() / 7000) * 12 + signalInterference + (Math.random() - 0.5) * 2)));

        // Micro-gravity vibration (g)
        const vibration = parseFloat(Math.max(0.0001, 0.002 + Math.sin(Date.now() / 3000) * 0.001 + (Math.random() - 0.5) * 0.0005).toFixed(3));

        // Orbital variables
        const altitude = parseFloat((408.5 + Math.sin(Date.now() / 20000) * 1.5).toFixed(1));
        const velocity = parseFloat((27584 + Math.sin(Date.now() / 25000) * 5).toFixed(0));

        // Add to historical vectors
        setVibrationHistory(vh => [...vh.slice(1), vibration]);
        setTempHistory(th => [...th.slice(1), temperature]);
        setPowerBalanceHistory(pb => [...pb.slice(1), parseFloat((currentSolar - 620).toFixed(0))]);

        return {
          ...prev,
          temperature,
          battery,
          solarInput: currentSolar,
          signalStrength,
          attitudeError,
          vibration,
          altitude,
          velocity,
          isEclipse,
          timestamp: Math.floor(Date.now() / 1000)
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // -----------------------------------------
  // 4. Alert State Resolver (Global Decision Tree)
  // -----------------------------------------
  useEffect(() => {
    const list: Alert[] = [];

    // Core thermal thresholds check
    if (telemetry.temperature > thresholds.temperatureMax) {
      list.push({
        id: "alert_temp_critical",
        system: "Thermal",
        severity: "CRITICAL",
        message: `Temperatura excedeu patamar nominal: TH-01 lê ${telemetry.temperature}°C (Limiar: ${thresholds.temperatureMax}°C)`,
        timestamp: new Date().toLocaleTimeString(),
        active: true
      });
    }

    // Battery levels thresholds check
    if (telemetry.battery < thresholds.batteryMin) {
      list.push({
        id: "alert_energy_critical",
        system: "Power",
        severity: "CRITICAL",
        message: `Subtensão Crítica de Bateria: ${telemetry.battery}% residual (Segurança: ${thresholds.batteryMin}%)`,
        timestamp: new Date().toLocaleTimeString(),
        active: true
      });
    }

    // Comms thresholds check (Represent dbm below threshold mapping, e.g. -95 is worse/lower than -85 thresholds)
    // For simplicity, let's translate the thresholds signalMin slider (represented as negative threshold min, e.g. -95dBm)
    // To facilitate UI, thresholds.signalMin slider values are stored as positive threshold, say user sets 35 -> corresponds to -35 - 50 = -85dBm
    const calculatedLimitDbm = -(thresholds.signalMin + 50); // e.g. 35 -> -85dBm
    if (telemetry.signalStrength < calculatedLimitDbm) {
      list.push({
        id: "alert_comm_degradation",
        system: "Communication",
        severity: "CRITICAL",
        message: `Atenuação de Onda de Sinal: ${telemetry.signalStrength} dBm (Mínimo: ${calculatedLimitDbm} dBm)`,
        timestamp: new Date().toLocaleTimeString(),
        active: true
      });
    }

    // Attitude drift check
    if (telemetry.attitudeError > thresholds.attitudeMax) {
      list.push({
        id: "alert_orbital_alignment",
        system: "Orbital",
        severity: "WARNING",
        message: `Problema no Controle Atitude ACS: Desvio de ${telemetry.attitudeError}° (Tolerado: ${thresholds.attitudeMax}°)`,
        timestamp: new Date().toLocaleTimeString(),
        active: true
      });
    }

    // Check newly launched alert triggers and add to timeline
    list.forEach(incident => {
      const exists = alerts.some(al => al.id === incident.id);
      if (!exists) {
        addLogRecord(`Gargalo Encontrado: [${incident.system}]`, incident.message, "ALERT");
      }
    });

    setAlerts(list);
  }, [telemetry.temperature, telemetry.battery, telemetry.signalStrength, telemetry.attitudeError, thresholds]);

  // Handle Form Submissions & Input Validators
  const submitThresholdsForm = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (formThresholds.temperatureMax < 35 || formThresholds.temperatureMax > 110) {
      errs.temperatureMax = "Temperatura deve ficar entre 35°C e 110°C.";
    }
    if (formThresholds.batteryMin < 15 || formThresholds.batteryMin > 85) {
      errs.batteryMin = "Mínimo de bateria deve ficar entre 15% e 85%.";
    }
    if (formThresholds.signalMin < 10 || formThresholds.signalMin > 85) {
      errs.signalMin = "Selecione um limite de atenuação entre 10 e 85.";
    }
    if (formThresholds.attitudeMax <= 0.05 || formThresholds.attitudeMax > 1.8) {
      errs.attitudeMax = "Erro máximo de ACS aceito: de 0.05° a 1.80°.";
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setFormErrors({});
    saveThresholdValues(formThresholds);
  };

  // -----------------------------------------
  // 5. Intelligent Gemini Diagnose Interface
  // -----------------------------------------
  const launchGeminiInference = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiAnalysis('');
    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telemetry,
          alertThresholds: {
            temperature: thresholds.temperatureMax,
            battery: thresholds.batteryMin,
            signalStrength: thresholds.signalMin,
            attitudeError: thresholds.attitudeMax
          }
        })
      });

      if (!response.ok) {
        throw new Error('Retorno inconsistente da central inteligente.');
      }

      const info = await response.json();
      if (info.success) {
        setAiAnalysis(info.analysis);
        addLogRecord("Parecer Executado por IA", "Diretor de Vôo IA emitiu relatório de proteção preditiva.", "DIAGNOSTIC");
      } else {
        throw new Error(info.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Erro inesperado na análise.');
      addLogRecord("Inconsistência Diretor IA", "Não foi possível coletar interpretação de inteligência generativa.", "ALERT");
    } finally {
      setAiLoading(false);
    }
  };

  // Copy/Download Helpers
  const performCopyAction = async () => {
    try {
      await navigator.clipboard.writeText(selectedMobileFile.code);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (e) {
      // safe fallback
    }
  };

  const performDownloadAction = () => {
    const dataBlob = new Blob([selectedMobileFile.code], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(dataBlob);
    const linkAnchor = document.createElement('a');
    linkAnchor.href = downloadUrl;
    linkAnchor.download = selectedMobileFile.path.split('/').pop() || 'ExpoFileCode.ts';
    linkAnchor.click();
    URL.revokeObjectURL(downloadUrl);
  };

  // -----------------------------------------
  // 6. Navigation Switching on Alert Click
  // -----------------------------------------
  const navigateToRelevantTabFromAlert = (systemType: string) => {
    if (systemType === 'Thermal') {
      setActiveSubTab('sensors');
    } else if (systemType === 'Power') {
      setActiveSubTab('energy');
    } else if (systemType === 'Communication') {
      setActiveSubTab('communications');
    } else if (systemType === 'Orbital') {
      setActiveSubTab('orbital');
    }
    
    // Add an event entry logging the redirection behavior
    addLogRecord("Redirecionamento Automático", `Navegado para o módulo [${systemType}] para investigar inconformidade.`, "INFO");
  };

  return (
    <div className="min-h-screen bg-[#070A13] text-[#E2E8F0] font-sans antialiased overflow-x-hidden" id="orion_space_app">
      
      {/* Upper Space Header Bar */}
      <header className="border-b border-[#141A30] bg-[#0A0F21]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-teal-500/20 border border-indigo-500/30">
              <Compass className="w-6 h-6 text-teal-400 rotate-12 transition-transform select-none" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-widest font-mono text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/15">
                  MET 08:09:21
                </span>
                <span className="text-[10px] tracking-widest font-mono text-indigo-400 font-medium">
                  ORION PREDICTIVE V2.4.1
                </span>
              </div>
              <h1 className="text-base font-bold text-white tracking-wide">Plataforma Analítica de Operações Orbitais Simuladas</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25 font-semibold' 
                  : 'bg-indigo-950/20 border border-indigo-950 text-slate-400 hover:text-white hover:bg-indigo-950/40'
              }`}
            >
              🚀 Simulador de Vôo Web
            </button>
            <button 
              onClick={() => setActiveTab('expo_exporter')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
                activeTab === 'expo_exporter' 
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-600/25 font-semibold' 
                  : 'bg-indigo-950/20 border border-indigo-950 text-slate-400 hover:text-white hover:bg-indigo-950/40'
              }`}
            >
              📲 Exportador Mobile (Expo Router)
            </button>
          </div>

        </div>
      </header>

      {/* Main Container Area */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        {activeTab === 'dashboard' ? (
          /* =================================================================================
             SIMULATOR WEB DASHBOARDS SECTION (SENSORS / ENERGY / COMMS / ORBITAL / ALERTS)
             ================================================================================= */
          <div>
            
            {/* Top Internal Tab Navigation matching exact image aesthetics */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-[#0A0D1A]/60 border border-[#141B32] p-2 rounded-2xl">
              <div className="flex flex-wrap items-center gap-2">
                
                {/* 1. Mission Overview */}
                <button
                  onClick={() => setActiveSubTab('overview')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all duration-200 border ${
                    activeSubTab === 'overview'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-indigo-950/20'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Mission Overview
                </button>

                {/* 2. Sensors */}
                <button
                  onClick={() => setActiveSubTab('sensors')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all duration-200 border ${
                    activeSubTab === 'sensors'
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 font-bold'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-indigo-950/20'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  Sensors
                </button>

                {/* 3. Energy */}
                <button
                  onClick={() => setActiveSubTab('energy')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all duration-200 border ${
                    activeSubTab === 'energy'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-indigo-950/20'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Energy
                </button>

                {/* 4. Communications */}
                <button
                  onClick={() => setActiveSubTab('communications')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all duration-200 border ${
                    activeSubTab === 'communications'
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 font-bold'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-indigo-950/20'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  Communications
                </button>

                {/* 5. Orbital */}
                <button
                  onClick={() => setActiveSubTab('orbital')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all duration-200 border ${
                    activeSubTab === 'orbital'
                      ? 'bg-sky-500/10 border-sky-500 text-sky-450 text-sky-400 font-bold'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-indigo-950/20'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Orbital
                </button>
              </div>

              {/* 6. Alerts Badge Button on top right */}
              <button
                onClick={() => setActiveSubTab('alerts')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all duration-200 ${
                  activeSubTab === 'alerts'
                    ? 'bg-red-500 text-white font-bold'
                    : 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/35 text-red-400'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>ALERTS</span>
                <span className={`px-1.5 py-0.2 text-[9px] rounded-full font-bold ${activeSubTab === 'alerts' ? 'bg-black text-red-400' : 'bg-red-600 text-white animate-pulse'}`}>
                  {alerts.length}
                </span>
              </button>
            </div>

            {/* Render Selected Sub-tab Contents */}
            {activeSubTab === 'overview' && (
              /* ==========================================
                 SUB-TAB: MISSION OVERVIEW
                 ========================================== */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
                
                {/* Main Left Side (Span 8) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  
                  {/* Top Real-time parameters row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    
                    {/* Core Temp summary */}
                    <div className="bg-[#0A0D1A]/70 border border-[#141A30] rounded-xl p-4">
                      <span className="text-[10px] font-mono text-slate-400 block tracking-wider">CORE TEMP</span>
                      <div className="flex items-baseline mt-1">
                        <span className="text-xl font-bold font-mono text-cyan-400">{telemetry.temperature.toFixed(1)}</span>
                        <span className="text-slate-400 text-xs ml-0.5">°C</span>
                      </div>
                      <div className="w-full bg-[#141A30] h-1 mt-2 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full" style={{ width: `${Math.min(100, (telemetry.temperature / 110) * 100)}%` }} />
                      </div>
                    </div>

                    {/* Solar power generated */}
                    <div className="bg-[#0A0D1A]/70 border border-[#141A30] rounded-xl p-4">
                      <span className="text-[10px] font-mono text-slate-400 block tracking-wider">SOLAR POWER</span>
                      <div className="flex items-baseline mt-1">
                        <span className="text-xl font-bold font-mono text-yellow-400">{telemetry.solarInput}</span>
                        <span className="text-slate-400 text-xs ml-0.5">W</span>
                      </div>
                      <div className="w-full bg-[#141A30] h-1 mt-2 rounded-full overflow-hidden">
                        <div className="bg-yellow-400 h-full" style={{ width: `${Math.min(100, (telemetry.solarInput / 980) * 100)}%` }} />
                      </div>
                    </div>

                    {/* Signal Strength scale */}
                    <div className="bg-[#0A0D1A]/70 border border-[#141A30] rounded-xl p-4">
                      <span className="text-[10px] font-mono text-slate-400 block tracking-wider">SIGNAL STRENGTH</span>
                      <div className="flex items-baseline mt-1">
                        <span className="text-xl font-bold font-mono text-emerald-400">{telemetry.signalStrength}</span>
                        <span className="text-slate-400 text-xs ml-0.5">dBm</span>
                      </div>
                      <div className="w-full bg-[#141A30] h-1 mt-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full" style={{ width: `${Math.min(100, ((telemetry.signalStrength + 115) / 55)*100)}%` }} />
                      </div>
                    </div>

                    {/* Stability Score index */}
                    <div className="bg-[#0A0D1A]/70 border border-[#141A30] rounded-xl p-4">
                      <span className="text-[10px] font-mono text-slate-400 block tracking-wider">ORBITAL STABILITY</span>
                      <div className="flex items-baseline mt-1">
                        <span className="text-xl font-bold font-mono text-sky-400">95.5</span>
                        <span className="text-slate-400 text-xs ml-0.5">%</span>
                      </div>
                      <div className="w-full bg-[#141A30] h-1 mt-2 rounded-full overflow-hidden">
                        <div className="bg-sky-400 h-full w-[95.5%]" />
                      </div>
                    </div>

                  </div>

                  {/* Wide live telemetry chart & System Status blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Symmetrical line chart mock with custom vector segments */}
                    <div className="md:col-span-8 bg-[#0A0D1A]/70 border border-[#141A30] p-5 rounded-2xl">
                      <div className="flex items-center justify-between mb-3 border-b border-[#141A30]/50 pb-2">
                        <span className="text-xs font-mono font-bold text-slate-300">LIVE TELEMETRY — ALL SYSTEMS</span>
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-mono">LIVE FEED</span>
                      </div>

                      {/* Line graph utilizing vectors with fluctuating live status display */}
                      <div className="h-56 w-full relative pt-2">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 180" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="glowTemp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2"/>
                              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0"/>
                            </linearGradient>
                            <linearGradient id="glowSignal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.15"/>
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                            </linearGradient>
                          </defs>

                          {/* Grid guide lines */}
                          <line x1="0" y1="30" x2="400" y2="30" stroke="#141a30" strokeWidth="0.75" strokeDasharray="3,3" />
                          <line x1="0" y1="75" x2="400" y2="75" stroke="#141a30" strokeWidth="0.75" strokeDasharray="3,3" />
                          <line x1="0" y1="120" x2="400" y2="120" stroke="#141a30" strokeWidth="0.75" strokeDasharray="3,3" />
                          <line x1="0" y1="165" x2="400" y2="165" stroke="#141a30" strokeWidth="0.75" strokeDasharray="3,3" />

                          {/* Temp Line */}
                          <path 
                            d={`M 0 110 L 60 ${120 - Math.abs(telemetry.temperature - 30) * 3} L 120 115 L 180 125 L 240 120 L 300 128 L 360 ${125 + Math.sin(Date.now() / 1000) * 4} L 400 122`}
                            fill="none" 
                            stroke="#22d3ee" 
                            strokeWidth="2" 
                          />
                          <path 
                            d={`M 0 110 L 60 ${120 - Math.abs(telemetry.temperature - 30) * 3} L 120 115 L 180 125 L 240 120 L 300 128 L 360 ${125 + Math.sin(Date.now() / 1000) * 4} L 400 122 L 400 180 L 0 180 Z`}
                            fill="url(#glowTemp)"
                          />

                          {/* Signal Power Line */}
                          <path 
                            d={`M 0 45 L 60 48 L 120 ${40 + (telemetry.signalStrength + 80) * 0.8} L 180 50 L 240 42 L 300 48 L 360 45 L 400 38`}
                            fill="none" 
                            stroke="#10b981" 
                            strokeWidth="1.5" 
                          />
                          <path 
                            d={`M 0 45 L 60 48 L 120 ${40 + (telemetry.signalStrength + 80) * 0.8} L 180 50 L 240 42 L 300 48 L 360 45 L 400 38 L 400 180 L 0 180 Z`}
                            fill="url(#glowSignal)"
                          />
                        </svg>

                        {/* Chart overlays */}
                        <div className="absolute top-4 left-4 flex gap-4 text-[9px] font-mono">
                          <span className="flex items-center gap-1.5 text-cyan-400">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            Core Temperature Line (Avg: {telemetry.temperature}°C)
                          </span>
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Signal Strength Line (Avg: {telemetry.signalStrength}dBm)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* System checklist */}
                    <div className="md:col-span-4 bg-[#0A0D1A]/70 border border-[#141A30] p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-400 block mb-4">SYSTEM STATUS</span>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2 rounded bg-indigo-950/20 border border-indigo-950">
                            <span className="text-xs text-slate-300 font-mono">ORION-7 CORE</span>
                            <span className="text-[10px] tracking-wide font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/25">NOMINAL</span>
                          </div>

                          <div className="flex items-center justify-between p-2 rounded bg-indigo-950/20 border border-indigo-950">
                            <span className="text-xs text-slate-300 font-mono">CONJUNTO PROPULSÃO</span>
                            <span className="text-[10px] tracking-wide font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/25">ACTIVE</span>
                          </div>

                          <div className="flex items-center justify-between p-2 rounded bg-indigo-950/20 border border-indigo-950">
                            <span className="text-xs text-slate-300 font-mono">BATERIAS AVIONICS</span>
                            <span className="text-[10px] tracking-wide font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/25">OK</span>
                          </div>

                          <div className="flex items-center justify-between p-2 rounded bg-indigo-950/20 border border-indigo-950">
                            <span className="text-xs text-slate-300 font-mono">DISPOSITIVO INTEL I.A.</span>
                            <span className="text-[10px] tracking-wide font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 font-bold border border-sky-500/25">AI NOMINAL</span>
                          </div>

                          <div className="flex items-center justify-between p-2 rounded bg-indigo-950/20 border border-indigo-950">
                            <span className="text-xs text-slate-300 font-mono">DEEP SPACE NETWORK</span>
                            <span className="text-[10px] tracking-wide font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/25">LINKED</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 mt-4 pt-3 border-t border-[#141A30]/50 text-right">
                        SCD-4 Telemetry Node: <span className="text-white font-bold">100% active</span>
                      </div>
                    </div>

                  </div>

                  {/* Flight Predictor (Diretor de Vôo Inteligente) */}
                  <div className="rounded-2xl border border-indigo-950 bg-[#0A0F1D]/75 p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-full pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-950/50 pb-3.5 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span className="text-[10px] tracking-[0.1em] font-mono text-emerald-300 font-bold px-2 py-0.5 rounded bg-[#10B981]/10 border border-[#10B981]/20">FLIGHT DEV INTERPRETER</span>
                        </div>
                        <h3 className="font-bold text-base text-white mt-1">Diretor de Vôo Inteligente (IA Gemini-3.5)</h3>
                      </div>

                      <button 
                        onClick={launchGeminiInference}
                        disabled={aiLoading}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-mono text-xs py-2.5 px-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] self-start sm:self-center"
                      >
                        {aiLoading ? (
                          <span className="flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Diagnosticando...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Consultar Diretor de Vôo IA
                          </span>
                        )}
                      </button>
                    </div>

                    {aiAnalysis ? (
                      <div className="bg-[#060810] border border-indigo-950 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-indigo-950">
                          <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-mono">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <span>RELATÓRIO PREDITIVO ORBITAL</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{new Date().toLocaleTimeString()}</span>
                        </div>
                        <div className="text-slate-300 space-y-3 text-xs leading-relaxed overflow-y-auto max-h-[250px] pr-2 scrollbar-thin scrollbar-thumb-indigo-950">
                          {aiAnalysis.split('\n').map((line, idx) => {
                            if (line.trim().startsWith('**') || line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.')) {
                              return <p key={idx} className="font-bold text-emerald-400 mt-2 font-mono">{line}</p>;
                            }
                            return <p key={idx}>{line}</p>;
                          })}
                        </div>
                      </div>
                    ) : aiLoading ? (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-[#060810]/40 rounded-xl border border-indigo-950/40">
                        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                        <p className="text-xs font-mono">Interpretando dados físicos e telemetria térmicas com a IA...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center py-8 bg-[#060810]/30 rounded-xl border border-dashed border-indigo-950/40">
                        <div className="p-3 bg-indigo-950/40 rounded-full text-indigo-400 mb-2">
                          <Terminal className="w-5 h-5 animate-pulse" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-300">Nenhum Parecer IA Solicitado</h4>
                        <p className="text-[11px] text-slate-400 max-w-md mt-1 leading-relaxed">
                          Aperte o botão acima para despachar as telemetrias correntes de temperatura, tensão de bateria e giroscópios diretamente ao resolvedor inteligente físico.
                        </p>
                      </div>
                    )}

                    {aiError && (
                      <div className="mt-3 bg-red-950/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-xs font-mono">
                        ❌ <strong>Falha Generativa:</strong> {aiError}. Forneça uma chave válida no Secrets panel para ativar o resolvedor em tempo de execução de órbita.
                      </div>
                    )}
                  </div>

                </div>

                {/* Right Column: Ajuste Limites + Newsfeed (Span 4) */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                  {/* Adjust Limits Panel with Form Submit matching User Intent */}
                  <div className="rounded-2xl border border-indigo-900/50 bg-[#0A0F1D]/75 p-5">
                    <div className="flex items-center justify-between mb-4 border-b border-[#141A30] pb-2.5">
                      <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-emerald-400 animate-pulse" />
                        Limites de Alerta
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold">REGULATED</span>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                      Gerencie limites operacionais estruturais. Configurações alteradas abaixo serão gravadas sob persistência local.
                    </p>

                    <form onSubmit={submitThresholdsForm} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 flex justify-between mb-1">
                          <span>TH-01 Temp Máxima:</span>
                          <span className="text-cyan-400 font-bold">{formThresholds.temperatureMax}°C</span>
                        </label>
                        <input 
                          type="range"
                          min="45"
                          max="95"
                          value={formThresholds.temperatureMax}
                          onChange={(e) => setFormThresholds({...formThresholds, temperatureMax: Number(e.target.value)})}
                          className="w-full h-1 bg-[#141A30] accent-emerald-500 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-slate-400 flex justify-between mb-1">
                          <span>Mínimo Bateria Crítica:</span>
                          <span className="text-emerald-400 font-bold">{formThresholds.batteryMin}%</span>
                        </label>
                        <input 
                          type="range"
                          min="15"
                          max="50"
                          value={formThresholds.batteryMin}
                          onChange={(e) => setFormThresholds({...formThresholds, batteryMin: Number(e.target.value)})}
                          className="w-full h-1 bg-[#141A30] accent-emerald-500 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-slate-400 flex justify-between mb-1">
                          <span>Sinal Mínimo (Atenuação Máx):</span>
                          <span className="text-yellow-400 font-bold">-{formThresholds.signalMin + 50} dBm</span>
                        </label>
                        <input 
                          type="range"
                          min="15"
                          max="60"
                          value={formThresholds.signalMin}
                          onChange={(e) => setFormThresholds({...formThresholds, signalMin: Number(e.target.value)})}
                          className="w-full h-1 bg-[#141A30] accent-emerald-500 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-slate-400 flex justify-between mb-1">
                          <span>Tolerância Atitude ACS:</span>
                          <span className="text-sky-450 text-indigo-400 font-bold">{formThresholds.attitudeMax}°</span>
                        </label>
                        <input 
                          type="range"
                          min="10"
                          max="110"
                          step="5"
                          value={formThresholds.attitudeMax * 100}
                          onChange={(e) => setFormThresholds({...formThresholds, attitudeMax: Number(e.target.value) / 100})}
                          className="w-full h-1 bg-[#141A30] accent-emerald-500 rounded-lg cursor-pointer"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#111827] hover:bg-slate-800 border border-emerald-500/30 text-emerald-400 font-mono text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 font-bold transition-all mt-4"
                      >
                        <Save className="w-3.5 h-3.5" />
                        GRAVAR NO BANCO LOCAL
                      </button>

                      {formErrors.temperatureMax && <p className="text-[10px] text-red-400 font-mono mt-1">{formErrors.temperatureMax}</p>}
                      {formErrors.batteryMin && <p className="text-[10px] text-red-400 font-mono mt-1">{formErrors.batteryMin}</p>}
                    </form>
                  </div>

                  {/* Ground/Simulator Perturbations */}
                  <div className="rounded-2xl border border-indigo-950 bg-[#0A0F1D]/75 p-5">
                    <span className="text-[10px] font-mono text-slate-500 block mb-2">PERTURBAÇÃO DE SENSORES (SIMULADA)</span>
                    <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                      Provoque estresse físico nos subsistemas e monitore como a central de alertas toma decisões imediatas orbitais:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => {
                          setTelemetry(prev => ({ ...prev, temperature: prev.temperature + 44 }));
                          addLogRecord("Pico Térmico Injetado", "Forçado aquecimento por exposição anômala TH-01.", "ALERT");
                        }}
                        className="p-2 text-[10px] font-mono text-amber-400 border border-amber-500/20 hover:border-amber-500/40 rounded text-left hover:bg-amber-500/5 transition-all"
                      >
                        ⚠️ Pico Térmico Temp
                      </button>
                      
                      <button 
                        onClick={() => {
                          setTelemetry(prev => ({ ...prev, battery: 14 }));
                          addLogRecord("Descarga Programada", "Queda induzida via rádio transpondidores.", "ALERT");
                        }}
                        className="p-2 text-[10px] font-mono text-red-400 border border-red-500/20 hover:border-red-500/40 rounded text-left hover:bg-red-500/5 transition-all"
                      >
                        ⚠️ Descarga Bateria
                      </button>
                    </div>
                  </div>

                  {/* Logs Feed Console */}
                  <div className="rounded-2xl border border-indigo-950 bg-[#0A0F1D]/75 p-5 flex-1">
                    <span className="text-xs font-mono font-bold text-slate-300 block mb-3 border-b border-[#141A30] pb-2">CONGRESSO DE TELEMETRIA</span>
                    <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
                      {logs.map((item, idx) => (
                        <div key={idx} className="text-[11px] leading-relaxed border-b border-[#141A30]/40 pb-2 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <span className={`font-mono font-bold px-1 rounded text-[9px] ${
                              item.type === 'ALERT' ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-300'
                            }`}>{item.type}</span>
                            <span className="text-slate-500 font-mono text-[9px]">{item.timestamp}</span>
                          </div>
                          <span className="text-slate-300 font-bold block mt-1">{item.event}</span>
                          <span className="text-slate-400 text-[10px] block">{item.summary}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {activeSubTab === 'sensors' && (
              /* ==========================================
                 SUB-TAB: SENSORS (Térmico, Pressão, etc.)
                 ========================================== */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
                
                {/* Left metrics panel (Span 4) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Metric Top parameters */}
                  <div className="bg-[#0A0D1A]/80 border border-indigo-950 p-5 rounded-2xl">
                    <span className="text-xs font-mono text-slate-400 block tracking-widest">TEMPERATURE CORE</span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold font-mono text-cyan-400">{telemetry.temperature.toFixed(1)}</span>
                      <span className="text-cyan-400 text-sm">°C</span>
                    </div>
                    <div className="mt-3.5 w-full bg-indigo-950/50 h-1 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full transition-all" style={{ width: `${Math.min(100, (telemetry.temperature / 110) * 100)}%` }} />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-2 block">Variação permitida: Mín: 0°C | Máx: {thresholds.temperatureMax}°C</span>
                  </div>

                  {/* Pressure Metric */}
                  <div className="bg-[#0A0D1A]/80 border border-indigo-950 p-5 rounded-2xl">
                    <span className="text-xs font-mono text-slate-400 block tracking-widest">PRESSURE METER_METICS</span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold font-mono text-indigo-400">101.5</span>
                      <span className="text-indigo-400 text-sm">kPa</span>
                    </div>
                    <div className="mt-3.5 w-full bg-indigo-950/50 h-1 rounded-full overflow-hidden">
                      <div className="bg-indigo-400 h-full w-[65%]" />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-2 block">Sensor Barométrico Diferencial PR-01</span>
                  </div>

                  {/* Radiation Exposure */}
                  <div className="bg-[#0A0D1A]/80 border border-indigo-950 p-5 rounded-2xl">
                    <span className="text-xs font-mono text-slate-400 block tracking-widest">RADIATION DOSIMETER</span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold font-mono text-amber-500">178</span>
                      <span className="text-amber-500 text-xs">μSv/h</span>
                    </div>
                    <div className="mt-3.5 w-full bg-indigo-950/50 h-1 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[45%]" />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-2 block">Exposição de micro-dosagem estocástica global</span>
                  </div>

                  {/* Vibration micro-grav */}
                  <div className="bg-[#0A0D1A]/80 border border-indigo-950 p-5 rounded-2xl">
                    <span className="text-xs font-mono text-slate-400 block tracking-widest">VIBRATION (G) MONITOR</span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold font-mono text-emerald-400">{telemetry.vibration.toFixed(3)}</span>
                      <span className="text-emerald-400 text-xs">g</span>
                    </div>
                    <div className="mt-3.5 w-full bg-indigo-950/50 h-1 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full" style={{ width: `${Math.min(100, telemetry.vibration * 12000)}%` }} />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-2 block">Unidade de Medição de Inércia (IMU)</span>
                  </div>

                </div>

                {/* Right graphics panel (Span 8) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  
                  {/* Interactive charts row in Sensors view */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Temp History Graph */}
                    <div className="bg-[#0A0D1A]/70 border border-[#141A30] p-5 rounded-2xl">
                      <span className="text-xs font-mono font-bold text-slate-300 block mb-4">TEMPERATURE HISTORY — 60s (°C)</span>
                      
                      {/* Interactive SVG graph */}
                      <div className="h-44 w-full relative">
                        <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                          <polyline 
                            fill="none" 
                            stroke="#22d3ee" 
                            strokeWidth="1.5" 
                            points={tempHistory.map((val, idx) => `${idx * 16.6}, ${45 - (val - 20) * 1.5}`).join(' ')} 
                          />
                          {/* Shading fill underneath path line */}
                          <path 
                            d={`M 0 50 L ${tempHistory.map((val, idx) => `${idx * 16.6} ${45 - (val - 20) * 1.5}`).join(' L ')} L 100 50 Z`} 
                            fill="rgba(34,211,238,0.06)" 
                          />
                        </svg>
                        <div className="absolute top-0 right-0 text-[9px] font-mono text-slate-400">Current: {telemetry.temperature}°C</div>
                      </div>
                    </div>

                    {/* Radiation Exposure Graph */}
                    <div className="bg-[#0A0D1A]/70 border border-[#141A30] p-5 rounded-2xl">
                      <span className="text-xs font-mono font-bold text-slate-300 block mb-4">RADIATION DOSIMETRY HISTORY (μSv/h)</span>
                      
                      {/* Interactive SVG path line graph */}
                      <div className="h-44 w-full relative">
                        <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                          <polyline 
                            fill="none" 
                            stroke="#f59e0b" 
                            strokeWidth="1.5" 
                            points="0,32 15,36 30,22 45,34 60,38 75,25 90,29 100,24" 
                          />
                          <path 
                            d="M 0 50 L 0 32 L 15 36 L 30 22 L 45 34 L 60 38 L 75 25 L 90 29 L 100 24 L 100 50 Z" 
                            fill="rgba(245,158,11,0.06)" 
                          />
                        </svg>
                        <div className="absolute top-0 right-0 text-[9px] font-mono text-slate-400">Current: 178 μSv/h</div>
                      </div>
                    </div>

                  </div>

                  {/* Sensor Array Full live spreadsheet */}
                  <div className="bg-[#0A0D1A]/70 border border-[#141A30] p-5 rounded-2xl">
                    <span className="text-xs font-mono font-bold text-slate-300 block mb-4">SENSOR ARRAY — LIVE READINGS</span>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#141A30] text-slate-400 font-mono">
                            <th className="py-2.5">SENSOR ID</th>
                            <th className="py-2.5">TYPE</th>
                            <th className="py-2.5">VALUE</th>
                            <th className="py-2.5">UNIT</th>
                            <th className="py-2.5">MIN 24H</th>
                            <th className="py-2.5">MAX 24H</th>
                            <th className="py-2.5 text-right">STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#141A30]/30 font-mono">
                          
                          <tr>
                            <td className="py-3 text-white font-bold">TH-01</td>
                            <td className="py-3 text-slate-300">Temperature (Avionics)</td>
                            <td className={`py-3 ${telemetry.temperature > thresholds.temperatureMax ? 'text-red-400 font-extrabold':'text-emerald-400'}`}>
                              {telemetry.temperature.toFixed(2)}
                            </td>
                            <td className="py-3 text-slate-400">°C</td>
                            <td className="py-3 text-slate-400">32.1</td>
                            <td className="py-3 text-slate-400">{thresholds.temperatureMax + 8}</td>
                            <td className="py-3 text-right">
                              <span className={`px-1 rounded text-[9px] font-bold ${telemetry.temperature > thresholds.temperatureMax ? 'bg-red-500/10 text-red-400':'bg-emerald-500/10 text-emerald-400'}`}>
                                {telemetry.temperature > thresholds.temperatureMax ? 'OVERHEAT':'NOMINAL'}
                              </span>
                            </td>
                          </tr>

                          <tr>
                            <td className="py-3 text-white font-bold">TH-02</td>
                            <td className="py-3 text-slate-300">Temperature (Battery Pack)</td>
                            <td className="py-3 text-slate-200">{(telemetry.temperature - 1.5).toFixed(2)}</td>
                            <td className="py-3 text-slate-400">°C</td>
                            <td className="py-3 text-slate-400">30.5</td>
                            <td className="py-3 text-slate-400">42.2</td>
                            <td className="py-3 text-right">
                              <span className="px-1 rounded text-[9px] bg-emerald-500/10 text-emerald-400 font-bold">NOMINAL</span>
                            </td>
                          </tr>

                          <tr>
                            <td className="py-3 text-white font-bold">TH-03</td>
                            <td className="py-3 text-slate-300">Temperature (Payload Chamber)</td>
                            <td className="py-3 text-slate-200">{(telemetry.temperature - 4.1).toFixed(2)}</td>
                            <td className="py-3 text-slate-400">°C</td>
                            <td className="py-3 text-slate-400">28.4</td>
                            <td className="py-3 text-slate-400">38.9</td>
                            <td className="py-3 text-right">
                              <span className="px-1 rounded text-[9px] bg-emerald-500/10 text-emerald-400 font-bold">NOMINAL</span>
                            </td>
                          </tr>

                          <tr>
                            <td className="py-3 text-white font-bold">PR-01</td>
                            <td className="py-3 text-slate-300">Chamber Pressure</td>
                            <td className="py-3 text-slate-200">101.52</td>
                            <td className="py-3 text-slate-400">kPa</td>
                            <td className="py-3 text-slate-400">99.85</td>
                            <td className="py-3 text-slate-400">102.44</td>
                            <td className="py-3 text-right">
                              <span className="px-1 rounded text-[9px] bg-emerald-500/10 text-emerald-400 font-bold">NOMINAL</span>
                            </td>
                          </tr>

                          <tr>
                            <td className="py-3 text-white font-bold">RD-01</td>
                            <td className="py-3 text-slate-300">External Dosimeter</td>
                            <td className="py-3 text-slate-200">178.4</td>
                            <td className="py-3 text-slate-400">μSv/h</td>
                            <td className="py-3 text-slate-400">110.2</td>
                            <td className="py-3 text-slate-400">340.5</td>
                            <td className="py-3 text-right">
                              <span className="px-1 rounded text-[9px] bg-emerald-500/10 text-emerald-400 font-bold">NOMINAL</span>
                            </td>
                          </tr>

                          <tr>
                            <td className="py-3 text-white font-bold">VB-01</td>
                            <td className="py-3 text-slate-300">Micro-Vibration Sensor</td>
                            <td className="py-3 text-slate-200">{telemetry.vibration.toFixed(4)}</td>
                            <td className="py-3 text-slate-400">g</td>
                            <td className="py-3 text-slate-400">0.0001</td>
                            <td className="py-3 text-slate-400">0.0125</td>
                            <td className="py-3 text-right">
                              <span className="px-1 rounded text-[9px] bg-emerald-500/10 text-emerald-400 font-bold">NOMINAL</span>
                            </td>
                          </tr>

                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {activeSubTab === 'energy' && (
              /* ==========================================
                 SUB-TAB: ENERGY
                 ========================================== */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn" id="energy_section_panel">
                
                {/* 1. Quad cards row from Energy layout */}
                <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-4 gap-4">
                  
                  {/* Solar panel generation */}
                  <div className="bg-[#0A0D1A]/80 border border-indigo-950 p-5 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">SOLAR GENERATION</span>
                    <div className="text-3xl font-bold font-mono text-amber-500 mt-2">{telemetry.solarInput} W</div>
                    <div className="w-full bg-amber-500/20 h-1 rounded-full overflow-hidden mt-3">
                      <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, (telemetry.solarInput / 980) * 100)}%` }} />
                    </div>
                  </div>

                  {/* Battery percentage level */}
                  <div className="bg-[#0A0D1A]/80 border border-indigo-950 p-5 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">BATTERY LEVEL</span>
                    <div className={`text-3xl font-bold font-mono mt-2 ${telemetry.battery < thresholds.batteryMin ? 'text-red-400 animate-pulse':'text-emerald-400'}`}>
                      {telemetry.battery}%
                    </div>
                    <div className="w-full bg-emerald-500/20 h-1 rounded-full overflow-hidden mt-3">
                      <div className={`h-full ${telemetry.battery < thresholds.batteryMin ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${telemetry.battery}%` }} />
                    </div>
                  </div>

                  {/* Total load consumption */}
                  <div className="bg-[#0A0D1A]/80 border border-indigo-950 p-5 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">TOTAL CONSUMPTION</span>
                    <div className="text-3xl font-bold font-mono text-red-400 mt-2">620 W</div>
                    <div className="w-full bg-red-500/20 h-1 rounded-full overflow-hidden mt-3">
                      <div className="bg-red-500 h-full w-[65%]" />
                    </div>
                  </div>

                  {/* Power current balance index */}
                  <div className="bg-[#0A0D1A]/80 border border-indigo-950 p-5 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">POWER BALANCE</span>
                    <div className={`text-3xl font-bold font-mono mt-2 ${telemetry.solarInput - 620 > 0 ? 'text-blue-400':'text-red-450 text-red-400'}`}>
                      {telemetry.solarInput - 620 > 0 ? `+${telemetry.solarInput - 620}` : `${telemetry.solarInput - 620}`} W
                    </div>
                    <div className="w-full bg-blue-500/20 h-1 rounded-full overflow-hidden mt-3">
                      <div className="bg-blue-400 h-full" style={{ width: `${Math.max(10, Math.min(100, ((telemetry.solarInput - 620 + 400) / 800) * 100))}%` }} />
                    </div>
                  </div>

                </div>

                {/* Donut and Power curves grid */}
                <div className="lg:col-span-8 bg-[#0A0D1A]/70 border border-[#141A30] p-6 rounded-2xl">
                  <span className="text-xs font-mono font-bold text-slate-300 block mb-5 pb-2 border-b border-indigo-950">ENERGY CRITICAL TIMELINE — 2 HOURS</span>
                  
                  {/* Interactive timeline path layout */}
                  <div className="h-56 w-full relative pt-2">
                    <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                      <polyline 
                        fill="none" 
                        stroke="#f59e0b" 
                        strokeWidth="1.5"
                        points="0,15 15,25 30,12 45,28 60,14 75,22 90,12 100,18" 
                      />
                      <polyline 
                        fill="none" 
                        stroke="#ef4444" 
                        strokeWidth="1.2"
                        points="0,35 20,32 40,38 60,34 80,33 100,36" 
                      />
                      {/* Solar area shade */}
                      <path d="M 0 50 L 0 15 L 15 25 L 30 12 L 45 28 L 60 14 L 75 22 L 90 12 L 100 18 L 100 50 Z" fill="rgba(245,158,11,0.02)" />
                    </svg>
                    <div className="absolute top-2 left-2 flex gap-4 text-[9px] font-mono uppercase">
                      <div className="flex items-center gap-1.5 text-amber-500">
                        <span className="w-2.5 h-1 bg-amber-500" />
                        Solar Output Wave
                      </div>
                      <div className="flex items-center gap-1.5 text-red-500">
                        <span className="w-2.5 h-1 bg-red-500" />
                        Spacecraft Base draw
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Power Draw segment donut representation */}
                <div className="lg:col-span-4 bg-[#0A0D1A]/70 border border-[#141A30] p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-300 block mb-4">SYSTEM POWER DRAW (DISTRIBUTION)</span>
                    
                    {/* Segment circle */}
                    <div className="flex justify-center my-6">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                          {/* Segment slices representation with glowing colors */}
                          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#1c2132" strokeWidth="4" />
                          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4.2" strokeDasharray="30 100" strokeDashoffset="0" />
                          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="4.2" strokeDasharray="25 100" strokeDashoffset="-30" />
                          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#8b5cf6" strokeWidth="4.2" strokeDasharray="25 100" strokeDashoffset="-55" />
                          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#ef4444" strokeWidth="4.2" strokeDasharray="20 100" strokeDashoffset="-80" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-xl font-mono font-bold text-white">620</span>
                          <span className="text-[10px] text-slate-500 uppercase font-mono">W draw</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] font-mono mt-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-400">
                          <span className="w-2 h-2 rounded bg-emerald-500" /> Avionics payload
                        </span>
                        <span className="text-slate-200">30% (186W)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-400">
                          <span className="w-2 h-2 rounded bg-blue-500" /> Radio Beacons
                        </span>
                        <span className="text-slate-200">25% (155W)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-400">
                          <span className="w-2 h-2 rounded bg-purple-500" /> ACS Gyroscopes
                        </span>
                        <span className="text-slate-200">25% (155W)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-400">
                          <span className="w-2 h-2 rounded bg-red-500" /> Thermal Heaters
                        </span>
                        <span className="text-slate-200">20% (124W)</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Solar Panel status indicators layout */}
                <div className="lg:col-span-12 bg-[#0A0D1A]/70 border border-[#141A30] p-5 rounded-2xl">
                  <span className="text-xs font-mono font-bold text-slate-300 block mb-4">SOLAR ARRAY PANELS STATUS</span>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <div className="bg-indigo-950/20 border border-indigo-950 p-4 rounded-xl">
                      <span className="text-[10px] font-mono text-slate-500 block">SA-ALPHA</span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-lg font-mono font-bold text-emerald-400">95%</span>
                        <span className="text-slate-400 text-xs">204 W</span>
                      </div>
                      <div className="w-full bg-[#141A30] h-1.5 mt-2 rounded">
                        <div className="bg-emerald-400 h-full w-[95%]" />
                      </div>
                    </div>

                    <div className="bg-indigo-950/20 border border-indigo-950 p-4 rounded-xl">
                      <span className="text-[10px] font-mono text-slate-500 block">SA-BETA</span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-lg font-mono font-bold text-emerald-400">75%</span>
                        <span className="text-slate-400 text-xs">161 W</span>
                      </div>
                      <div className="w-full bg-[#141A30] h-1.5 mt-2 rounded">
                        <div className="bg-emerald-400 h-full w-[75%]" />
                      </div>
                    </div>

                    <div className="bg-indigo-950/20 border border-indigo-950 p-4 rounded-xl">
                      <span className="text-[10px] font-mono text-slate-500 block">SA-GAMMA</span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-lg font-mono font-bold text-emerald-400">93%</span>
                        <span className="text-slate-400 text-xs">200 W</span>
                      </div>
                      <div className="w-full bg-[#141A30] h-1.5 mt-2 rounded">
                        <div className="bg-emerald-400 h-full w-[93%]" />
                      </div>
                    </div>

                    <div className="bg-indigo-950/20 border border-indigo-950 p-4 rounded-xl">
                      <span className="text-[10px] font-mono text-slate-500 block">SA-DELTA</span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-lg font-mono font-bold text-emerald-400">77%</span>
                        <span className="text-slate-400 text-xs">166 W</span>
                      </div>
                      <div className="w-full bg-[#141A30] h-1.5 mt-2 rounded">
                        <div className="bg-emerald-400 h-full w-[77%]" />
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {activeSubTab === 'communications' && (
              /* ==========================================
                 SUB-TAB: COMMUNICATIONS
                 ========================================== */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
                
                {/* 1. Header widget stat row */}
                <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-4 gap-4">
                  
                  <div className="bg-[#0A0D1A]/80 border border-indigo-950 p-5 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">SIGNAL STRENGTH</span>
                    <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">{telemetry.signalStrength} dBm</div>
                    <div className="w-full bg-emerald-500/20 h-1 rounded-full overflow-hidden mt-3">
                      <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, ((telemetry.signalStrength + 115) / 55) * 100)}%` }} />
                    </div>
                  </div>

                  <div className="bg-[#0A0D1A]/80 border border-indigo-950 p-5 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">LATENCY</span>
                    <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">245 ms</div>
                    <div className="w-full bg-cyan-500/20 h-1 rounded-full overflow-hidden mt-3">
                      <div className="bg-cyan-400 h-full w-[52%]" />
                    </div>
                  </div>

                  <div className="bg-[#0A0D1A]/80 border border-indigo-950 p-5 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">DATA RATE</span>
                    <div className="text-2xl font-bold font-mono text-indigo-400 mt-2">1162 kbps</div>
                    <div className="w-full bg-indigo-500/20 h-1 rounded-full overflow-hidden mt-3">
                      <div className="bg-indigo-400 h-full w-[78%]" />
                    </div>
                  </div>

                  <div className="bg-[#0A0D1A]/80 border border-indigo-950 p-5 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">PACKET LOSS</span>
                    <div className="text-2xl font-bold font-mono text-amber-500 mt-2">0.3%</div>
                    <div className="w-full bg-amber-500/20 h-1 rounded-full overflow-hidden mt-3">
                      <div className="bg-amber-500 h-full w-[12%]" />
                    </div>
                  </div>

                </div>

                {/* Left hand details line chart */}
                <div className="lg:col-span-8 bg-[#0A0D1A]/70 border border-[#141A30] p-6 rounded-2xl">
                  <span className="text-xs font-mono font-bold text-slate-300 block mb-5 pb-2 border-b border-indigo-950">SIGNAL STRENGTH STATUS (LIVE FEED)</span>
                  
                  {/* Fluctuating line chart */}
                  <div className="h-56 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                      <polyline 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="1.5"
                        points="0,25 10,21 20,29 30,22 40,32 50,15 60,18 70,12 80,18 90,36 100,42" 
                      />
                      <path d="M 0 50 L 0 25 L 10 L 20 29 L 30 22 L 40 32 L 50 15 L 60 18 L 70 12 L 80 18 L 90 36 L 100 42 L 100 50 Z" fill="rgba(16,185,129,0.02)" />
                    </svg>
                    <div className="absolute top-2 right-2 text-[10px] text-slate-500 font-mono">
                      Current level: <strong className="text-white">{telemetry.signalStrength} dBm</strong>
                    </div>
                  </div>
                </div>

                {/* Ground Station list */}
                <div className="lg:col-span-4 bg-[#0A0D1A]/70 border border-[#141A30] p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-300 block mb-4 uppercase">Ground Station Links (DSN)</span>
                    
                    <div className="space-y-3 font-mono">
                      <div className="p-3 bg-indigo-950/20 border border-indigo-950 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-white block">Goldstone, USA</strong>
                          <span className="text-slate-500 text-[10px]">34m — Primary uplink</span>
                        </div>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold">ACTIVE</span>
                      </div>

                      <div className="p-3 bg-indigo-950/20 border border-indigo-950 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-white block">Canberra, AUS</strong>
                          <span className="text-slate-500 text-[10px]">70m — Secondary</span>
                        </div>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#1e293b] text-slate-400">STANDBY</span>
                      </div>

                      <div className="p-3 bg-indigo-950/20 border border-indigo-950 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-white block">Madrid, ESP</strong>
                          <span className="text-slate-500 text-[10px]">34m — Tertiary</span>
                        </div>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-500/10 text-indigo-400">SCHEDULED</span>
                      </div>

                      <div className="p-3 bg-indigo-950/20 border border-indigo-950 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-white block">TDRSS Relay</strong>
                          <span className="text-slate-500 text-[10px]">Ku-band link</span>
                        </div>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold">ACTIVE</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Packet logs table */}
                <div className="lg:col-span-12 bg-[#0A0D1A]/70 border border-[#141A30] p-5 rounded-2xl">
                  <span className="text-xs font-mono font-bold text-slate-300 block mb-4 uppercase">Telemetry Log — Last 20 packets</span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-indigo-950/50 pb-2 text-slate-500 font-mono">
                          <th className="py-2.5">TIMESTAMP</th>
                          <th className="py-2.5">PACKET ID</th>
                          <th className="py-2.5">SIZE</th>
                          <th className="py-2.5">LATENCY</th>
                          <th className="py-2.5 text-right">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#141A30]/30 font-mono">
                        <tr>
                          <td className="py-3 text-slate-400">MET 08:07:52</td>
                          <td className="py-3 text-white font-bold">PKT-1037</td>
                          <td className="py-3 text-slate-300">1438 B</td>
                          <td className="py-3 text-slate-300">239 ms</td>
                          <td className="py-3 text-right">
                            <span className="text-emerald-400 px-1 py-0.2 rounded bg-emerald-500/10 text-[10px] font-bold">OK</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 text-slate-400">MET 08:07:39</td>
                          <td className="py-3 text-white font-bold">PKT-1036</td>
                          <td className="py-3 text-slate-300">1228 B</td>
                          <td className="py-3 text-slate-300">294 ms</td>
                          <td className="py-3 text-right">
                            <span className="text-emerald-400 px-1 py-0.2 rounded bg-emerald-500/10 text-[10px] font-bold">OK</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 text-slate-400">MET 08:07:27</td>
                          <td className="py-3 text-white font-bold">PKT-1035</td>
                          <td className="py-3 text-slate-300">1148 B</td>
                          <td className="py-3 text-slate-300">270 ms</td>
                          <td className="py-3 text-right">
                            <span className="text-emerald-400 px-1 py-0.2 rounded bg-emerald-500/10 text-[10px] font-bold">OK</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 text-slate-400">MET 08:07:14</td>
                          <td className="py-3 text-white font-bold">PKT-1034</td>
                          <td className="py-3 text-slate-300">523 B</td>
                          <td className="py-3 text-slate-300">248 ms</td>
                          <td className="py-3 text-right">
                            <span className="text-emerald-400 px-1 py-0.2 rounded bg-emerald-500/10 text-[10px] font-bold">OK</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {activeSubTab === 'orbital' && (
              /* ==========================================
                 SUB-TAB: ORBITAL
                 ========================================== */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
                
                {/* 1. Statistics cards row */}
                <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-4 gap-4">
                  
                  <div className="bg-[#0A0D1A]/80 border border-indigo-950 p-5 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">Altitude</span>
                    <div className="text-2xl font-bold font-mono text-blue-400 mt-2">{telemetry.altitude.toFixed(1)} km</div>
                    <div className="w-full bg-blue-500/10 h-1 rounded mt-3.5">
                      <div className="bg-blue-400 h-full" style={{ width: `${(telemetry.altitude / 600) * 100}%` }} />
                    </div>
                  </div>

                  <div className="bg-[#0A0D1A]/80 border border-indigo-950 p-5 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">Velocity</span>
                    <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">{(telemetry.velocity / 3600).toFixed(3)} km/s</div>
                    <div className="w-full bg-cyan-500/10 h-1 rounded mt-3.5">
                      <div className="bg-cyan-400 h-full" style={{ width: `${(telemetry.velocity / 35000) * 100}%` }} />
                    </div>
                  </div>

                  <div className="bg-[#0A0D1A]/80 border border-indigo-950 p-5 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">Inclination</span>
                    <div className="text-2xl font-bold font-mono text-purple-400 mt-2">51.6°</div>
                    <div className="w-full bg-purple-500/10 h-1 rounded mt-3.5">
                      <div className="bg-purple-400 h-full w-[51.6%]" />
                    </div>
                  </div>

                  <div className="bg-[#0A0D1A]/80 border border-indigo-950 p-5 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">Orbital Period</span>
                    <div className="text-2xl font-bold font-mono text-amber-500 mt-2">92.4 min</div>
                    <div className="w-full bg-amber-500/10 h-1 rounded mt-3.5">
                      <div className="bg-amber-400 h-full w-[72%]" />
                    </div>
                  </div>

                </div>

                {/* Left col parameters */}
                <div className="lg:col-span-4 bg-[#0A0D1A]/70 border border-[#141A30] p-6 rounded-2xl">
                  <span className="text-xs font-mono font-bold text-slate-300 block mb-4 uppercase">Keplerian Elements</span>
                  
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-[#141A30]/55 pb-2">
                      <span className="text-slate-400">Semi-major Axis</span>
                      <strong className="text-white">6786.1 km</strong>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#141A30]/55 pb-2">
                      <span className="text-slate-400">Eccentricity</span>
                      <strong className="text-white">0.000148</strong>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#141A30]/55 pb-2">
                      <span className="text-slate-400">RAAN angle</span>
                      <strong className="text-white">247.5°</strong>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#141A30]/55 pb-2">
                      <span className="text-slate-400">Arg. of Perigee</span>
                      <strong className="text-white">92.1°</strong>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#141A30]/55 pb-2">
                      <span className="text-slate-400">Apoapsis altitude</span>
                      <strong className="text-white">414 km</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Periapsis altitude</span>
                      <strong className="text-white">402 km</strong>
                    </div>
                  </div>
                </div>

                {/* Animated real-time ground track map */}
                <div className="lg:col-span-8 bg-[#0A0D1A]/70 border border-[#141A30] p-6 rounded-2xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase">Ground Track — Real-Time Flight Path</span>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded animate-pulse">ANIMATING</span>
                  </div>

                  <div className="h-52 w-full bg-[#050812] border border-[#141A30] rounded-xl relative overflow-hidden flex items-center justify-center">
                    
                    {/* Simulated vector track map projection design overlay */}
                    <div className="absolute inset-0 opacity-15" style={{ 
                      backgroundImage: 'radial-gradient(#1e293b 0.75px, #050812 0.75px)', 
                      backgroundSize: '12px 12px' 
                    }} />

                    <svg className="w-full h-full absolute inset-0 text-indigo-500/20" viewBox="0 0 100 50">
                      {/* Sine wave path represent ground satellite path projection */}
                      <path d="M 0 25 Q 25 5, 50 25 T 100 25" fill="none" stroke="#3b82f6" strokeWidth="1.2" strokeDasharray="3,3" />
                      {/* Blinking actual coordinate dot */}
                      <circle cx={(telemetry.timestamp % 100)} cy={25 + Math.sin(telemetry.timestamp / 50) * 15} r="3" fill="#10b981" className="animate-ping" />
                      {/* Glowing sat indicator */}
                      <circle cx={(telemetry.timestamp % 100)} cy={25 + Math.sin(telemetry.timestamp / 50) * 15} r="2" fill="#10b981" />
                    </svg>

                    <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-400">
                      Lat: {telemetry.latitude.toFixed(2)}N, Lon: {telemetry.longitude.toFixed(2)}E
                    </div>

                    <div className="absolute top-2 right-3 text-[9px] font-mono text-slate-500 uppercase">
                      Ground Speed: {(telemetry.velocity / 3.6).toFixed(1)} m/s
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#141A30]/50 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Stability Orbit Score</span>
                      <strong className="text-emerald-400">STABLE (98.2%)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Altitude Profile</span>
                      <strong className="text-white">Nominal Space Path</strong>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeSubTab === 'alerts' && (
              /* ==============================================================================
                 SUB-TAB: ALERTS ARCHITECTURE (APOPHTHEGMS / INCIDENTS LOG)
                 ============================================================================== */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
                
                {/* Left hand list detailing active alerts (Span 7) */}
                <div className="lg:col-span-7 bg-[#0A0D1A]/70 border border-[#141A30] p-6 rounded-2xl flex flex-col">
                  
                  <div className="flex items-center justify-between mb-4 border-b border-indigo-950 pb-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-300 uppercase block">ACTIVE ALERTS / SENSOR ANOMALIES</span>
                      <span className="text-[10px] text-slate-500">Clique em qualquer Alerta para navegar no painel correspondente</span>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-650 animate-pulse bg-red-500 text-black font-bold">
                      {alerts.length} ACTIVE
                    </span>
                  </div>

                  <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[500px] pr-2">
                    {alerts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-[#060810]/30 rounded-xl border border-dashed border-[#141A30]/50">
                        <CheckCircle className="w-8 h-8 text-emerald-400 mb-2.5 animate-pulse" />
                        <h4 className="text-sm font-bold text-slate-300">NENHUMA ANOMALIA IDENTIFICADA</h4>
                        <p className="text-xs text-slate-400 mt-1">Todos os barramentos operando sob limiares ótimos.</p>
                      </div>
                    ) : (
                      alerts.map((item, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => navigateToRelevantTabFromAlert(item.system)}
                          className="group p-4 rounded-xl bg-[#141220]/80 border border-red-500/20 hover:border-red-500/50 hover:bg-slate-900/40 cursor-pointer flex items-center justify-between gap-4 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 animate-ping" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono tracking-wider font-bold text-red-400 bg-red-500/10 px-1.5 py-0.2 rounded">
                                  {item.system}
                                </span>
                                <span className="text-xs text-white font-bold group-hover:underline">
                                  {item.message.split(':')[0]}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-sans mt-1">
                                {item.message}
                              </p>
                              <span className="text-[10px] font-mono text-slate-500 mt-2 block">
                                MET {item.timestamp} - Clicar para Investigar Erro
                              </span>
                            </div>
                          </div>
                          
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition-colors" />
                        </div>
                      ))
                    )}
                  </div>

                </div>

                {/* Right hand stats visual chart representation (Span 5) */}
                <div className="lg:col-span-5 bg-[#0A0D1A]/70 border border-[#141A30] p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-300 block mb-4 uppercase">ALERT STATISTICS & CRITICALITY</span>
                    
                    {/* Symmetrical bar chart showing categories */}
                    <div className="h-56 w-full relative pt-2">
                      <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                        {/* Thermal Bar */}
                        <rect x="10" y={telemetry.temperature > thresholds.temperatureMax ? "15":"44"} width="10" height={telemetry.temperature > thresholds.temperatureMax ? "30":"1"} fill="#ef4444" rx="1" />
                        {/* Comms Bar */}
                        <rect x="30" y={telemetry.signalStrength < -(thresholds.signalMin + 50) ? "15":"44"} width="10" height={telemetry.signalStrength < -(thresholds.signalMin + 50) ? "30":"1"} fill="#f59e0b" rx="1" />
                        {/* Energy Bar */}
                        <rect x="50" y={telemetry.battery < thresholds.batteryMin ? "10":"44"} width="10" height={telemetry.battery < thresholds.batteryMin ? "35":"1"} fill="#ef4444" rx="1" />
                        {/* Orbital Bar */}
                        <rect x="70" y={telemetry.attitudeError > thresholds.attitudeMax ? "25":"44"} width="10" height={telemetry.attitudeError > thresholds.attitudeMax ? "20":"1"} fill="#a78bfa" rx="1" />
                      </svg>

                      {/* Labels */}
                      <div className="flex justify-between text-[8px] font-mono text-slate-500 mt-2 uppercase">
                        <span className={telemetry.temperature > thresholds.temperatureMax ? "text-red-400 font-bold":""}>Thermal</span>
                        <span className={telemetry.signalStrength < -(thresholds.signalMin + 50) ? "text-amber-400 font-bold":""}>Comms</span>
                        <span className={telemetry.battery < thresholds.batteryMin ? "text-red-400 font-bold":""}>Energy</span>
                        <span className={telemetry.attitudeError > thresholds.attitudeMax ? "text-indigo-400 font-bold":""}>Orbital</span>
                      </div>
                    </div>

                    <div className="space-y-3 font-mono text-xs mt-6 pt-6 border-t border-[#141A30]">
                      <div className="flex justify-between items-center text-red-400">
                        <span>CRITICALITY SEVERITY HIGH</span>
                        <span className="font-bold">{alerts.filter(x => x.severity === 'CRITICAL').length}</span>
                      </div>
                      <div className="flex justify-between items-center text-amber-400">
                        <span>CRITICALITY SEVERITY LOW</span>
                        <span className="font-bold">{alerts.filter(x => x.severity === 'WARNING').length}</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>
        ) : (
          /* =================================================================================
             📲 INTEGRATED PORTABLE CODESET AND EXPO EXPORTER SECTION (ACADEMIC VALIDATION)
             ================================================================================= */
          <div className="rounded-2xl border border-indigo-950 bg-[#0A0F1D]/75 p-6" id="exporter_module">
            
            <div className="border-b border-indigo-950/50 pb-4 mb-5">
              <span className="text-[10px] tracking-widest font-mono text-emerald-400 block font-bold mb-1">CUMPRIMENTO DAS DIRETRIZES DA GLOBAL SOLUTION</span>
              <h2 className="text-white text-xl font-bold tracking-tight">Exportador de Código Fonte - React Native + Expo Router</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-4xl leading-relaxed">
                Este gerador extrai a arquitetura completa do aplicativo mobile de acordo com as exigências técnicas da Global Solution.
                Sinalizadores de alertas integrados com o AsyncStorage interno para guardar preferências mesmo em episódios de offline profundo.
              </p>
            </div>

            {/* PAINEL DE CONEXÃO VS CODE & SIMULADOR QR CODE EXPO */}
            <div className="mb-8 p-6 rounded-2xl bg-[#090D1C] border border-indigo-900/40 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-teal-500/5 to-transparent rounded-full pointer-events-none" />
              
              <div className="flex items-center gap-2 border-b border-indigo-950/50 pb-3 mb-5">
                <Terminal className="w-5 h-5 text-teal-400 animate-pulse" />
                <h3 className="text-xs font-bold font-mono tracking-wider text-white uppercase">Painel de Integração VS Code & Execução QR Code no Celular</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Column: VS Code steps */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider block mb-2">💻 COMO EXECUTAR ESTE PROJETO LOCALMENTE NO VS CODE</span>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      Siga o guia passo a passo para carregar e rodar os códigos de telemetria preditiva do satélite no seu editor VS Code local e testar no seu próprio telefone via QR Code.
                    </p>

                    <div className="space-y-3">
                      {/* Step 1 */}
                      <div className="flex gap-3 items-start">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/30 font-mono text-[10px] text-teal-400 shrink-0 font-bold mt-0.5">1</div>
                        <div className="text-xs">
                          <strong className="text-slate-200 block mb-0.5">Estruture o Projeto:</strong> Crie uma pasta vazia e inicialize o projeto Expo React Native digitando <code className="bg-[#05070D] px-1.5 py-0.5 rounded text-teal-400 font-mono text-[11px] border border-indigo-950">npx create-expo-app@latest</code> ou copie os arquivos gerados no painel inferior para as respectivas pastas de seu projeto existente de Global Solution.
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex gap-3 items-start">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/30 font-mono text-[10px] text-teal-400 shrink-0 font-bold mt-0.5">2</div>
                        <div className="text-xs">
                          <strong className="text-slate-200 block mb-0.5">Prepare as Dependências:</strong> Adicione o gerenciador de persistência local instalando:
                          <div className="mt-1.5 bg-[#05070D] px-2.5 py-1.5 rounded text-emerald-400 font-mono text-[10px] border border-indigo-950 max-w-full overflow-x-auto whitespace-nowrap">
                            npx expo install @react-native-async-storage/async-storage lucide-react-native
                          </div>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex gap-3 items-start">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/30 font-mono text-[10px] text-teal-400 shrink-0 font-bold mt-0.5">3</div>
                        <div className="text-xs">
                          <strong className="text-slate-200 block mb-0.5">Defina o .env local:</strong> No diretório raiz do projeto no seu VS Code, crie um arquivo <code className="bg-[#05070D] px-1 py-0.5 rounded text-teal-400 font-mono">.env</code> e digite seu token de API para autenticar o Diretor de Vôo IA:
                          <div className="mt-1.5 bg-[#05070D] px-2.5 py-1.5 rounded text-cyan-400 font-mono text-[10px] border border-indigo-950 max-w-full overflow-x-auto whitespace-nowrap">
                            GEMINI_API_KEY="COLOQUE_SUA_CHAVE_GEMINI_AQUI"
                          </div>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="flex gap-3 items-start">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/30 font-mono text-[10px] text-teal-400 shrink-0 font-bold mt-0.5">4</div>
                        <div className="text-xs">
                          <strong className="text-slate-200 block mb-0.5">Inicie o servidor de desenvolvimento:</strong> Rode o script abaixo no terminal do VS Code para disparar os canais locais:
                          <div className="mt-1.5 bg-[#05070D] px-2.5 py-1.5 rounded text-emerald-400 font-mono text-[10px] border border-indigo-950 max-w-full overflow-x-auto whitespace-nowrap">
                            npx expo start
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#0c1226]/50 rounded-xl border border-indigo-950/80 text-[10px] font-mono text-slate-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    <span><strong>Nota Importante:</strong> Certifique-se de que celular e computador estejam na mesma rede Wi-Fi ao tentar escanear.</span>
                  </div>
                </div>

                {/* Right Column: QR Code generation workspace */}
                <div className="lg:col-span-5 bg-[#05070E] rounded-xl border border-indigo-950/80 p-5 flex flex-col justify-between gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-indigo-950/80 pb-2">
                      <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider">Simulador de Link QR Code</span>
                      <span className="text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/35 px-1.5 py-0.2 rounded font-bold font-mono">EXPO GO ready</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                      <div>
                        <label className="text-[9px] text-slate-400 block mb-1">Seu IP na rede local:</label>
                        <input 
                          type="text" 
                          value={localIp}
                          onChange={(e) => setLocalIp(e.target.value)}
                          placeholder="e.g. 192.168.1.100"
                          className="w-full bg-[#0a0f1d] border border-indigo-950 rounded-lg px-2.5 py-1.5 text-xs font-mono text-teal-355 text-teal-300 focus:outline-none focus:border-teal-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 block mb-1">Porta Expo local:</label>
                        <input 
                          type="text" 
                          value={localPort}
                          onChange={(e) => setLocalPort(e.target.value)}
                          placeholder="e.g. 8081"
                          className="w-full bg-[#0a0f1d] border border-indigo-950 rounded-lg px-2.5 py-1.5 text-xs font-mono text-teal-355 text-teal-300 focus:outline-none focus:border-teal-500/50"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-slate-400 block mb-1.5">Esquema de Linkagem:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConnectionType('exp')}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                            connectionType === 'exp' 
                              ? 'bg-teal-500/10 border-teal-500/60 text-teal-400 hover:border-teal-400' 
                              : 'bg-[#0a0f1d] border-indigo-950/70 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          exp:// (Expo Go)
                        </button>
                        <button
                          type="button"
                          onClick={() => setConnectionType('http')}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                            connectionType === 'http' 
                              ? 'bg-teal-500/10 border-teal-500/60 text-teal-400 hover:border-teal-400' 
                              : 'bg-[#0a0f1d] border-indigo-950/70 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          http:// (Vela/Mweb)
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#0a0f1d] border border-indigo-950/80 p-2.5 rounded-lg flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500 select-none text-[10px]">Alvo:</span>
                      <span className="text-teal-400 font-bold break-all text-right select-all text-[11px]">
                        {connectionType}://{localIp}:{localPort}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 bg-[#070911] border border-indigo-950/70 rounded-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-teal-500/[0.01] pointer-events-none" />
                    
                    {/* Generates a live QR Code dynamically with a free secure QR API server */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=22d3ee&bgcolor=05070e&data=${encodeURIComponent(`${connectionType}://${localIp}:${localPort}`)}`}
                      alt="Expo Go Quick-scan QR Code"
                      className="w-36 h-36 border border-indigo-950/60 rounded bg-[#05070e] p-2 transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    <span className="text-[9px] font-mono text-slate-500 mt-2 text-center uppercase tracking-wider">
                      Aponte a câmera para escanear
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* File selector lists */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <span className="text-xs font-mono font-bold text-slate-400">ARQUIVOS E COMPONENTES DETALHADOS</span>
                
                <div className="space-y-2.5">
                  {EXPO_FILES.map((fileItem, id) => (
                    <button
                      key={id}
                      onClick={() => setSelectedMobileFile(fileItem)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs transition-colors flex items-start gap-3 ${
                        selectedMobileFile.path === fileItem.path 
                          ? 'bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border-cyan-500/50 text-white' 
                          : 'bg-indigo-950/10 border-indigo-950/30 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <FileCode className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-mono text-[11px] truncate">{fileItem.path}</strong>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{fileItem.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code viewer workspace */}
              <div className="lg:col-span-8 flex flex-col bg-[#05070E] border border-indigo-950 rounded-2xl overflow-hidden min-h-[500px]">
                
                <div className="flex items-center justify-between px-4 py-3 bg-[#0A0E1A] border-b border-indigo-950 text-xs font-mono">
                  <span className="text-slate-400 font-bold">{selectedMobileFile.path}</span>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={performCopyAction}
                      className="px-3 py-1.5 rounded bg-indigo-950 border border-indigo-900/50 hover:bg-indigo-900/40 text-slate-200 flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedText ? 'Copiado!' : 'Copiar'}
                    </button>
                    <button 
                      onClick={performDownloadAction}
                      className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                </div>

                <div className="p-4 overflow-auto flex-1 font-mono text-[11px] text-slate-300 leading-relaxed bg-[#05070E]/80">
                  <pre>{selectedMobileFile.code}</pre>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}
