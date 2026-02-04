// Mock admin credentials (in real app would use database with hashed passwords)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123' // In production, this should be hashed
};

// Mock session storage (in real app would use JWT tokens or session store)
let adminSessions = new Set();

const generateSessionToken = () => {
  return 'admin_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
};

async function doAdminLogin(req, res) {
  try {
    const { username, password } = req.body;
    
    console.log('Admin login attempt:', { username, hasPassword: !!password });
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username และ Password จำเป็นต้องกรอก'
      });
    }
    
    // Check credentials
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      console.log('Invalid credentials for user:', username);
      return res.status(401).json({
        success: false,
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }
    
    // Generate session token
    const sessionToken = generateSessionToken();
    adminSessions.add(sessionToken);
    
    console.log('Admin login successful. Active sessions:', adminSessions.size);
    
    res.status(200).json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      admin: {
        username: username,
        sessionToken: sessionToken,
        loginTime: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function doAdminLogout(req, res) {
  try {
    const { sessionToken } = req.body;
    
    console.log('Admin logout attempt with token:', sessionToken ? 'present' : 'missing');
    
    if (sessionToken && adminSessions.has(sessionToken)) {
      adminSessions.delete(sessionToken);
      console.log('Session token removed. Active sessions:', adminSessions.size);
    }
    
    res.status(200).json({
      success: true,
      message: 'ออกจากระบบสำเร็จ'
    });
    
  } catch (error) {
    console.error("Admin logout error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function doGetAdminStats(req, res) {
  try {
    // Get parcels from parcels controller storage
    const parcelsController = require('./parcels.controller');
    const parcelsStorage = parcelsController.getParcelsStorage ? parcelsController.getParcelsStorage() : [];
    
    // Calculate statistics
    const totalParcels = parcelsStorage.length;
    const pendingParcels = parcelsStorage.filter(p => p.status === 'pending').length;
    const notifiedParcels = parcelsStorage.filter(p => p.status === 'notified').length;
    const collectedParcels = parcelsStorage.filter(p => p.status === 'collected').length;
    const returnedParcels = parcelsStorage.filter(p => p.status === 'returned').length;
    
    // Calculate percentages
    const total = totalParcels || 1;
    const stats = {
      total: totalParcels,
      pending: pendingParcels,
      notified: notifiedParcels,
      collected: collectedParcels,
      returned: returnedParcels,
      percentages: {
        pending: Math.round((pendingParcels / total) * 100),
        notified: Math.round((notifiedParcels / total) * 100),
        collected: Math.round((collectedParcels / total) * 100),
        returned: Math.round((returnedParcels / total) * 100)
      }
    };
    
    console.log('Admin stats requested. Stats:', stats);
    
    res.status(200).json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Middleware to check admin session
const checkAdminAuth = (req, res, next) => {
  const sessionToken = req.headers['x-admin-token'] || req.body.sessionToken;
  
  console.log('Admin auth check. Token:', sessionToken ? 'present' : 'missing');
  console.log('Active sessions count:', adminSessions.size);
  
  if (!sessionToken) {
    console.log('No session token provided');
    return res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบก่อน - No token provided'
    });
  }
  
  if (!adminSessions.has(sessionToken)) {
    console.log('Invalid or expired session token');
    return res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบก่อน - Invalid session'
    });
  }
  
  console.log('Admin authentication successful');
  next();
};

const adminController = {
  // Admin login
  login: (req, res) => {
    try {
      doAdminLogin(req, res);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Admin logout
  logout: (req, res) => {
    try {
      doAdminLogout(req, res);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Get admin dashboard statistics
  getStats: (req, res) => {
    try {
      doGetAdminStats(req, res);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Auth middleware
  checkAuth: checkAdminAuth,

  // Debug method to check active sessions
  getSessions: (req, res) => {
    res.json({
      success: true,
      activeSessions: adminSessions.size,
      sessions: Array.from(adminSessions)
    });
  }
};

module.exports = adminController;