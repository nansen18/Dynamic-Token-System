const mongoose = require('mongoose');

// Service Schema
const ServiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true }, // 'Hospital', 'Bank', 'Government Office'
  codePrefix: { type: String, required: true }, // 'MED', 'BNK', 'DMV', etc.
  baseDurationMinutes: { type: Number, required: true, default: 10 },
  currentDynamicDuration: { type: Number, required: true, default: 10 },
  recentDurations: [{ type: Number }], // Sliding window of completed service times (minutes)
  icon: { type: String, default: 'Activity' },
  active: { type: Boolean, default: true },
  description: { type: String, default: '' }
}, { timestamps: true });

// Counter Schema
const CounterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  counterNumber: { type: String, required: true }, // e.g. "Counter 1", "Desk 3", "Room 102"
  officerName: { type: String, required: true },
  department: { type: String, required: true },
  supportedServiceIds: [{ type: String }], // Array of service IDs this counter can handle
  status: { 
    type: String, 
    enum: ['ACTIVE', 'ON_BREAK', 'OFFLINE', 'BUSY'], 
    default: 'ACTIVE' 
  },
  currentTokenId: { type: String, default: null },
  throughputMultiplier: { type: Number, default: 1.0 }, // e.g. 1.1 for fast senior officer, 0.9 for trainee
  serviceStartedAt: { type: Date, default: null }
}, { timestamps: true });

// Token Schema
const TokenSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tokenNumber: { type: String, required: true }, // e.g. "HOSP-A101"
  serviceId: { type: String, required: true },
  serviceName: { type: String, required: true },
  department: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, default: '' },
  priority: { 
    type: String, 
    enum: ['REGULAR', 'SENIOR_DISABILITY', 'EMERGENCY', 'VIP'], 
    default: 'REGULAR' 
  },
  priorityScore: { type: Number, default: 0 }, // higher = earlier in line
  status: { 
    type: String, 
    enum: ['WAITING', 'CALLED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW', 'CANCELLED'], 
    default: 'WAITING' 
  },
  counterId: { type: String, default: null },
  counterNumber: { type: String, default: null },
  officerName: { type: String, default: null },
  
  // Timing metrics
  createdAt: { type: Date, default: Date.now },
  staticEstimatedWaitTimeMinutes: { type: Number, default: 10 },
  dynamicEstimatedWaitTimeMinutes: { type: Number, default: 10 },
  estimatedCallTime: { type: Date, default: null },
  calledAt: { type: Date, default: null },
  serviceStartedAt: { type: Date, default: null },
  serviceCompletedAt: { type: Date, default: null },
  
  // Dynamic duration tracking
  expectedDurationMinutes: { type: Number, default: 10 },
  actualDurationMinutes: { type: Number, default: null },
  delayVarianceMinutes: { type: Number, default: 0 }, // actual - expected
  delayReason: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

// Analytics Log Schema
const AnalyticsLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  serviceId: { type: String, required: true },
  department: { type: String, required: true },
  tokenNumber: { type: String, required: true },
  estimatedMinutes: { type: Number, required: true },
  actualMinutes: { type: Number, required: true },
  varianceMinutes: { type: Number, required: true },
  counterNumber: { type: String, default: '' }
});

module.exports = {
  ServiceSchema,
  CounterSchema,
  TokenSchema,
  AnalyticsLogSchema
};
