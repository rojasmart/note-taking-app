import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Note from "../models/Note"; // Importando o modelo de nota

const router = express.Router();

// Obter todas as notas
router.get("/", async (req: Request, res: Response) => {
  try {
    // Aqui você usaria seu modelo para buscar as notas
    // const notes = await Note.find();

    // Por enquanto, retorne um array vazio ou um array de exemplo
    res.json([
      // Exemplo de notas
      {
        _id: "1",
        title: "Primeira Nota",
        content: "Conteúdo da primeira nota",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["tag1", "tag2"],
      },
      {
        _id: "2",
        title: "Segunda Nota",
        content: "Conteúdo da segunda nota",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["tag3"],
      },
    ]);
  } catch (error) {
    console.error("Erro ao buscar notas:", error);
    res.status(500).json({ message: "Erro ao buscar notas" });
  }
});

// Obter uma nota pelo ID
router.get("/:id", (req: Request, res: Response) => {
  res.json({ message: `Retornar nota com ID: ${req.params.id}` });
});

// Criar uma nova nota
router.post("/", async (req: Request, res: Response) => {
  try {
    console.log("Received note data:", req.body);

    // Criar um ID temporário para userId se não estiver presente
    // Isso é apenas para desenvolvimento, na produção você usaria autenticação
    const userId = req.body.userId || new mongoose.Types.ObjectId();

    const newNote = {
      title: req.body.title || "Untitled Note",
      content: req.body.content || "",
      userId: userId,
      tags: req.body.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Creating note with data:", newNote);

    // Criar a nota no banco de dados
    const savedNote = await Note.create(newNote);

    console.log("Note created successfully:", savedNote);
    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Error creating note:", error);

    // Verificar o tipo de erro para acessar a propriedade message com segurança
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    res.status(500).json({
      message: "Error creating note",
      error: errorMessage,
    });
  }
});

// Atualizar uma nota
router.put("/:id", (req: Request, res: Response) => {
  res.json({
    message: `Nota ${req.params.id} atualizada`,
    note: req.body,
  });
});

// Excluir uma nota
router.delete("/:id", (req: Request, res: Response) => {
  res.json({ message: `Nota ${req.params.id} excluída` });
});

export default router;
