import dotenv from 'dotenv';
dotenv.config();

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'elaprojects-3212e';
const API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyA71YJKRUr6j4PIoQHpCn72fEG_BXT_OA0';
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/**
 * Convert Firestore document fields JSON to plain JavaScript object
 */
function firestoreDocToObj(doc) {
  if (!doc || !doc.fields) return null;
  const fields = doc.fields;
  const obj = {};
  
  for (const [key, valObj] of Object.entries(fields)) {
    if (valObj.stringValue !== undefined) obj[key] = valObj.stringValue;
    else if (valObj.integerValue !== undefined) obj[key] = parseInt(valObj.integerValue, 10);
    else if (valObj.doubleValue !== undefined) obj[key] = parseFloat(valObj.doubleValue);
    else if (valObj.booleanValue !== undefined) obj[key] = valObj.booleanValue;
    else if (valObj.timestampValue !== undefined) obj[key] = valObj.timestampValue;
    else if (valObj.nullValue !== undefined) obj[key] = null;
    else obj[key] = Object.values(valObj)[0];
  }

  // Ensure ID is present
  if (!obj.id && doc.name) {
    const parts = doc.name.split('/');
    obj.id = parts[parts.length - 1];
  }
  return obj;
}

/**
 * Convert plain JavaScript object to Firestore REST fields format
 */
function objToFirestoreFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (typeof value === 'number') {
      fields[key] = Number.isInteger(value) ? { integerValue: value.toString() } : { doubleValue: value };
    } else {
      fields[key] = { stringValue: String(value) };
    }
  }
  return fields;
}

/**
 * Fetch all sales documents from Firestore collection 'sales_entries'
 */
export async function getFirestoreEntries() {
  try {
    const url = `${FIRESTORE_BASE_URL}/sales_entries?key=${API_KEY}&pageSize=300`;
    const res = await fetch(url);
    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Firestore Warning] Fetch failed (${res.status}): ${errText}`);
      return null;
    }
    const data = await res.json();
    if (!data.documents || !Array.isArray(data.documents)) {
      return [];
    }
    return data.documents.map(firestoreDocToObj).filter(Boolean);
  } catch (error) {
    console.warn(`[Firestore Warning] Connection fallback: ${error.message}`);
    return null;
  }
}

/**
 * Save sales document to Firestore collection 'sales_entries'
 */
export async function saveFirestoreEntry(entry) {
  try {
    const documentId = entry.id;
    const url = `${FIRESTORE_BASE_URL}/sales_entries/${documentId}?key=${API_KEY}`;
    const payload = {
      fields: objToFirestoreFields(entry)
    };
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Firestore Save Warning] Status ${res.status}: ${errText}`);
      return false;
    }
    console.log(`[Firestore] Successfully saved entry ${entry.id} to cloud`);
    return true;
  } catch (error) {
    console.warn(`[Firestore Save Fallback] Error saving entry: ${error.message}`);
    return false;
  }
}

export const firebaseConfig = {
  projectId: PROJECT_ID,
  apiKey: API_KEY,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'elaprojects-3212e.firebasestorage.app'
};
