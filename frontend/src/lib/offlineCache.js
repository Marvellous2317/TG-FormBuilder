const DB_NAME = 'digiforms-cache';
const DB_VERSION = 2;
const CHECKLIST_STORE = 'checklists';
const DRAFT_STORE = 'drafts';
const FORM_DRAFT_STORE = 'form-drafts';

function ensureObjectStore(db, storeName, options) {
  if (!db.objectStoreNames.contains(storeName)) {
    db.createObjectStore(storeName, options);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      ensureObjectStore(db, CHECKLIST_STORE, { keyPath: 'key' });
      ensureObjectStore(db, DRAFT_STORE, { keyPath: 'checklistId' });
      ensureObjectStore(db, FORM_DRAFT_STORE, { keyPath: 'checklistId' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveToCache(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CHECKLIST_STORE, 'readwrite');
    tx.objectStore(CHECKLIST_STORE).put({ key, value, cachedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getFromCache(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CHECKLIST_STORE, 'readonly');
    const req = tx.objectStore(CHECKLIST_STORE).get(key);
    req.onsuccess = () => resolve(req.result?.value ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function getCacheTimestamp(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CHECKLIST_STORE, 'readonly');
    const req = tx.objectStore(CHECKLIST_STORE).get(key);
    req.onsuccess = () => resolve(req.result?.cachedAt ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveDraft(checklistId, formData) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DRAFT_STORE, 'readwrite');
    tx.objectStore(DRAFT_STORE).put({
      checklistId,
      formData,
      savedAt: Date.now(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveFormDraft(checklistId, formData) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FORM_DRAFT_STORE, 'readwrite');
    tx.objectStore(FORM_DRAFT_STORE).put({
      checklistId,
      formData,
      savedAt: Date.now(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getDraft(checklistId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DRAFT_STORE, 'readonly');
    const req = tx.objectStore(DRAFT_STORE).get(checklistId);
    req.onsuccess = () => resolve(req.result?.formData ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function getFormDraft(checklistId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FORM_DRAFT_STORE, 'readonly');
    const req = tx.objectStore(FORM_DRAFT_STORE).get(checklistId);
    req.onsuccess = () => resolve(req.result?.formData ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function clearDraft(checklistId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DRAFT_STORE, 'readwrite');
    tx.objectStore(DRAFT_STORE).delete(checklistId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearFormDraft(checklistId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FORM_DRAFT_STORE, 'readwrite');
    tx.objectStore(FORM_DRAFT_STORE).delete(checklistId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
