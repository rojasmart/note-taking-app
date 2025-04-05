import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import notesRoutes from './routes/notes';

// Carrega as variáveis de ambiente
dotenv.config();

// Inicializa a aplicação Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/notes', notesRoutes);

// Rota raiz
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'API de Notas funcionando corretamente!',
    endpoints: {
      notes: '/api/notes'
    }
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});