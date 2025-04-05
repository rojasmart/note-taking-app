import express, { Request, Response } from 'express';

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
router.post('/', (req: Request, res: Response) => {
  res.status(201).json({ 
    message: 'Nota criada com sucesso', 
    note: req.body 
  });
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