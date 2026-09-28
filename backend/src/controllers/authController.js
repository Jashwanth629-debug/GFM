const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.asyncGet('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        employee_code: user.employee_code
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        employee_code: user.employee_code,
        phone_number: user.phone_number
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await db.asyncGet('SELECT id, email, full_name, role, employee_code, phone_number, badge_number FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTechnicians = async (req, res) => {
  try {
    const technicians = await db.asyncAll(
      "SELECT id, full_name, email, phone_number, employee_code, badge_number FROM users WHERE role = 'field_technician' ORDER BY full_name ASC"
    );
    res.json({ technicians });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Employee PIN Login with Geofencing (Point 4)
exports.pinLogin = async (req, res) => {
  try {
    const { pin, latitude, longitude } = req.body;
    if (!pin || !latitude || !longitude) {
      return res.status(400).json({ error: 'PIN and Location coordinates are required' });
    }

    // 1. Verify PIN
    const user = await db.asyncGet('SELECT * FROM users WHERE pin_code = ? AND role = ?', [pin, 'field_technician']);
    if (!user) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    // 2. Geofence Check (Simulated)
    // The designated office/job site coordinates (e.g., Glitzup HQ)
    const SITE_LAT = 13.0827; // Chennai Example
    const SITE_LNG = 80.2707;
    
    // Simple Pythagorean distance check for demo (in production use Haversine formula)
    const distance = Math.sqrt(Math.pow(latitude - SITE_LAT, 2) + Math.pow(longitude - SITE_LNG, 2));
    const allowedRadius = 0.005; // roughly 500 meters

    if (distance > allowedRadius) {
      return res.status(403).json({ error: 'Access Denied: You are outside the authorized office perimeter.' });
    }

    // 3. Issue Token
    const token = jwt.sign(
      { id: user.id, full_name: user.full_name, role: user.role, employee_code: user.employee_code },
      JWT_SECRET,
      { expiresIn: '12h' } // Shorter expiry for daily shift
    );

    res.json({ message: 'Perimeter verified. Login successful.', token, user: { full_name: user.full_name, role: user.role } });
  } catch (err) {
    console.error('PIN Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
