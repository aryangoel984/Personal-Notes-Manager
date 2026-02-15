const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key';

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    });

    // CHANGE: Do NOT return a token here. 
    // Just confirm creation so the frontend knows to redirect to the Login page.
    res.status(201).json({ 
      message: 'User created successfully. Please log in.',
      userId: user.id 
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: 'Error creating user' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Token is ONLY generated here
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '7d' });

    res.json({ 
      message: 'Login successful',
      token, 
      user: { id: user.id, email: user.email } 
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: 'Error logging in' });
  }
};