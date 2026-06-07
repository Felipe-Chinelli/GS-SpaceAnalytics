import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import styles from '../styles';

export default function DirectorTab({ telemetry, aiLoading, aiReport, aiError, diagnoseSateAndRunAI }) {
  return (
    <View style={styles.block}>
      
      {/* Header Flight Dev Interpreter Panel */}
      <View style={styles.directorHeaderCard}>
        <View style={styles.directorHeaderLeft}>
          <View style={styles.flightInterpreterBadge}>
            <Sparkles size={11} color="#10b981" />
            <Text style={styles.flightInterpreterBadgeText}>FLIGHT DEV INTERPRETER</Text>
          </View>
          <Text style={styles.directorTitle}>Diretor de Vôo Inteligente (IA Gemini-3.5)</Text>
        </View>

        <TouchableOpacity
          disabled={aiLoading}
          style={[styles.directorLaunchBtn, { opacity: aiLoading ? 0.6 : 1 }]}
          onPress={diagnoseSateAndRunAI}
        >
          {aiLoading ? (
            <View style={styles.flexRowItems}>
              <ActivityIndicator size="small" color="#FFFFFF" />
            </View>
          ) : (
            <View style={styles.flexRowItems}>
              <Sparkles size={13} color="#ffffff" />
              <Text style={styles.directorLaunchBtnText}>Consultar Diretor de Vôo IA</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Main AI Report / Empty Status Frame */}
      <View style={styles.directorContentCard}>
        {aiLoading ? (
          <View style={styles.aiLoadingContainer}>
            <ActivityIndicator size="large" color="#818cf8" style={{ marginBottom: 12 }} />
            <Text style={styles.aiProcessingText}>PROCESSANDO PARECER EM ÓRBITA...</Text>
            <Text style={styles.aiProcessingSubtext}>Enviando telemetrias (Temperatura, Bateria, Link de Sinal, Atitude ACS) para o motor inteligente...</Text>
          </View>
        ) : aiReport ? (
          <ScrollView style={styles.aiReportScroll} nestedScrollEnabled={true}>
            <View style={styles.aiReportHeader}>
              <View style={styles.flexRowItems}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' }} />
                <Text style={styles.aiReportHeaderLabel}>RELATÓRIO PREDITIVO ORBITAL</Text>
              </View>
              <Text style={styles.aiReportTimeText}>{new Date().toLocaleTimeString()}</Text>
            </View>

            <View style={styles.aiDivider} />

            <View style={styles.aiReportParamsRow}>
              <Text style={styles.aiParamPill}>TEMP: {telemetry.temperature}°C</Text>
              <Text style={styles.aiParamPill}>BAT: {telemetry.battery}%</Text>
              <Text style={styles.aiParamPill}>SINAL: {telemetry.signalStrength}dBm</Text>
              <Text style={styles.aiParamPill}>ERRO ACS: {telemetry.attitudeError}°</Text>
            </View>

            <View style={styles.aiReportTextContainer}>
              {aiReport.split('\n').map((paragraph, index) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;
                
                const isSubtitle = trimmed.startsWith('1.') || trimmed.startsWith('2.') || trimmed.startsWith('3.') || trimmed.startsWith('**') || trimmed.endsWith(':');
                const cleanText = trimmed.replace(/\*\*/g, '');
                
                return (
                  <Text
                    key={index}
                    style={[
                      styles.aiReportTextLine,
                      isSubtitle && styles.aiReportTextHighlight
                    ]}
                  >
                    {cleanText}
                  </Text>
                );
              })}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.aiMockupEmptyBlock}>
            <View style={styles.aiMockupTerminalBadge}>
              <Text style={styles.aiMockupTerminalText}>&gt;_</Text>
            </View>
            <Text style={styles.aiMockupEmptyTitle}>Nenhum Parecer IA Solicitado</Text>
            <Text style={styles.aiMockupEmptyDesc}>
              Aperte o botão acima para despachar as telemetrias correntes de temperatura, tensão de bateria e giroscópios diretamente ao resolvedor inteligente físico.
            </Text>
          </View>
        )}

        {aiError && (
          <View style={styles.aiErrorContainer}>
            <Text style={styles.aiErrorTitle}>FALHA DE ENLACE IA:</Text>
            <Text style={styles.aiErrorDetail}>{aiError}</Text>
          </View>
        )}
      </View>

    </View>
  );
}
