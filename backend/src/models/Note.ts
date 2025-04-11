import mongoose, { Schema, Document } from 'mongoose';

// Interface para tipagem no TypeScript
export interface INote extends Document {
  title: string;
  content: string;
  userId: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema do Mongoose
const NoteSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: true,
    default: 'Untitled Note'
  },
  content: { 
    type: String, 
    default: '' 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  tags: [{ 
    type: String 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Middleware para atualizar o updatedAt sempre que o modelo for atualizado
NoteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Criar e exportar o modelo
export default mongoose.model<INote>('Note', NoteSchema);