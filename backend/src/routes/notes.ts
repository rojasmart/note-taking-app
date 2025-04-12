import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Note from "../models/Note"; // Importando o modelo de nota

const router = express.Router();

// Obter todas as notas
router.get("/", async (req: Request, res: Response) => {
  try {
    // Aqui você usaria seu modelo para buscar as notas
    const notes = await Note.find();

    // Por enquanto, retorne um array vazio ou um array de exemplo
    res.json(notes);
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
router.delete("/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    console.log(`Tentando excluir nota com ID: ${req.params.id}`);

    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log(`ID inválido: ${req.params.id}`);
      return res.status(400).json({ message: "ID de nota inválido" });
    }

    // Buscar a nota primeiro
    const noteToDelete = await Note.findById(req.params.id);

    // Verificar se a nota existe
    if (!noteToDelete) {
      console.log(`Nota não encontrada com ID: ${req.params.id}`);
      return res.status(404).json({ message: "Nota não encontrada" });
    }

    // Excluir a nota
    await Note.deleteOne({ _id: req.params.id });

    console.log(`Nota excluída com sucesso: ${req.params.id}`);

    // Retornar sucesso
    return res.json({
      message: `Nota ${req.params.id} excluída com sucesso`,
      deletedNote: {
        _id: noteToDelete._id,
        title: noteToDelete.title,
      },
    });
  } catch (error) {
    console.error("Erro ao excluir nota:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return res.status(500).json({
      message: "Erro ao excluir nota",
      error: errorMessage,
    });
  }
});

export default router;
