import { StyleSheet, Platform, Dimensions } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A13'
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoBox: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.2)',
    marginRight: 10
  },
  logoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1
  },
  logoSubtitle: {
    fontSize: 10,
    color: '#94a3b8'
  },
  badgeBox: {
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  badgeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#2dd4bf',
    fontSize: 10,
    fontWeight: 'bold'
  },
  navBarContainer: {
    backgroundColor: '#05070e',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingVertical: 10,
  },
  navBarScroll: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#090d1c',
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 6
  },
  navBtnActive: {
    backgroundColor: '#0d1527',
    borderColor: '#2dd4bf',
  },
  navBtnAlertDanger: {
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b'
  },
  navBtnTextActive: {
    color: '#ffffff'
  },
  bodyScroll: {
    flex: 1
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40
  },
  block: {
    gap: 16
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between'
  },
  cardHalf: {
    width: (Dimensions.get('window').width - 44) / 2,
    backgroundColor: '#090d1c',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
    minHeight: 110
  },
  cardHeaderFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  valText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginVertical: 8
  },
  subCardText: {
    fontSize: 9,
    color: '#475569'
  },
  panelWide: {
    backgroundColor: '#090d1c',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    gap: 12
  },
  flexRowItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  wideCardTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  wideCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  barOuter: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden'
  },
  barInner: {
    height: '100%',
    borderRadius: 3
  },
  barLegends: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  legendText: {
    fontSize: 9,
    color: '#475569',
    fontWeight: 'bold'
  },
  stationsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },
  stationBadge: {
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  stationBadgeText: {
    color: '#22d3ee',
    fontSize: 10,
    fontWeight: 'bold'
  },
  logSection: {
    backgroundColor: '#090d1c',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    gap: 10
  },
  logSectionTitle: {
    fontSize: 10,
    color: '#475569',
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 8
  },
  logRowItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start'
  },
  logTimestamp: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#ea580c',
    fontSize: 10,
    fontWeight: 'bold'
  },
  logEventDetail: {
    flex: 1
  },
  logEventTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  logEventSubText: {
    color: '#64748b',
    fontSize: 9
  },
  sectionHeaderTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  sectionSubText: {
    color: '#64748b',
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 4
  },
  listContainer: {
    gap: 8,
    marginTop: 6
  },
  tableRowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 6,
    alignItems: 'center'
  },
  colHeader: {
    fontSize: 10,
    color: '#475569',
    fontWeight: 'bold',
    flex: 1
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 41, 59, 0.3)',
    paddingVertical: 8,
    alignItems: 'center'
  },
  tableColId: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: 'bold',
    flex: 1
  },
  tableColSys: {
    fontSize: 11,
    color: '#abc4ff',
    flex: 1
  },
  tableColVal: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: 'bold',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  tableColUnit: {
    fontSize: 10,
    color: '#475569',
    flex: 1
  },
  largeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginVertical: 4
  },
  flexRowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  progressRow: {
    gap: 6
  },
  progressLabel: {
    color: '#cbd5e1',
    fontSize: 11
  },
  progressVal: {
    color: '#eab308',
    fontSize: 11,
    fontWeight: 'bold'
  },
  breakdownList: {
    gap: 6,
    marginTop: 4
  },
  breakdownText: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16
  },
  stationList: {
    gap: 10,
    marginTop: 4
  },
  stationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  stationName: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  stationSpec: {
    color: '#64748b',
    fontSize: 9
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1
  },
  statusText: {
    fontSize: 8,
    fontWeight: 'bold'
  },
  commsLogs: {
    gap: 8,
    marginTop: 4
  },
  commsLogRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 41, 59, 0.1)',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center'
  },
  commsLogTime: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  commsLogId: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold'
  },
  commsLogSize: {
    fontSize: 10,
    color: '#475569'
  },
  commsLogStatusOk: {
    fontSize: 9,
    color: '#10b981',
    fontWeight: 'bold',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4
  },
  eclipseBox: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
    gap: 6
  },
  eclipseHeader: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  eclipseBody: {
    color: '#cbd5e1',
    fontSize: 10,
    lineHeight: 14
  },
  geoColumns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4
  },
  geoCell: {
    flex: 1,
    backgroundColor: '#05070e',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1b233a'
  },
  geoLabel: {
    fontSize: 8,
    color: '#475569',
    fontWeight: 'bold'
  },
  geoVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 2
  },
  alertLogSection: {
    backgroundColor: '#090d1c',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    gap: 12
  },
  alertSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 8
  },
  alertSectionHeaderTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  successHeading: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 4
  },
  successBody: {
    color: '#64748b',
    fontSize: 9,
    textAlign: 'center'
  },
  alertRow: {
    padding: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
    borderLeftWidth: 3,
    borderRadius: 6,
    gap: 4
  },
  alertSystemTag: {
    fontSize: 9,
    fontWeight: 'bold'
  },
  alertSeverityLabel: {
    fontSize: 8,
    color: '#475569',
    fontWeight: 'bold'
  },
  alertMsgText: {
    color: '#cbd5e1',
    fontSize: 11
  },
  limitsFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 8
  },
  limitsFormHeading: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  limitsDesc: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10
  },
  formGroup: {
    marginBottom: 14
  },
  formLabel: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 6,
    fontWeight: 'bold'
  },
  formInput: {
    backgroundColor: '#05070e',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#2dd4bf',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13
  },
  saveSubmitBtn: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10
  },
  saveSubmitText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 0.5
  },
  aiSetupTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  aiSetupDesc: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16
  },
  apiKeyInputContainer: {
    backgroundColor: '#05070e',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8
  },
  apiKeyInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#a5b4fc',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  savedTextAlert: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold'
  },
  aiTriggerHeader: {
    flexDirection: 'row',
    gap: 12
  },
  aiTriggerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  aiTriggerDesc: {
    fontSize: 11,
    color: '#64748b'
  },
  aiLaunchBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center'
  },
  aiLaunchBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 0.5
  },
  aiResultBlock: {
    backgroundColor: '#05070e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
    marginTop: 10
  },
  aiResultTitle: {
    color: '#818cf8',
    fontWeight: 'bold',
    fontSize: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 6,
    marginBottom: 8
  },
  aiResultPara: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 8
  },
  aiResultHighlightHeader: {
    color: '#2dd4bf',
    fontWeight: 'bold',
    marginTop: 6
  },
  aiEmptyBlock: {
    alignItems: 'center',
    paddingVertical: 35,
    gap: 8
  },
  aiEmptyText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold'
  },
  aiEmptySubtext: {
    color: '#475569',
    fontSize: 10,
    textAlign: 'center',
    paddingHorizontal: 20
  },
  aiErrorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 10,
    padding: 12,
    marginTop: 12
  },
  aiErrorHeading: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4
  },
  aiErrorText: {
    color: '#f87171',
    fontSize: 10
  },
  directorHeaderCard: {
    backgroundColor: '#090d1c',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  directorHeaderLeft: {
    flex: 1,
    minWidth: 200,
    gap: 6
  },
  flightInterpreterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    gap: 4
  },
  flightInterpreterBadgeText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  directorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  directorLaunchBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  directorLaunchBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 0.5,
    marginLeft: 6
  },
  directorContentCard: {
    backgroundColor: '#090d1c',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    minHeight: 320,
    justifyContent: 'center'
  },
  aiLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 20
  },
  aiProcessingText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6
  },
  aiProcessingSubtext: {
    color: '#475569',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14
  },
  aiReportScroll: {
    width: '100%'
  },
  aiReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  aiReportHeaderLabel: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginLeft: 4
  },
  aiReportTimeText: {
    fontSize: 9,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  aiDivider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 12
  },
  aiReportParamsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  aiParamPill: {
    backgroundColor: '#05070e',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  aiReportTextContainer: {
    gap: 8
  },
  aiReportTextLine: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 16
  },
  aiReportTextHighlight: {
    color: '#2dd4bf',
    fontWeight: 'bold',
    marginTop: 6
  },
  aiMockupEmptyBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12
  },
  aiMockupTerminalBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)'
  },
  aiMockupTerminalText: {
    color: '#818cf8',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold'
  },
  aiMockupEmptyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center'
  },
  aiMockupEmptyDesc: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20
  },
  aiErrorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 10,
    padding: 12,
    marginTop: 12
  },
  aiErrorTitle: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4
  },
  aiErrorDetail: {
    color: '#f87171',
    fontSize: 10
  }
});

export default styles;
