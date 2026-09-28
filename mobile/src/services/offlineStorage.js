import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@glitzup_offline_queue';
const CACHE_FACILITIES_KEY = '@glitzup_cached_facilities';
const CACHE_TEMPLATES_KEY = '@glitzup_cached_templates';

// Save an inspection to the offline queue
export async function queueOfflineInspection(inspectionData) {
  try {
    const existing = await getOfflineQueue();
    const queuedItem = {
      ...inspectionData,
      offline_created_at: new Date().toISOString(),
      sync_status: 'pending_sync'
    };
    const updated = [...existing, queuedItem];
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
    return queuedItem;
  } catch (err) {
    console.error('Error queuing offline inspection:', err);
    throw err;
  }
}

// Get all pending offline inspections
export async function getOfflineQueue() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading offline queue:', err);
    return [];
  }
}

// Clear or update the offline queue
export async function setOfflineQueue(queue) {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Error saving queue:', err);
  }
}

// Cache reference data for 100% offline usage
export async function cacheReferenceData(facilities, templates) {
  try {
    if (facilities) {
      await AsyncStorage.setItem(CACHE_FACILITIES_KEY, JSON.stringify(facilities));
    }
    if (templates) {
      await AsyncStorage.setItem(CACHE_TEMPLATES_KEY, JSON.stringify(templates));
    }
  } catch (err) {
    console.error('Error caching reference data:', err);
  }
}

export async function getCachedReferenceData() {
  try {
    const rawFac = await AsyncStorage.getItem(CACHE_FACILITIES_KEY);
    const rawTmpl = await AsyncStorage.getItem(CACHE_TEMPLATES_KEY);
    return {
      facilities: rawFac ? JSON.parse(rawFac) : [],
      templates: rawTmpl ? JSON.parse(rawTmpl) : []
    };
  } catch (err) {
    return { facilities: [], templates: [] };
  }
}
