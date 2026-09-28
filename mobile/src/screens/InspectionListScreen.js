import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity
} from 'react-native';

export default function InspectionListScreen({ user, onNewInspection, onLogout }) {
  const sampleTasks = [
    {
      id: 'task-1',
      inspection_number: 'GZ-2026-TK-804',
      client: 'ITC Grand Chola Luxury Hotel',
      type: 'Termite Barrier Inspection',
      time: 'Today, 09:15 AM',
      status: 'pending_review'
    },
    {
      id: 'task-2',
      inspection_number: 'GZ-2026-RD-792',
      client: 'Apollo Main Hospital - Greams Rd',
      type: 'Rodent Control & Bait Audit',
      time: 'Yesterday, 02:00 PM',
      status: 'approved'
    },
    {
      id: 'task-3',
      inspection_number: 'GZ-2026-CK-761',
      client: 'DLF Cybercity Block 5',
      type: 'Subterranean Termite Treatment',
      time: '18 Mar, 11:00 AM',
      status: 'flagged_investigation'
    }
  ];

  const renderStatus = (status) => {
    switch (status) {
      case 'approved':
        return <Text style={[styles.badge, styles.badgeApproved]}>✓ Approved</Text>;
      case 'pending_review':
        return <Text style={[styles.badge, styles.badgePending]}>⏳ Pending QA</Text>;
      case 'flagged_investigation':
        return <Text style={[styles.badge, styles.badgeFlagged]}>⚠ Flagged QA</Text>;
      default:
        return <Text style={styles.badge}>{status}</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Field Specialist</Text>
          <Text style={styles.headerTitle}>{user?.full_name || 'Rajesh Kumar'}</Text>
          <Text style={styles.badgeCode}>GZ-TECH-042 • Chennai Hub</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Action Banner */}
      <View style={styles.banner}>
        <View>
          <Text style={styles.bannerTitle}>Ready for On-Site Inspection?</Text>
          <Text style={styles.bannerSub}>GPS Geotagging & AI Vision Enabled</Text>
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={onNewInspection}>
          <Text style={styles.newBtnText}>+ New Check</Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <View style={styles.listSection}>
        <Text style={styles.listTitle}>Assigned Compliance Tasks</Text>
        <FlatList
          data={sampleTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskNumber}>{item.inspection_number}</Text>
                {renderStatus(item.status)}
              </View>
              <Text style={styles.taskClient}>{item.client}</Text>
              <Text style={styles.taskType}>{item.type}</Text>
              <Text style={styles.taskTime}>{item.time}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    backgroundColor: '#012341',
    paddingTop: 45,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerSub: {
    fontSize: 10,
    color: '#F1C40F',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  badgeCode: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  logoutBtnText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: 'bold'
  },
  banner: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#012341'
  },
  bannerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  newBtn: {
    backgroundColor: '#012341',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10
  },
  newBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  listSection: {
    flex: 1,
    paddingHorizontal: 16
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  taskNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#012341'
  },
  taskClient: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A'
  },
  taskType: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2
  },
  taskTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 'bold'
  },
  badgeApproved: {
    backgroundColor: '#DCFCE7',
    color: '#166534'
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
    color: '#92400E'
  },
  badgeFlagged: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B'
  }
});
