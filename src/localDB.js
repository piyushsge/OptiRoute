// localDB.js - Local Browser Database Management System for OptiRoute
// Mimics Firebase Auth & Firestore APIs using browser localStorage and events.

const authListeners = new Set();
const dbListeners = {}; // map of key -> Set of listeners

// Helper to notify auth changes
function notifyAuthStateChanged(user) {
  for (const listener of authListeners) {
    listener(user);
  }
}

// Helper to notify Firestore document changes
function notifyDocChanged(key, docSnapshot) {
  if (dbListeners[key]) {
    for (const listener of dbListeners[key]) {
      listener(docSnapshot);
    }
  }
}

export const auth = {
  currentUser: null
};

// Initialize currentUser from local session on startup
try {
  const savedSession = localStorage.getItem('optiroute_auth_session');
  if (savedSession) {
    auth.currentUser = JSON.parse(savedSession);
  }
} catch (e) {
  console.error("Failed to read localDB session:", e);
}

export const db = {};

export async function createUserWithEmailAndPassword(authObj, email, password) {
  // Add a slight network delay simulation
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const usersStr = localStorage.getItem('optiroute_auth_users') || '{}';
  const users = JSON.parse(usersStr);
  
  const normalizedEmail = email.toLowerCase().trim();
  if (users[normalizedEmail]) {
    const err = new Error("Email already in use");
    err.code = 'auth/email-already-in-use';
    throw err;
  }
  
  const uid = 'usr_' + Math.random().toString(36).substring(2, 11);
  users[normalizedEmail] = { uid, password };
  localStorage.setItem('optiroute_auth_users', JSON.stringify(users));
  
  const user = { uid, email: normalizedEmail };
  authObj.currentUser = user;
  localStorage.setItem('optiroute_auth_session', JSON.stringify(user));
  
  // Trigger auth state change
  notifyAuthStateChanged(user);
  
  return { user };
}

export async function signInWithEmailAndPassword(authObj, email, password) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const usersStr = localStorage.getItem('optiroute_auth_users') || '{}';
  const users = JSON.parse(usersStr);
  
  const normalizedEmail = email.toLowerCase().trim();
  const matchedUser = users[normalizedEmail];
  
  if (!matchedUser || matchedUser.password !== password) {
    const err = new Error("Invalid email or password");
    err.code = 'auth/wrong-password';
    throw err;
  }
  
  const user = { uid: matchedUser.uid, email: normalizedEmail };
  authObj.currentUser = user;
  localStorage.setItem('optiroute_auth_session', JSON.stringify(user));
  
  notifyAuthStateChanged(user);
  
  return { user };
}

export async function signOut(authObj) {
  authObj.currentUser = null;
  localStorage.removeItem('optiroute_auth_session');
  notifyAuthStateChanged(null);
}

export function onAuthStateChanged(authObj, callback) {
  authListeners.add(callback);
  // Trigger immediately with current status
  callback(authObj.currentUser);
  
  return () => {
    authListeners.delete(callback);
  };
}

// Mocking Firestore document reference
export function doc(dbObj, collection, id) {
  return {
    collection,
    id,
    key: `optiroute_db_${collection}_${id}`
  };
}

export async function setDoc(docRef, data) {
  localStorage.setItem(docRef.key, JSON.stringify(data));
  
  const snapshot = {
    exists: () => true,
    data: () => data
  };
  notifyDocChanged(docRef.key, snapshot);
}

export async function getDoc(docRef) {
  const dataStr = localStorage.getItem(docRef.key);
  if (!dataStr) {
    return {
      exists: () => false,
      data: () => null
    };
  }
  const data = JSON.parse(dataStr);
  return {
    exists: () => true,
    data: () => data
  };
}

export async function updateDoc(docRef, updateFields) {
  const dataStr = localStorage.getItem(docRef.key);
  let data = dataStr ? JSON.parse(dataStr) : {};
  
  for (const [key, value] of Object.entries(updateFields)) {
    if (value && value._isArrayUnion) {
      if (!Array.isArray(data[key])) {
        data[key] = [];
      }
      for (const item of value.elements) {
        const stringifiedItem = JSON.stringify(item);
        const exists = data[key].some(existing => JSON.stringify(existing) === stringifiedItem);
        if (!exists) {
          data[key].push(item);
        }
      }
    } else {
      data[key] = value;
    }
  }
  
  localStorage.setItem(docRef.key, JSON.stringify(data));
  
  const snapshot = {
    exists: () => true,
    data: () => data
  };
  notifyDocChanged(docRef.key, snapshot);
}

export function arrayUnion(...elements) {
  return {
    _isArrayUnion: true,
    elements
  };
}

export function onSnapshot(docRef, callback) {
  if (!dbListeners[docRef.key]) {
    dbListeners[docRef.key] = new Set();
  }
  dbListeners[docRef.key].add(callback);
  
  // Trigger callback immediately with initial data if exists
  getDoc(docRef).then(snapshot => {
    if (dbListeners[docRef.key] && dbListeners[docRef.key].has(callback)) {
      callback(snapshot);
    }
  });
  
  return () => {
    if (dbListeners[docRef.key]) {
      dbListeners[docRef.key].delete(callback);
    }
  };
}
