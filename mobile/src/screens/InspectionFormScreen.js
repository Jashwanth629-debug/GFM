import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';

export default function InspectionFormScreen({ user, onBack, onComplete }) {
  const [template, setTemplate] = useState('TERMITE');
  const [property, setProperty] = useState('ITC Grand Chola Luxury Hotel, Guindy');
  const [gpsTag, setGpsTag] = useState({ lat: 13.0108, lng: 80.2209, accuracy: 3.8, verified: true });
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // Evidence & AI
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80');
  const [aiDetection, setAiDetection] = useState('Subterranean Termite (98% confidence)');
  const [isAiScanning, setIsAiScanning] = useState(false);

  // Checklist
  const [mudTubes, setMudTubes] = useState(true);
  const [moistureHigh, setMoistureHigh] = useState(true);
  const [chemicalBarrier, setChemicalBarrier] = useState(false);

  // Chemical & Notes
  const [technicianNotes, setTechnicianNotes] = useState('Active mud tubes detected along baseboard skirting. Injected Imidacloprid 30.5% SC solution.');
  const [clientSigner, setClientSigner] = useState('Mr. V. Ramanathan');

  const [submitting, setSubmitting] = useState(false);

  const simulateGps = () => {
    setIsGpsLoading(true);
    setTimeout(() => {
      setGpsTag({
        lat: 13.0105,
        lng: 80.2207,
        accuracy: 2.9,
        verified: true
      });
      setIsGpsLoading(false);
      Alert.alert('GPS Tagged', 'Location confirmed inside ITC Grand Chola Geofence (±2.9m).');
    }, 500);
  };

  const simulateAiDetection = () => {
    setIsAiScanning(true);
    setTimeout(() => {
      setAiDetection('Subterranean Termite (99.4% confidence)');
      setIsAiScanning(false);
      Alert.alert('AI Vision Match', 'Identified: Subterranean Termite (Coptotermes formosanus) with 99.4% confidence.');
    }, 700);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Inspection Submitted',
        'Inspection #GZ-2026-TK-804 has been logged, geotagged, and synced to GlitzUp QA review queue.',
        [{ text: 'OK', onPress: onComplete }]
      );
    }, 800);
  };

  return (
    <View style={styles.container}>
      {/* App Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Field Inspection Form</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Live Mode</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Protocol Template Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Inspection Protocol</Text>
          <View style={styles.tabGroup}>
            {['TERMITE', 'RODENT', 'AFTERCARE', 'FEEDBACK'].map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTemplate(t)}
                style={[styles.tabButton, template === t && styles.tabButtonActive]}
              >
                <Text style={[styles.tabButtonText, template === t && styles.tabButtonTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Site Details & GPS Verification */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>2. Site & GPS Telemetry</Text>
            {gpsTag.verified && (
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedTagText}>✓ Geofence Verified</Text>
              </View>
            )}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardBold}>{property}</Text>
            <Text style={styles.cardSub}>Client: ITC Hotels Group • Mount Road, Guindy</Text>
            
            <View style={styles.gpsRow}>
              <Text style={styles.gpsText}>
                GPS: {gpsTag.lat}°, {gpsTag.lng}° (±{gpsTag.accuracy}m)
              </Text>
              <TouchableOpacity onPress={simulateGps} style={styles.gpsBtn}>
                <Text style={styles.gpsBtnText}>
                  {isGpsLoading ? 'Pinging...' : 'Refresh GPS'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Camera Photo & AI Pest Scan */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>3. Evidence Photo & AI Scan</Text>
            <TouchableOpacity onPress={simulateAiDetection} style={styles.aiScanBtn}>
              <Text style={styles.aiScanBtnText}>
                {isAiScanning ? 'Scanning...' : '✦ AI Vision Scan'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.photoContainer}>
            <Image source={{ uri: photoUrl }} style={styles.photo} />
            {/* AI Bounding Box */}
            <View style={styles.aiBox}>
              <Text style={styles.aiBoxLabel}>{aiDetection}</Text>
              <Text style={styles.aiBoxWatermark}>GPS TAGGED • CHENNAI</Text>
            </View>
          </View>
        </View>

        {/* Checklist */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Inspection Checklist</Text>
          <View style={styles.card}>
            <View style={styles.checkItem}>
              <Text style={styles.checkLabel}>Mud tubes detected</Text>
              <TouchableOpacity
                onPress={() => setMudTubes(!mudTubes)}
                style={[styles.toggleBtn, mudTubes ? styles.toggleActive : styles.toggleInactive]}
              >
                <Text style={styles.toggleText}>{mudTubes ? 'YES' : 'NO'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.checkItem}>
              <Text style={styles.checkLabel}>Moisture level &gt; 18%</Text>
              <TouchableOpacity
                onPress={() => setMoistureHigh(!moistureHigh)}
                style={[styles.toggleBtn, moistureHigh ? styles.toggleActive : styles.toggleInactive]}
              >
                <Text style={styles.toggleText}>{moistureHigh ? 'YES' : 'NO'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.checkItem}>
              <Text style={styles.checkLabel}>Chemical Barrier Intact</Text>
              <TouchableOpacity
                onPress={() => setChemicalBarrier(!chemicalBarrier)}
                style={[styles.toggleBtn, chemicalBarrier ? styles.toggleActive : styles.toggleAlert]}
              >
                <Text style={styles.toggleText}>{chemicalBarrier ? 'YES' : 'NO'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* CIBRC Chemical Formulation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Applied Formulation (CIBRC)</Text>
          <View style={styles.card}>
            <Text style={styles.cardBold}>Imidacloprid 30.5% SC (Bayer Premise)</Text>
            <Text style={styles.cardSub}>Dosage: 10.5 ml / 5L water • CIBRC Reg: CIR-65239/2018</Text>
          </View>
        </View>

        {/* Digital Signatures */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Sign-offs</Text>
          <View style={styles.signatureGrid}>
            <View style={styles.sigCard}>
              <Text style={styles.sigRole}>Technician</Text>
              <Text style={styles.sigName}>Rajesh Kumar</Text>
              <Text style={styles.sigStatus}>✓ Digitally Signed</Text>
            </View>
            <View style={styles.sigCard}>
              <Text style={styles.sigRole}>Client Sign-off</Text>
              <Text style={styles.sigName}>{clientSigner}</Text>
              <Text style={styles.sigStatus}>✓ Client Attended</Text>
            </View>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#012341" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Inspection (Sync Ready)</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#012341',
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 16
  },
  backButton: {
    padding: 4
  },
  backButtonText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: 'bold'
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800'
  },
  badge: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    padding: 16
  },
  section: {
    marginBottom: 18
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#012341',
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  tabGroup: {
    flexDirection: 'row',
    gap: 6
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    alignItems: 'center'
  },
  tabButtonActive: {
    backgroundColor: '#012341'
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569'
  },
  tabButtonTextActive: {
    color: '#FFFFFF'
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  verifiedTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  verifiedTagText: {
    color: '#166534',
    fontSize: 10,
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  cardBold: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A'
  },
  cardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  gpsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#F1F5F9'
  },
  gpsText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#334155'
  },
  gpsBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  gpsBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#012341'
  },
  aiScanBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  aiScanBtnText: {
    color: '#991B1B',
    fontSize: 10,
    fontWeight: 'bold'
  },
  photoContainer: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative'
  },
  photo: {
    width: '100%',
    height: '100%'
  },
  aiBox: {
    position: 'absolute',
    top: 25,
    left: 40,
    right: 40,
    bottom: 25,
    borderWidth: 2,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 8,
    padding: 6,
    justifyContent: 'space-between'
  },
  aiBoxLabel: {
    color: '#FFFFFF',
    backgroundColor: '#DC2626',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold'
  },
  aiBoxWatermark: {
    color: '#F1C40F',
    backgroundColor: '#012341',
    alignSelf: 'flex-end',
    paddingHorizontal: 4,
    fontSize: 8,
    fontFamily: 'monospace'
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9'
  },
  checkLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B'
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6
  },
  toggleActive: {
    backgroundColor: '#10B981'
  },
  toggleInactive: {
    backgroundColor: '#CBD5E1'
  },
  toggleAlert: {
    backgroundColor: '#E11D48'
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  signatureGrid: {
    flexDirection: 'row',
    gap: 10
  },
  sigCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center'
  },
  sigRole: {
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#64748B',
    fontWeight: 'bold'
  },
  sigName: {
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: '#012341',
    marginVertical: 4
  },
  sigStatus: {
    fontSize: 9,
    color: '#166534',
    fontWeight: 'bold'
  },
  submitButton: {
    backgroundColor: '#F1C40F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  submitButtonText: {
    color: '#012341',
    fontSize: 14,
    fontWeight: '800'
  }
});
