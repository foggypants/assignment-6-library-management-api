const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let db;
let isMockDb = false;

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
  ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
  : path.resolve(__dirname, '../../serviceAccountKey.json');

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    db = admin.firestore();
  } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    db = admin.firestore();
  } else {
    isMockDb = true;
    const memoryStore = {
      users: new Map(),
      books: new Map(),
      transactions: new Map()
    };

    const createQuery = (collectionName, filters = []) => ({
      where(field, op, value) {
        return createQuery(collectionName, [...filters, { field, op, value }]);
      },
      async get() {
        const store = memoryStore[collectionName] || new Map();
        let items = Array.from(store.values());

        for (const filter of filters) {
          items = items.filter(item => {
            if (filter.op === '==') return item[filter.field] === filter.value;
            if (filter.op === '!=') return item[filter.field] !== filter.value;
            return true;
          });
        }

        return {
          empty: items.length === 0,
          size: items.length,
          docs: items.map(doc => ({
            id: doc.id,
            data: () => ({ ...doc }),
            exists: true
          })),
          forEach(callback) {
            this.docs.forEach(callback);
          }
        };
      }
    });

    db = {
      collection(collectionName) {
        if (!memoryStore[collectionName]) {
          memoryStore[collectionName] = new Map();
        }

        return {
          doc(docId) {
            const id = docId || Math.random().toString(36).substring(2, 12);
            return {
              id,
              async get() {
                const data = memoryStore[collectionName].get(id);
                return {
                  id,
                  exists: !!data,
                  data: () => (data ? { ...data } : undefined)
                };
              },
              async set(data, options = {}) {
                if (options.merge && memoryStore[collectionName].has(id)) {
                  const existing = memoryStore[collectionName].get(id);
                  memoryStore[collectionName].set(id, { ...existing, ...data, id });
                } else {
                  memoryStore[collectionName].set(id, { ...data, id });
                }
                return { writeTime: new Date() };
              },
              async update(data) {
                const existing = memoryStore[collectionName].get(id);
                if (!existing) throw new Error('Document not found');
                memoryStore[collectionName].set(id, { ...existing, ...data });
                return { writeTime: new Date() };
              },
              async delete() {
                memoryStore[collectionName].delete(id);
                return { writeTime: new Date() };
              }
            };
          },
          async add(data) {
            const id = Math.random().toString(36).substring(2, 12);
            const docData = { ...data, id };
            memoryStore[collectionName].set(id, docData);
            return {
              id,
              get: async () => ({ id, exists: true, data: () => ({ ...docData }) })
            };
          },
          where(field, op, value) {
            return createQuery(collectionName, [{ field, op, value }]);
          },
          async get() {
            return createQuery(collectionName).get();
          }
        };
      }
    };
  }
} catch (error) {
  console.error('Firebase initialization error:', error.message);
}

module.exports = { db, admin, isMockDb };
