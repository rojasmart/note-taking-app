// In your main server file (e.g., app.ts or index.ts)
import express from 'express';
import authRoutes from './routes/auth';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));