import express, { Request, Response } from 'express';
import Note from '../models/Note'; // Importando o modelo de nota

const router = express.Router();

// Obter todas as notas
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Retornar todas as notas' });
});

// Obter uma nota pelo ID
router.get('/:id', (req: Request, res: Response) => {
  res.json({ message: `Retornar nota com ID: ${req.params.id}` });
});

// Criar uma nova nota
router.post('/', async (req: Request, res: Response) => {
  try {
    const newNote = {
      title: req.body.title,
      content: req.body.content,
      userId: req.body.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to database (MongoDB example)
    const savedNote = await Note.create(newNote);
    
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(500).json({ message: 'Error creating note' });
  }
});

// Atualizar uma nota
router.put('/:id', (req: Request, res: Response) => {
  res.json({ 
    message: `Nota ${req.params.id} atualizada`, 
    note: req.body 
  });
});

// Excluir uma nota
router.delete('/:id', (req: Request, res: Response) => {
  res.json({ message: `Nota ${req.params.id} excluída` });
});

export default router;