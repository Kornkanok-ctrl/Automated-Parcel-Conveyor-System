const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");

// Mock database - ในระบบจริงจะเป็น pool.query()
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: '$2b$10$XYZ123', // bcrypt hashed password
    email: 'admin@parcelconveyor.com',
    fullName: 'System Administrator',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    username: 'operator',
    password: '$2b$10$ABC456', // bcrypt hashed password  
    email: 'operator@parcelconveyor.com',
    fullName: 'System Operator',
    role: 'operator',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    username: 'viewer',
    password: '$2b$10$DEF789', // bcrypt hashed password
    email: 'viewer@parcelconveyor.com',
    fullName: 'System Viewer',
    role: 'viewer',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

async function doLogin(req, res) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // ในระบบจริงจะใช้ pool.query() แทน
    // const result = await pool.query(
    //   `SELECT * FROM Users WHERE username = ? AND isActive = 1 LIMIT 1`,
    //   [username]
    // );

    // Mock query result
    const user = mockUsers.find(u => u.username === username && u.isActive);
    
    if (!user) {
      return res.status(401).json({
        accessToken: null,
        message: 'ชื่อผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง',
        success: false
      });
    }

    // ตรวจสอบรหัสผ่าน - ในระบบจริงใช้ bcrypt.compare()
    // const isValidPassword = await bcrypt.compare(password, user.password);
    const isValidPassword = (password === 'admin123' && username === 'admin') ||
                          (password === 'operator123' && username === 'operator') ||
                          (password === 'viewer123' && username === 'viewer');

    if (!isValidPassword) {
      return res.status(401).json({
        accessToken: null,
        message: 'ชื่อผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง',
        success: false
      });
    }

    // สร้าง JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      },
      config.secret || 'parcel-conveyor-secret',
      {
        expiresIn: 86400, // 24 hours
      }
    );

    // กำหนด authorities ตาม role
    let authorities = [];
    switch (user.role) {
      case 'admin':
        authorities.push("ROLE_ADMIN", "ROLE_USER");
        break;
      case 'operator':
        authorities.push("ROLE_OPERATOR", "ROLE_USER");
        break;
      case 'viewer':
        authorities.push("ROLE_VIEWER");
        break;
      default:
        authorities.push("ROLE_USER");
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      roles: authorities,
      accessToken: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function doLogout(req, res) {
  try {
    // ในระบบจริงอาจจะบันทึก logout log หรือ blacklist token
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
}

async function doCheckToken(req, res) {
  try {
    if (!(req.body && req.body.sessions)) {
      return res.status(401).json({
        accessToken: null,
        message: "Unauthorized! (SESSION_NOT_FOUND)",
        success: false
      });
    }

    let token = req.body.sessions;
    let decoded = null;

    jwt.verify(token, config.secret || 'parcel-conveyor-secret', (err, decodedToken) => {
      if (err) {
        return res.status(401).json({
          message: "Unauthorized!",
          success: false
        });
      }
      decoded = decodedToken;
    });

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        message: "Unauthorized!",
        success: false
      });
    }

    // ตรวจสอบ user ในฐานข้อมูล
    // const result = await pool.query(
    //   `SELECT * FROM Users WHERE id = ? AND isActive = 1 LIMIT 1`,
    //   [decoded.id]
    // );

    // Mock query result
    const user = mockUsers.find(u => u.id === decoded.id && u.isActive);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found"
      });
    }

    // สร้าง token ใหม่
    const newToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      },
      config.secret || 'parcel-conveyor-secret',
      {
        expiresIn: 86400, // 24 hours
      }
    );

    // กำหนด authorities
    let authorities = [];
    switch (user.role) {
      case 'admin':
        authorities.push("ROLE_ADMIN", "ROLE_USER");
        break;
      case 'operator':
        authorities.push("ROLE_OPERATOR", "ROLE_USER");
        break;
      case 'viewer':
        authorities.push("ROLE_VIEWER");
        break;
      default:
        authorities.push("ROLE_USER");
    }

    res.status(200).json({
      success: true,
      roles: authorities,
      accessToken: newToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });

  } catch (error) {
    console.error("API (checkToken): ", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function doGetCurrentUser(req, res) {
  try {
    // ได้ userId จาก middleware
    const userId = req.userId;

    // Mock query
    const user = mockUsers.find(u => u.id === userId && u.isActive);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function doGetUsers(req, res) {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let users = [...mockUsers];
    
    // Search functionality
    if (search) {
      users = users.filter(user => 
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = users.slice(startIndex, endIndex);
    
    // Remove sensitive data
    const safeUsers = paginatedUsers.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    }));

    res.status(200).json({
      success: true,
      users: safeUsers,
      totalCount: users.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(users.length / limit)
    });

  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function doCreateUser(req, res) {
  try {
    const { username, password, email, fullName, role = 'viewer' } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: 'Username, password and email are required'
      });
    }

    // ตรวจสอบว่า username หรือ email ซ้ำไหม
    const existingUser = mockUsers.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now(),
      username,
      password: hashedPassword,
      email,
      fullName: fullName || username,
      role,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // เพิ่มใน mock database (ในระบบจริงใช้ pool.query())
    mockUsers.push(newUser);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function doUpdateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const userIndex = mockUsers.findIndex(u => u.id === parseInt(id));
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    mockUsers[userIndex].isActive = isActive;

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      userId: parseInt(id)
    });

  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function doChangePassword(req, res) {
  try {
    const userId = req.userId; // จาก middleware
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required'
      });
    }

    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ตรวจสอบรหัสผ่านเก่า (ในระบบจริงใช้ bcrypt.compare())
    // const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    const isValidPassword = true; // Mock validation

    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'รหัสผ่านปัจจุบัน ไม่ถูกต้อง'
      });
    }

    // Hash รหัสผ่านใหม่
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // อัปเดตรหัสผ่าน
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    mockUsers[userIndex].password = hashedNewPassword;

    res.status(200).json({
      success: true,
      message: 'บันทึกข้อมูลเรียบร้อย'
    });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Export functions
const authController = {
  // Main authentication methods
  signin: (req, res) => {
    try {
      doLogin(req, res);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  logout: (req, res) => {
    try {
      doLogout(req, res);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  checkToken: (req, res) => {
    try {
      doCheckToken(req, res);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  getCurrentUser: (req, res) => {
    try {
      doGetCurrentUser(req, res);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // User management methods
  getUsers: (req, res) => {
    try {
      doGetUsers(req, res);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  createUser: (req, res) => {
    try {
      doCreateUser(req, res);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  updateUserStatus: (req, res) => {
    try {
      doUpdateUserStatus(req, res);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  changePassword: (req, res) => {
    try {
      doChangePassword(req, res);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }
};

module.exports = authController;