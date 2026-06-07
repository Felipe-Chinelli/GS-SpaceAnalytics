import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Bell, Sliders } from 'lucide-react-native';
import styles from '../styles';

export default function AlertsTab({
  alerts,
  formTemp,
  setFormTemp,
  formBat,
  setFormBat,
  formSig,
  setFormSig,
  formAtt,
  setFormAtt,
  saveThresholds,
  apiKey,
  saveApiKey,
  recordingKey
}) {
  return (
    <View style={styles.block}>
      
      {/* Urgent Warning Lists Block */}
      <View style={styles.alertLogSection}>
        <View style={styles.alertSectionHeaderRow}>
          <Bell size={14} color="#f87171" />
          <Text style={styles.alertSectionHeaderTitle}>INCIDENTES EM CONEXÃO ATIVOS ({alerts.length})</Text>
        </View>

        {alerts.length === 0 ? (
          <View style={styles.successBox}>
            <Text style={styles.successHeading}>NOMINAL INTEGRITY CONFIRMED</Text>
            <Text style={styles.successBody}>Todos os sistemas mecânicos e elétricos orbitando em estrita segurança.</Text>
          </View>
        ) : (
          alerts.map((al, index) => (
            <View key={index} style={[styles.alertRow, { borderLeftColor: al.severity === 'CRITICAL' ? '#ef4444' : '#fbbf24' }]}>
              <View style={styles.flexRowItems}>
                <Text style={[styles.alertSystemTag, { color: al.severity === 'CRITICAL' ? '#f87171' : '#fbbf24' }]}>
                  [{al.system}]
                </Text>
                <Text style={styles.alertSeverityLabel}>{al.severity}</Text>
              </View>
              <Text style={styles.alertMsgText}>{al.msg}</Text>
            </View>
          ))
        )}
      </View>

      {/* Threshold limits Config Block */}
      <View style={styles.panelWide}>
        <View style={styles.limitsFormHeader}>
          <Sliders size={18} color="#2dd4bf" />
          <Text style={styles.limitsFormHeading}>CONFIGURAÇÃO DE COMPORTAMENTO</Text>
        </View>

        <Text style={styles.limitsDesc}>
          Edite as variáveis críticas persistidas localmente no dispositivo para controlar os disparadores de emergência estrutural.
        </Text>

        {/* Threshold Forms */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Temperatura Máxima Recomendável Core (°C)</Text>
          <TextInput
            style={styles.formInput}
            value={formTemp}
            onChangeText={setFormTemp}
            keyboardType="numeric"
            placeholder="Ex. 36"
            placeholderTextColor="#475569"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Subtensão de Bateria Gatilho Mínimo (%)</Text>
          <TextInput
            style={styles.formInput}
            value={formBat}
            onChangeText={setFormBat}
            keyboardType="numeric"
            placeholder="Ex. 93"
            placeholderTextColor="#475569"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Limiar de Enlace de Sinal (33 corresponde a -83dBm)</Text>
          <TextInput
            style={styles.formInput}
            value={formSig}
            onChangeText={setFormSig}
            keyboardType="numeric"
            placeholder="Ex. 33"
            placeholderTextColor="#475569"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Erro Tolerado Atitude ACS Giroscópio (Max °)</Text>
          <TextInput
            style={styles.formInput}
            value={formAtt}
            onChangeText={setFormAtt}
            placeholder="Ex. 0.12"
            placeholderTextColor="#475569"
          />
        </View>

        <TouchableOpacity style={styles.saveSubmitBtn} onPress={saveThresholds}>
          <Text style={styles.saveSubmitText}>SALVAR CONFIGURAÇÕES NO DISPOSITIVO</Text>
        </TouchableOpacity>
      </View>

      {/* API Key management block for Gemini */}
      <View style={styles.panelWide}>
        <Text style={styles.aiSetupTitle}>Configure seu Token de API Gemini</Text>
        <Text style={styles.aiSetupDesc}>
          Necessário para o relatório e parecer de segurança preditiva estrutural da IA se não estiver usando o arquivo .env.
        </Text>
        
        <View style={styles.apiKeyInputContainer}>
          <TextInput
            style={styles.apiKeyInput}
            secureTextEntry={true}
            placeholder="DIGITE SUA GEMINI_API_KEY AQUI"
            placeholderTextColor="#475569"
            value={apiKey}
            onChangeText={saveApiKey}
          />
        </View>

        {recordingKey && (
          <Text style={styles.savedTextAlert}>✓ Token de API salvo no AsyncStorage!</Text>
        )}
      </View>
    </View>
  );
}
