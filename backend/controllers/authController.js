const bcrypt = require('bcryptjs');
const { Users, Counters } = require('../database/store');
const { generateToken } = require('../middleware/authMiddleware');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = {
  // 1. Customer Registration
  registerCustomer: async (req, res) => {
    try {
      const { name, email, password, phone = '' } = req.body;

      // Validate required fields
      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Full name is required (minimum 2 characters).'
        });
      }

      if (!email || !EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.'
        });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.'
        });
      }

      // Explicitly reject any attempt to elevate privileges through public registration
      if (req.body.role && req.body.role !== 'CUSTOMER') {
        return res.status(403).json({
          success: false,
          message: 'Public registration is only permitted for Customers. Staff and Admin accounts must be created by an authorized administrator.'
        });
      }

      // Check if email is already in use
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await Users.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.'
        });
      }

      // Secure password hash
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userId = 'usr_cust_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

      const newUser = await Users.create({
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'CUSTOMER',
        phone: phone.trim(),
        department: 'ALL',
        active: true,
        lastLoginAt: new Date()
      });

      const token = generateToken(newUser);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to NexusQueue.',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone
        }
      });
    } catch (err) {
      console.error('[Auth] Registration error:', err);
      return res.status(500).json({
        success: false,
        message: 'Registration failed due to a server error. Please try again.'
      });
    }
  },

  // 2. User Login (Customer, Staff, Admin)
  login: async (req, res) => {
    try {
      const { email, password, portalRole } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.'
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = await Users.findOne({ email: normalizedEmail });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No account found with this email address. Please check your credentials or sign up.'
        });
      }

      // Verify bcrypt password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password. Please verify and try again.'
        });
      }

      if (user.active === false) {
        return res.status(403).json({
          success: false,
          message: 'This account has been deactivated. Please contact an administrator.'
        });
      }

      // Role compatibility verification
      if (portalRole) {
        const expected = portalRole.toUpperCase();
        if (expected === 'CUSTOMER' && user.role !== 'CUSTOMER') {
          return res.status(403).json({
            success: false,
            message: `Notice: This is the Customer Portal. Your account is registered with ${user.role} privileges. Please switch to the ${user.role} Login.`
          });
        }

        if (expected === 'STAFF' && user.role !== 'STAFF' && user.role !== 'ADMIN') {
          return res.status(403).json({
            success: false,
            message: 'Access Denied: Officer credentials required. Customer accounts cannot access the Staff Officer Terminal.'
          });
        }

        if (expected === 'ADMIN' && user.role !== 'ADMIN') {
          return res.status(403).json({
            success: false,
            message: 'Access Denied: Administrator security clearance required. Public or staff accounts cannot access the Admin Console.'
          });
        }
      }

      // Update last login timestamp
      await Users.updateOne({ id: user.id }, { lastLoginAt: new Date() });

      const token = generateToken(user);

      return res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department || 'ALL',
          counterId: user.counterId || '',
          counterNumber: user.counterNumber || '',
          phone: user.phone || ''
        }
      });
    } catch (err) {
      console.error('[Auth] Login error:', err);
      return res.status(500).json({
        success: false,
        message: 'Login failed due to a server error. Please try again.'
      });
    }
  },

  // 3. Get Current User Profile
  getMe: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department || 'ALL',
          counterId: user.counterId || '',
          counterNumber: user.counterNumber || '',
          phone: user.phone || ''
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // 4. Admin creates a Staff Officer Account
  createStaffAccount: async (req, res) => {
    try {
      const { name, email, password, department = 'Hospital', counterId = '', counterNumber = '' } = req.body;

      if (!name || name.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Staff name is required.' });
      }

      if (!email || !EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Valid email address is required.' });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: 'Staff password must be at least 6 characters long.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existing = await Users.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const staffId = 'usr_staff_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

      const newStaff = await Users.create({
        id: staffId,
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'STAFF',
        department,
        counterId,
        counterNumber,
        active: true
      });

      return res.status(201).json({
        success: true,
        message: `Staff account for ${newStaff.name} created successfully!`,
        staff: {
          id: newStaff.id,
          name: newStaff.name,
          email: newStaff.email,
          role: newStaff.role,
          department: newStaff.department,
          counterId: newStaff.counterId,
          counterNumber: newStaff.counterNumber
        }
      });
    } catch (err) {
      console.error('[Auth] Create staff error:', err);
      return res.status(500).json({ success: false, message: 'Failed to create staff account.' });
    }
  },

  // 5. Admin fetches all Staff Officer Accounts
  getStaffAccounts: async (req, res) => {
    try {
      const allStaff = await Users.find({ role: 'STAFF' });
      const sanitized = allStaff.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        role: s.role,
        department: s.department || 'ALL',
        counterId: s.counterId || '',
        counterNumber: s.counterNumber || '',
        active: s.active !== false,
        createdAt: s.createdAt,
        lastLoginAt: s.lastLoginAt
      }));

      return res.json({
        success: true,
        count: sanitized.length,
        data: sanitized
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // 6. Authorized Admin Setup Check / Bootstrap
  getAdminStatus: async (req, res) => {
    try {
      const adminCount = await Users.countDocuments({ role: 'ADMIN' });
      return res.json({
        success: true,
        hasAdmin: adminCount > 0,
        adminCount
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};
