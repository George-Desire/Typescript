import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from './user';
import dotenv from 'dotenv';
dotenv.config();

const jwtSecret: string | undefined = process.env.JWT_SECRET;

interface AuthenticatedRequest extends Request {
  user: any;
}


  export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];``
  if (!token) {
    return res.status(401).json({ message: 'Missing token' }); }
  try { const decodedToken: any = jwtSecret ? jwt.verify(token, jwtSecret) : null; 
    const user = await User.findById(decodedToken.userId); 
    if (!user) { return res.status(401).json({ message: 'User not found' }); 
  } req.user = user; next(); 
} catch (error) { return res.status(401).json({ message: 'Invalid token' }); 
}
};

export default authMiddleware;
