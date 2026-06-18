import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

let app;
let auth;
let database;
let storage;

export async function initializeCloud() {
  const response = await fetch("/api/firebase-config");
  const config = await response.json().catch(() => ({}));
  if (!response.ok || !config.apiKey || !config.projectId) {
    throw new Error(config.error || "Configuração do Firebase indisponível.");
  }
  app = initializeApp(config);
  auth = getAuth(app);
  database = getFirestore(app);
  storage = getStorage(app);
  return { auth, database, storage };
}

export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export function currentUser() {
  return auth?.currentUser || null;
}

export async function getIdToken() {
  if (!auth?.currentUser) throw new Error("Sessão expirada. Entre novamente.");
  return auth.currentUser.getIdToken();
}

export async function listDocuments(collectionName) {
  const snapshot = await getDocs(collection(database, collectionName));
  return snapshot.docs.map((item) => ({ id: item.id, ...normalizeDocument(item.data()) }));
}

export async function getDocument(collectionName, id) {
  const snapshot = await getDoc(doc(database, collectionName, String(id)));
  return snapshot.exists() ? { id: snapshot.id, ...normalizeDocument(snapshot.data()) } : null;
}

export async function createDocument(collectionName, value) {
  const reference = await addDoc(collection(database, collectionName), {
    ...value,
    createdAt: value.createdAt || serverTimestamp()
  });
  return reference.id;
}

export function saveDocument(collectionName, id, value) {
  return setDoc(doc(database, collectionName, String(id)), value, { merge: true });
}

export function removeDocument(collectionName, id) {
  return deleteDoc(doc(database, collectionName, String(id)));
}

export async function seedSchoolDocuments(names) {
  const existing = await listDocuments("schools");
  const normalized = new Set(existing.map((school) => normalizeName(school.name)));
  const missing = names.filter((name) => !normalized.has(normalizeName(name)));
  for (let offset = 0; offset < missing.length; offset += 400) {
    const batch = writeBatch(database);
    missing.slice(offset, offset + 400).forEach((name) => {
      const key = slugify(name);
      batch.set(doc(database, "schools", key), {
        name,
        source: "escolas.xlsx",
        createdAt: serverTimestamp()
      }, { merge: true });
    });
    await batch.commit();
  }
}

export async function createComplaint({ schoolId, schoolName, severity, report, files }) {
  const complaintRef = doc(collection(database, "complaints"));
  const attachments = [];

  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `complaints/${complaintRef.id}/${Date.now()}-${safeName}`;
    await uploadBytes(ref(storage, path), file, { contentType: file.type || "application/octet-stream" });
    attachments.push({ name: file.name, type: file.type, size: file.size, path });
  }

  const now = new Date();
  const year = now.getFullYear();
  const metaRef = doc(database, "meta", `sequence-${year}`);

  try {
    return await runTransaction(database, async (transaction) => {
      const metaSnapshot = await transaction.get(metaRef);
      const sequence = (metaSnapshot.data()?.value || 0) + 1;
      const number = `${String(sequence).padStart(3, "0")}/${year}`;
      transaction.set(metaRef, { value: sequence, updatedAt: serverTimestamp() });
      transaction.set(complaintRef, {
        number,
        sequence,
        year,
        schoolId,
        schoolName,
        severity,
        report,
        attachments,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid || null,
        createdByEmail: auth.currentUser?.email || null
      });
      return number;
    });
  } catch (error) {
    await Promise.allSettled(attachments.map((item) => deleteObject(ref(storage, item.path))));
    throw error;
  }
}

export async function removeComplaint(complaint) {
  await Promise.allSettled((complaint.attachments || []).map((item) => deleteObject(ref(storage, item.path))));
  await removeDocument("complaints", complaint.id);
}

export function attachmentUrl(path) {
  return getDownloadURL(ref(storage, path));
}

function normalizeDocument(value) {
  const result = { ...value };
  if (value.createdAt?.toDate) result.createdAt = value.createdAt.toDate().toISOString();
  if (value.updatedAt?.toDate) result.updatedAt = value.updatedAt.toDate().toISOString();
  return result;
}

function normalizeName(value = "") {
  return value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function slugify(value) {
  return normalizeName(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}
