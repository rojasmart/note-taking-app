import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
// For a real application, you would use bcrypt to hash passwords
// import bcrypt from 'bcrypt'; 

// This is a simple in-memory user store for demo purposes
// In a real app, you would use a database
const users = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    // In a real app, this would be a hashed password
    password: 'password123'
  }
];

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with that email' });
    }
    
    // In a real app, you would hash the password before storing
    // const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: String(users.length + 1),
      name,
      email,
      password // In a real app, use hashedPassword
    };
    
    // Add to users array (in a real app, save to database)
    users.push(newUser);
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Check if required fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // In a real app, you would compare hashed password
    // const passwordMatch = await bcrypt.compare(password, user.password);
    const passwordMatch = password === user.password; // Simplified for demo
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret', // Use env variable in production
      { expiresIn: '1h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    // In a real app, user would be added to req by the auth middleware
    // For demo purposes, we'll extract from token manually
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as { userId: string };
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};