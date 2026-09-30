function getSeedData() {
  const now = Date.now();

  const services = [
    // Healthcare / Hospital
    {
      id: 'srv_hosp_gen',
      name: 'General OPD Consultation',
      department: 'Hospital',
      codePrefix: 'MED',
      baseDurationMinutes: 10,
      currentDynamicDuration: 14.5,
      recentDurations: [12, 16, 14, 15, 18],
      icon: 'Stethoscope',
      active: true,
      description: 'Standard physician checkup and prescription'
    },
    {
      id: 'srv_hosp_emg',
      name: 'Emergency & Acute Care',
      department: 'Hospital',
      codePrefix: 'EMG',
      baseDurationMinutes: 15,
      currentDynamicDuration: 22,
      recentDurations: [20, 25, 22, 19, 24],
      icon: 'HeartPulse',
      active: true,
      description: 'Urgent critical care triage and stabilization'
    },
    {
      id: 'srv_hosp_rad',
      name: 'Radiology & Imaging',
      department: 'Hospital',
      codePrefix: 'RAD',
      baseDurationMinutes: 15,
      currentDynamicDuration: 13,
      recentDurations: [12, 14, 13, 11, 15],
      icon: 'Scan',
      active: true,
      description: 'X-Ray, MRI, and ultrasound diagnostics'
    },
    {
      id: 'srv_hosp_phr',
      name: 'Pharmacy & Dispensary',
      department: 'Hospital',
      codePrefix: 'PHR',
      baseDurationMinutes: 4,
      currentDynamicDuration: 4.2,
      recentDurations: [3, 5, 4, 4, 5],
      icon: 'Pill',
      active: true,
      description: 'Prescription pickup and dosage guidance'
    },

    // Retail Banking
    {
      id: 'srv_bnk_csh',
      name: 'Cash Deposit & Withdrawal',
      department: 'Bank',
      codePrefix: 'CSH',
      baseDurationMinutes: 4,
      currentDynamicDuration: 3.5,
      recentDurations: [3, 4, 3, 3.5, 4],
      icon: 'Coins',
      active: true,
      description: 'High-speed teller cash transactions'
    },
    {
      id: 'srv_bnk_loa',
      name: 'Loan & Wealth Advisory',
      department: 'Bank',
      codePrefix: 'LOA',
      baseDurationMinutes: 20,
      currentDynamicDuration: 26,
      recentDurations: [24, 28, 25, 27, 30],
      icon: 'TrendingUp',
      active: true,
      description: 'Mortgage, business credit, and portfolio advisory'
    },
    {
      id: 'srv_bnk_kyc',
      name: 'Account Opening & KYC',
      department: 'Bank',
      codePrefix: 'ACC',
      baseDurationMinutes: 12,
      currentDynamicDuration: 13.5,
      recentDurations: [12, 15, 14, 13, 16],
      icon: 'UserCheck',
      active: true,
      description: 'New account onboarding and biometric verification'
    },

    // Government / DMV
    {
      id: 'srv_dmv_lic',
      name: "Driver's License & Real ID",
      department: 'Government Office',
      codePrefix: 'DMV',
      baseDurationMinutes: 10,
      currentDynamicDuration: 12.8,
      recentDurations: [11, 14, 13, 12, 15],
      icon: 'FileBadge',
      active: true,
      description: 'License renewal, test scheduling, and address updates'
    },
    {
      id: 'srv_dmv_pas',
      name: 'Passport & Citizenship Desk',
      department: 'Government Office',
      codePrefix: 'PAS',
      baseDurationMinutes: 18,
      currentDynamicDuration: 21,
      recentDurations: [22, 19, 23, 20, 24],
      icon: 'Globe',
      active: true,
      description: 'Official travel documents and consular services'
    }
  ];

  const counters = [
    {
      id: 'cnt_1',
      counterNumber: 'Room 101 - Dr. Sarah Chen',
      officerName: 'Dr. Sarah Chen, MD',
      department: 'Hospital',
      supportedServiceIds: ['srv_hosp_gen'],
      status: 'BUSY',
      currentTokenId: 'tok_hosp_001',
      throughputMultiplier: 1.1,
      serviceStartedAt: new Date(now - 16 * 60000) // started 16 mins ago, expected 14m -> overdue by 2 mins!
    },
    {
      id: 'cnt_2',
      counterNumber: 'Room 102 - Dr. Marcus Webb',
      officerName: 'Dr. Marcus Webb',
      department: 'Hospital',
      supportedServiceIds: ['srv_hosp_gen', 'srv_hosp_emg'],
      status: 'ACTIVE',
      currentTokenId: null,
      throughputMultiplier: 1.0,
      serviceStartedAt: null
    },
    {
      id: 'cnt_3',
      counterNumber: 'Bay 1 - Emergency Triage',
      officerName: 'Nurse Amanda Cruz, RN',
      department: 'Hospital',
      supportedServiceIds: ['srv_hosp_emg'],
      status: 'BUSY',
      currentTokenId: 'tok_hosp_002',
      throughputMultiplier: 1.25,
      serviceStartedAt: new Date(now - 8 * 60000)
    },
    {
      id: 'cnt_4',
      counterNumber: 'Counter 1 - Fast Cash',
      officerName: 'Alex Mercer',
      department: 'Bank',
      supportedServiceIds: ['srv_bnk_csh'],
      status: 'ACTIVE',
      currentTokenId: null,
      throughputMultiplier: 1.15,
      serviceStartedAt: null
    },
    {
      id: 'cnt_5',
      counterNumber: 'Desk 4 - Loan Officer',
      officerName: 'Clara Oswald',
      department: 'Bank',
      supportedServiceIds: ['srv_bnk_loa'],
      status: 'BUSY',
      currentTokenId: 'tok_bnk_001',
      throughputMultiplier: 0.95,
      serviceStartedAt: new Date(now - 22 * 60000)
    },
    {
      id: 'cnt_6',
      counterNumber: 'Window 3 - DMV Desk',
      officerName: 'Jonathan Miller',
      department: 'Government Office',
      supportedServiceIds: ['srv_dmv_lic', 'srv_dmv_pas'],
      status: 'ACTIVE',
      currentTokenId: null,
      throughputMultiplier: 1.0,
      serviceStartedAt: null
    }
  ];

  const tokens = [
    // --- HOSPITAL TOKENS ---
    // Active / In-progress (Overdue)
    {
      id: 'tok_hosp_001',
      tokenNumber: 'MED-001',
      serviceId: 'srv_hosp_gen',
      serviceName: 'General OPD Consultation',
      department: 'Hospital',
      customerName: 'Robert Langdon',
      customerPhone: '+1 (555) 234-8891',
      priority: 'REGULAR',
      priorityScore: 0,
      status: 'IN_PROGRESS',
      counterId: 'cnt_1',
      counterNumber: 'Room 101 - Dr. Sarah Chen',
      officerName: 'Dr. Sarah Chen, MD',
      createdAt: new Date(now - 45 * 60000),
      calledAt: new Date(now - 17 * 60000),
      serviceStartedAt: new Date(now - 16 * 60000),
      staticEstimatedWaitTimeMinutes: 10,
      dynamicEstimatedWaitTimeMinutes: 14,
      expectedDurationMinutes: 14,
      delayVarianceMinutes: 2,
      delayReason: 'Complex case: diagnostic review underway'
    },
    {
      id: 'tok_hosp_002',
      tokenNumber: 'EMG-001',
      serviceId: 'srv_hosp_emg',
      serviceName: 'Emergency & Acute Care',
      department: 'Hospital',
      customerName: 'Eleanor Vance',
      customerPhone: '+1 (555) 890-1123',
      priority: 'EMERGENCY',
      priorityScore: 100,
      status: 'IN_PROGRESS',
      counterId: 'cnt_3',
      counterNumber: 'Bay 1 - Emergency Triage',
      officerName: 'Nurse Amanda Cruz, RN',
      createdAt: new Date(now - 25 * 60000),
      calledAt: new Date(now - 9 * 60000),
      serviceStartedAt: new Date(now - 8 * 60000),
      staticEstimatedWaitTimeMinutes: 8,
      dynamicEstimatedWaitTimeMinutes: 12,
      expectedDurationMinutes: 20
    },

    // Waiting Queue (Hospital)
    {
      id: 'tok_hosp_003',
      tokenNumber: 'MED-002',
      serviceId: 'srv_hosp_gen',
      serviceName: 'General OPD Consultation',
      department: 'Hospital',
      customerName: 'Evelyn Wright (Senior)',
      customerPhone: '+1 (555) 443-9090',
      priority: 'SENIOR_DISABILITY',
      priorityScore: 50,
      status: 'WAITING',
      createdAt: new Date(now - 20 * 60000),
      staticEstimatedWaitTimeMinutes: 10,
      dynamicEstimatedWaitTimeMinutes: 8,
      estimatedCallTime: new Date(now + 8 * 60000),
      expectedDurationMinutes: 14,
      delayReason: 'Senior priority expedited queue slot'
    },
    {
      id: 'tok_hosp_004',
      tokenNumber: 'MED-003',
      serviceId: 'srv_hosp_gen',
      serviceName: 'General OPD Consultation',
      department: 'Hospital',
      customerName: 'Daniel Kim',
      customerPhone: '+1 (555) 345-6712',
      priority: 'REGULAR',
      priorityScore: 0,
      status: 'WAITING',
      createdAt: new Date(now - 15 * 60000),
      staticEstimatedWaitTimeMinutes: 20,
      dynamicEstimatedWaitTimeMinutes: 22,
      estimatedCallTime: new Date(now + 22 * 60000),
      expectedDurationMinutes: 14,
      delayReason: 'Extended service in progress (+2 min delay)'
    },
    {
      id: 'tok_hosp_005',
      tokenNumber: 'MED-004',
      serviceId: 'srv_hosp_gen',
      serviceName: 'General OPD Consultation',
      department: 'Hospital',
      customerName: 'Priya Sharma',
      customerPhone: '+1 (555) 678-9901',
      priority: 'REGULAR',
      priorityScore: 0,
      status: 'WAITING',
      createdAt: new Date(now - 10 * 60000),
      staticEstimatedWaitTimeMinutes: 30,
      dynamicEstimatedWaitTimeMinutes: 34,
      estimatedCallTime: new Date(now + 34 * 60000),
      expectedDurationMinutes: 14,
      delayReason: 'Higher average consultation time today (~14.5 min)'
    },
    {
      id: 'tok_hosp_006',
      tokenNumber: 'RAD-001',
      serviceId: 'srv_hosp_rad',
      serviceName: 'Radiology & Imaging',
      department: 'Hospital',
      customerName: 'Arthur Dent',
      customerPhone: '+1 (555) 881-2299',
      priority: 'REGULAR',
      priorityScore: 0,
      status: 'WAITING',
      createdAt: new Date(now - 5 * 60000),
      staticEstimatedWaitTimeMinutes: 15,
      dynamicEstimatedWaitTimeMinutes: 13,
      estimatedCallTime: new Date(now + 13 * 60000),
      expectedDurationMinutes: 13
    },

    // Completed Tokens (Hospital History)
    {
      id: 'tok_hosp_comp_1',
      tokenNumber: 'MED-000',
      serviceId: 'srv_hosp_gen',
      serviceName: 'General OPD Consultation',
      department: 'Hospital',
      customerName: 'Lucas Grey',
      priority: 'REGULAR',
      status: 'COMPLETED',
      counterNumber: 'Room 101 - Dr. Sarah Chen',
      officerName: 'Dr. Sarah Chen, MD',
      createdAt: new Date(now - 75 * 60000),
      calledAt: new Date(now - 60 * 60000),
      serviceStartedAt: new Date(now - 59 * 60000),
      serviceCompletedAt: new Date(now - 45 * 60000),
      staticEstimatedWaitTimeMinutes: 10,
      dynamicEstimatedWaitTimeMinutes: 14,
      expectedDurationMinutes: 10,
      actualDurationMinutes: 14,
      delayVarianceMinutes: 4,
      notes: 'Prescribed follow-up blood work'
    },

    // --- BANKING TOKENS ---
    {
      id: 'tok_bnk_001',
      tokenNumber: 'LOA-001',
      serviceId: 'srv_bnk_loa',
      serviceName: 'Loan & Wealth Advisory',
      department: 'Bank',
      customerName: 'Harrison Ford',
      customerPhone: '+1 (555) 912-3844',
      priority: 'REGULAR',
      status: 'IN_PROGRESS',
      counterId: 'cnt_5',
      counterNumber: 'Desk 4 - Loan Officer',
      officerName: 'Clara Oswald',
      createdAt: new Date(now - 35 * 60000),
      calledAt: new Date(now - 23 * 60000),
      serviceStartedAt: new Date(now - 22 * 60000),
      staticEstimatedWaitTimeMinutes: 20,
      dynamicEstimatedWaitTimeMinutes: 26,
      expectedDurationMinutes: 26,
      actualDurationMinutes: null
    },
    {
      id: 'tok_bnk_002',
      tokenNumber: 'CSH-001',
      serviceId: 'srv_bnk_csh',
      serviceName: 'Cash Deposit & Withdrawal',
      department: 'Bank',
      customerName: 'Maria Santos',
      customerPhone: '+1 (555) 123-7744',
      priority: 'REGULAR',
      status: 'WAITING',
      createdAt: new Date(now - 4 * 60000),
      staticEstimatedWaitTimeMinutes: 4,
      dynamicEstimatedWaitTimeMinutes: 3,
      estimatedCallTime: new Date(now + 3 * 60000),
      expectedDurationMinutes: 3.5,
      delayReason: 'Faster processing throughput today'
    },
    {
      id: 'tok_bnk_003',
      tokenNumber: 'LOA-002',
      serviceId: 'srv_bnk_loa',
      serviceName: 'Loan & Wealth Advisory',
      department: 'Bank',
      customerName: 'Thomas Shelby',
      customerPhone: '+1 (555) 777-1234',
      priority: 'VIP',
      priorityScore: 40,
      status: 'WAITING',
      createdAt: new Date(now - 12 * 60000),
      staticEstimatedWaitTimeMinutes: 20,
      dynamicEstimatedWaitTimeMinutes: 24,
      estimatedCallTime: new Date(now + 24 * 60000),
      expectedDurationMinutes: 26,
      delayReason: 'Extended consultation at Loan Desk'
    },

    // --- GOVERNMENT / DMV TOKENS ---
    {
      id: 'tok_dmv_001',
      tokenNumber: 'DMV-001',
      serviceId: 'srv_dmv_lic',
      serviceName: "Driver's License & Real ID",
      department: 'Government Office',
      customerName: 'Chloe Bennett',
      customerPhone: '+1 (555) 432-8765',
      priority: 'REGULAR',
      status: 'WAITING',
      createdAt: new Date(now - 6 * 60000),
      staticEstimatedWaitTimeMinutes: 10,
      dynamicEstimatedWaitTimeMinutes: 12,
      estimatedCallTime: new Date(now + 12 * 60000),
      expectedDurationMinutes: 12.8
    }
  ];

  const analytics = [
    {
      serviceId: 'srv_hosp_gen',
      department: 'Hospital',
      tokenNumber: 'MED-000',
      estimatedMinutes: 10,
      actualMinutes: 14,
      varianceMinutes: 4,
      counterNumber: 'Room 101'
    },
    {
      serviceId: 'srv_hosp_gen',
      department: 'Hospital',
      tokenNumber: 'MED-998',
      estimatedMinutes: 12,
      actualMinutes: 16,
      varianceMinutes: 4,
      counterNumber: 'Room 101'
    },
    {
      serviceId: 'srv_bnk_csh',
      department: 'Bank',
      tokenNumber: 'CSH-992',
      estimatedMinutes: 4,
      actualMinutes: 3,
      varianceMinutes: -1,
      counterNumber: 'Counter 1'
    },
    {
      serviceId: 'srv_dmv_lic',
      department: 'Government Office',
      tokenNumber: 'DMV-990',
      estimatedMinutes: 10,
      actualMinutes: 13,
      varianceMinutes: 3,
      counterNumber: 'Window 3'
    }
  ];

  return {
    services,
    counters,
    tokens,
    analytics
  };
}

module.exports = { getSeedData };
