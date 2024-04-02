import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import  {authMiddleware} from './authMiddleware';
import {authzMiddleware} from './authzMiddleware';
import authRoutes from './authRoutes';
import { authSchema } from './val_schema';

const app = express();
const User = require('./user');
const JWT_SECRET = process.env.JWT_SECRET;

mongoose .connect('mongodb+srv://georgedesire06:YeH1dRqfjuhn7rZN@cluster0.hdxcuew.mongodb.net/?ssl=true', {}) .then(() => { console.log('Connected to MongoDB'); }) .catch((error) => { console.log('Error connecting to MongoDB:', error); });

const roomTypeSchema = new mongoose.Schema({ name: String,
});

const RoomType = mongoose.model('RoomType', roomTypeSchema);

const roomSchema = new mongoose.Schema({ name: String, 
  roomType: { type: mongoose.Schema.Types.ObjectId, 
    ref: 'RoomType', }, 
    price: Number,
});

const Room = mongoose.model('Room', roomSchema);

app.use(express.json());
app.use('/auth', authRoutes);

app.get('/admin-only', 
authzMiddleware('admin'), 
(req: Request, res: Response) => 
{ res.json({ message: 'This route is accessible only to admin users' });
});

// Create RoomType
app.post('/api/v1/room-types', 
async (req: Request, res: Response) => 
{ try { const roomType = new RoomType(req.body); 
  await roomType.save(); res.status(201).json(roomType); 
} catch (error: unknown) {
  if (error instanceof Error) {
    res.status(400).json({ error: error.message });
  } else { throw error;
  }
}
});

// Get all RoomTypes
app.get('/api/v1/room-types', 
async (req: Request, res: Response) => 
{ try { const roomTypes = await RoomType.find(); 
  res.json(roomTypes); } 
  catch (error: unknown) {
    if (error instanceof Error) { 
      res.status(500).json({ error: error.message });
    } else { throw error;
    }
  }
});

// Create Room
app.post('/api/v1/rooms', 
async (req: Request, res: Response) => 
{ try { const room = new Room(req.body); 
  await room.save(); res.status(201).json(room); 
} catch (error: unknown) {
  if (error instanceof Error) { 
    res.status(400).json({ error: error.message });
  } else { throw error;
  }
}
});

// Get all Rooms with optional filters
app.get('/api/v1/rooms', 
async (req: Request, res: Response) => 
{ try { const { search, roomType, minPrice, maxPrice } = req.query; 
let filters: any = {}; 
if (search) { filters.name = { $regex: search, $options: 'i' }; 
} if (roomType) { filters.roomType = roomType; 
} if (minPrice && maxPrice) { filters.price = { $gte: parseInt(minPrice as string), 
  $lte: parseInt(maxPrice as string) }; 
} else if (maxPrice) { filters.price = { $lte: parseInt(maxPrice as string) }; 
} else if (minPrice) { filters.price = { $gte: parseInt(minPrice as string) }; 
}

    const rooms = await Room.find(filters);
    res.json(rooms);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else { throw error;
    }
  }
});

// Update Room
app.patch('/api/v1/rooms/:roomId', 
async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params; 
    const room = await Room.findByIdAndUpdate(roomId, 
      req.body, { new: true }); 
      if (!room) { return res.status(404).json({ error: 'Room not found' }); 
    } res.json(room);
  } catch (error: unknown) {
    if (error instanceof Error) { 
      res.status(400).json({ error: error.message });
    } else { throw error;
    }
  }
});

// Delete Room
app.delete('/api/v1/rooms/:roomId', 
async (req: Request, res: Response) => {
  try { const { roomId } = req.params; 
  const room = await Room.findByIdAndDelete(roomId); 
  if (!room) { return res.status(404).json({ error: 'Room not found' }); 
} res.json({ message: 'Room deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else { throw error;
    }
  }
});

// Get Room by ID
app.get('/api/v1/rooms/:roomId', 
async (req: Request, res: Response) => {
  try { const { roomId } = req.params; 
  const room = await Room.findById(roomId); 
  if (!room) { return res.status(404).json({ error: 'Room not found' }); 
} res.json(room); 
} catch (error: unknown) {
  if (error instanceof Error) {
    res.status(500).json({ error: error.message });
  } else { throw error;
  }
}
});

const port = 3435;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
