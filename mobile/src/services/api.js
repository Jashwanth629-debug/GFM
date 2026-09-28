import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  queueOfflineInspection, 
  getOfflineQueue, 
  setOfflineQueue, 
  cacheReferenceData, 
  getCachedReferenceData 
} from './offlineStorage';

const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Android Emulator default; or replace with production endpoint

export async function loginTechnician(email, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    await AsyncStorage.setItem('@glitzup_token', data.token);
    await AsyncStorage.setItem('@glitzup_user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    console.error('Login error:', err);
    throw err;
  }
}

export async function getInspectionTemplates() {
  try {
    const token = await AsyncStorage.getItem('@glitzup_token');
    const res = await fetch(`${API_BASE_URL}/templates`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      await cacheReferenceData(null, data.templates);
      return data.templates;
    }
  } catch (err) {
    console.log('Network unreachable, reading cached templates');
  }
  const cached = await getCachedReferenceData();
  return cached.templates;
}

export async function getClientFacilities() {
  try {
    const token = await AsyncStorage.getItem('@glitzup_token');
    const res = await fetch(`${API_BASE_URL}/facilities`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      await cacheReferenceData(data.facilities, null);
      return data.facilities;
    }
  } catch (err) {
    console.log('Network unreachable, reading cached facilities');
  }
  const cached = await getCachedReferenceData();
  return cached.facilities;
}

// Submit inspection with automatic offline queueing fallback
export async function submitInspection(inspectionPayload) {
  try {
    const token = await AsyncStorage.getItem('@glitzup_token');
    const res = await fetch(`${API_BASE_URL}/inspections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(inspectionPayload)
    });

    if (res.ok) {
      return await res.json();
    }
    // If server responded with error, throw to trigger offline queue
    throw new Error('Server returned non-200');
  } catch (err) {
    console.warn('Network offline or failed. Queuing locally for auto-sync...');
    const queued = await queueOfflineInspection(inspectionPayload);
    return {
      message: 'Saved to local device offline storage',
      inspection_id: queued.id,
      sync_status: 'pending_sync'
    };
  }
}

// Flush and sync all offline queued inspections
export async function syncOfflineQueueToServer() {
  const queue = await getOfflineQueue();
  if (queue.length === 0) return { syncedCount: 0 };

  const token = await AsyncStorage.getItem('@glitzup_token');
  const remaining = [];
  let synced = 0;

  for (const item of queue) {
    try {
      const res = await fetch(`${API_BASE_URL}/inspections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        synced++;
      } else {
        remaining.push(item);
      }
    } catch (e) {
      remaining.push(item);
    }
  }

  await setOfflineQueue(remaining);
  return { syncedCount: synced, remainingCount: remaining.length };
}
