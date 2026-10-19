const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { ServiceSchema, CounterSchema, TokenSchema, AnalyticsLogSchema, UserSchema } = require('../models/models');

const DATA_DIR = path.join(__dirname, '..', '.data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isMongoConnected = false;
let ServiceModel = null;
let CounterModel = null;
let TokenModel = null;
let AnalyticsLogModel = null;
let UserModel = null;

// Fallback in-memory / file persistent data store
let memoryStore = {
  services: [],
  counters: [],
  tokens: [],
  analytics: [],
  users: []
};

// Load file persistence if available
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    memoryStore = JSON.parse(raw);
    console.log('[Store] Loaded persistent data from', DATA_FILE);
  } catch (err) {
    console.error('[Store] Error reading store.json, using clean memory store:', err.message);
  }
}

function persistFile() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Store] Error persisting file:', err.message);
  }
}

// Connect to MongoDB with timeout
async function connectDB(uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dynamic_token_system') {
  try {
    console.log(`[Database] Attempting MongoDB connection to: ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // fast fallback if MongoDB daemon isn't up
    });
    isMongoConnected = true;
    console.log('✅ [Database] Connected successfully to MongoDB!');

    ServiceModel = mongoose.model('Service', ServiceSchema);
    CounterModel = mongoose.model('Counter', CounterSchema);
    TokenModel = mongoose.model('Token', TokenSchema);
    AnalyticsLogModel = mongoose.model('AnalyticsLog', AnalyticsLogSchema);
    UserModel = mongoose.model('User', UserSchema);

    // Sync memoryStore to MongoDB if empty
    const serviceCount = await ServiceModel.countDocuments();
    if (serviceCount === 0 && memoryStore.services.length > 0) {
      console.log('[Database] Hydrating MongoDB from local storage...');
      await ServiceModel.insertMany(memoryStore.services);
      await CounterModel.insertMany(memoryStore.counters);
      await TokenModel.insertMany(memoryStore.tokens);
      await AnalyticsLogModel.insertMany(memoryStore.analytics);
      if (memoryStore.users && memoryStore.users.length > 0) {
        await UserModel.insertMany(memoryStore.users);
      }
    }
  } catch (err) {
    isMongoConnected = false;
    console.warn(`⚠️ [Database] MongoDB connection failed (${err.message}).`);
    console.log('🚀 [Database] Seamlessly active in High-Performance Local Embedded Mode (JSON-backed). Zero config needed!');
  }
}

// Universal Model Interface (Works transparently with MongoDB or Embedded JSON)
const Services = {
  find: async (filter = {}) => {
    if (isMongoConnected && ServiceModel) {
      return await ServiceModel.find(filter).lean();
    }
    return memoryStore.services.filter(s => {
      for (const key of Object.keys(filter)) {
        if (s[key] !== filter[key]) return false;
      }
      return true;
    });
  },
  findOne: async (filter = {}) => {
    const list = await Services.find(filter);
    return list[0] || null;
  },
  findById: async (id) => {
    return Services.findOne({ id });
  },
  create: async (data) => {
    const item = { ...data, createdAt: new Date(), updatedAt: new Date() };
    if (isMongoConnected && ServiceModel) {
      const created = await ServiceModel.create(item);
      return created.toObject();
    }
    memoryStore.services.push(item);
    persistFile();
    return item;
  },
  updateOne: async (filter, update) => {
    if (isMongoConnected && ServiceModel) {
      return await ServiceModel.updateOne(filter, update);
    }
    const idx = memoryStore.services.findIndex(s => {
      for (const key of Object.keys(filter)) {
        if (s[key] !== filter[key]) return false;
      }
      return true;
    });
    if (idx !== -1) {
      const updates = update.$set || update;
      memoryStore.services[idx] = { ...memoryStore.services[idx], ...updates, updatedAt: new Date() };
      persistFile();
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  },
  deleteMany: async (filter = {}) => {
    if (isMongoConnected && ServiceModel) {
      return await ServiceModel.deleteMany(filter);
    }
    memoryStore.services = [];
    persistFile();
    return { deletedCount: 0 };
  }
};

const Counters = {
  find: async (filter = {}) => {
    if (isMongoConnected && CounterModel) {
      return await CounterModel.find(filter).lean();
    }
    return memoryStore.counters.filter(c => {
      for (const key of Object.keys(filter)) {
        if (c[key] !== filter[key]) return false;
      }
      return true;
    });
  },
  findOne: async (filter = {}) => {
    const list = await Counters.find(filter);
    return list[0] || null;
  },
  findById: async (id) => {
    return Counters.findOne({ id });
  },
  create: async (data) => {
    const item = { ...data, createdAt: new Date(), updatedAt: new Date() };
    if (isMongoConnected && CounterModel) {
      const created = await CounterModel.create(item);
      return created.toObject();
    }
    memoryStore.counters.push(item);
    persistFile();
    return item;
  },
  updateOne: async (filter, update) => {
    if (isMongoConnected && CounterModel) {
      return await CounterModel.updateOne(filter, update);
    }
    const idx = memoryStore.counters.findIndex(c => {
      for (const key of Object.keys(filter)) {
        if (c[key] !== filter[key]) return false;
      }
      return true;
    });
    if (idx !== -1) {
      const updates = update.$set || update;
      memoryStore.counters[idx] = { ...memoryStore.counters[idx], ...updates, updatedAt: new Date() };
      persistFile();
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  },
  deleteMany: async (filter = {}) => {
    if (isMongoConnected && CounterModel) {
      return await CounterModel.deleteMany(filter);
    }
    memoryStore.counters = [];
    persistFile();
    return { deletedCount: 0 };
  }
};

const Tokens = {
  find: async (filter = {}, sort = { createdAt: 1 }) => {
    if (isMongoConnected && TokenModel) {
      return await TokenModel.find(filter).sort(sort).lean();
    }
    let res = memoryStore.tokens.filter(t => {
      for (const key of Object.keys(filter)) {
        if (filter[key] && typeof filter[key] === 'object' && filter[key].$in) {
          if (!filter[key].$in.includes(t[key])) return false;
        } else if (t[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });

    res.sort((a, b) => {
      // Priority sorting: EMERGENCY (100) > SENIOR_DISABILITY (50) > REGULAR (0)
      if (a.status === 'WAITING' && b.status === 'WAITING') {
        if ((b.priorityScore || 0) !== (a.priorityScore || 0)) {
          return (b.priorityScore || 0) - (a.priorityScore || 0);
        }
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
    return res;
  },
  findOne: async (filter = {}) => {
    const list = await Tokens.find(filter);
    return list[0] || null;
  },
  findById: async (id) => {
    return Tokens.findOne({ id });
  },
  create: async (data) => {
    const item = { ...data, createdAt: new Date(), updatedAt: new Date() };
    if (isMongoConnected && TokenModel) {
      const created = await TokenModel.create(item);
      return created.toObject();
    }
    memoryStore.tokens.push(item);
    persistFile();
    return item;
  },
  updateOne: async (filter, update) => {
    if (isMongoConnected && TokenModel) {
      return await TokenModel.updateOne(filter, update);
    }
    const idx = memoryStore.tokens.findIndex(t => {
      for (const key of Object.keys(filter)) {
        if (t[key] !== filter[key]) return false;
      }
      return true;
    });
    if (idx !== -1) {
      const updates = update.$set || update;
      memoryStore.tokens[idx] = { ...memoryStore.tokens[idx], ...updates, updatedAt: new Date() };
      persistFile();
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  },
  deleteMany: async (filter = {}) => {
    if (isMongoConnected && TokenModel) {
      return await TokenModel.deleteMany(filter);
    }
    memoryStore.tokens = [];
    persistFile();
    return { deletedCount: 0 };
  }
};

const AnalyticsLogs = {
  find: async (filter = {}) => {
    if (isMongoConnected && AnalyticsLogModel) {
      return await AnalyticsLogModel.find(filter).lean();
    }
    return memoryStore.analytics || [];
  },
  create: async (data) => {
    const item = { ...data, timestamp: new Date() };
    if (isMongoConnected && AnalyticsLogModel) {
      const created = await AnalyticsLogModel.create(item);
      return created.toObject();
    }
    if (!memoryStore.analytics) memoryStore.analytics = [];
    memoryStore.analytics.push(item);
    persistFile();
    return item;
  },
  deleteMany: async () => {
    if (isMongoConnected && AnalyticsLogModel) {
      return await AnalyticsLogModel.deleteMany({});
    }
    memoryStore.analytics = [];
    persistFile();
    return { deletedCount: 0 };
  }
};

const Users = {
  find: async (filter = {}, sort = { createdAt: -1 }) => {
    if (isMongoConnected && UserModel) {
      return await UserModel.find(filter).sort(sort).lean();
    }
    const users = (memoryStore.users || []).filter(u => {
      for (const key of Object.keys(filter)) {
        if (typeof filter[key] === 'string' && typeof u[key] === 'string') {
          if (u[key].toLowerCase() !== filter[key].toLowerCase()) return false;
        } else if (u[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
    return users;
  },
  findOne: async (filter = {}) => {
    if (isMongoConnected && UserModel) {
      if (filter.email && typeof filter.email === 'string') {
        const escaped = filter.email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return await UserModel.findOne({ email: new RegExp(`^${escaped}$`, 'i') }).lean();
      }
      return await UserModel.findOne(filter).lean();
    }
    const list = await Users.find(filter);
    return list[0] || null;
  },
  findById: async (id) => {
    return Users.findOne({ id });
  },
  countDocuments: async (filter = {}) => {
    if (isMongoConnected && UserModel) {
      return await UserModel.countDocuments(filter);
    }
    const list = await Users.find(filter);
    return list.length;
  },
  create: async (data) => {
    const item = { ...data, createdAt: new Date(), updatedAt: new Date() };
    if (isMongoConnected && UserModel) {
      const created = await UserModel.create(item);
      return created.toObject();
    }
    if (!memoryStore.users) memoryStore.users = [];
    memoryStore.users.push(item);
    persistFile();
    return item;
  },
  updateOne: async (filter, update) => {
    if (isMongoConnected && UserModel) {
      return await UserModel.updateOne(filter, update);
    }
    if (!memoryStore.users) memoryStore.users = [];
    const idx = memoryStore.users.findIndex(u => {
      for (const key of Object.keys(filter)) {
        if (filter[key] && typeof filter[key] === 'string' && typeof u[key] === 'string') {
          if (u[key].toLowerCase() !== filter[key].toLowerCase()) return false;
        } else if (u[key] !== filter[key]) return false;
      }
      return true;
    });
    if (idx !== -1) {
      const updates = update.$set || update;
      memoryStore.users[idx] = { ...memoryStore.users[idx], ...updates, updatedAt: new Date() };
      persistFile();
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  },
  deleteMany: async (filter = {}) => {
    if (isMongoConnected && UserModel) {
      return await UserModel.deleteMany(filter);
    }
    memoryStore.users = [];
    persistFile();
    return { deletedCount: 0 };
  }
};

module.exports = {
  connectDB,
  Services,
  Counters,
  Tokens,
  AnalyticsLogs,
  Users,
  getMemoryStore: () => memoryStore,
  setMemoryStore: (data) => {
    memoryStore = data;
    persistFile();
  }
};
