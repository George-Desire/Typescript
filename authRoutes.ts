import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import User from './user';
import generateToken from './authMiddleware';

interface AuthenticatedRequest extends Request {
    user: any;
}

const router = express.Router();

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid login credentials' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid login credentials' });
        }
        const token = await generateToken(req as AuthenticatedRequest, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Error logging in' });
    }
});

export default router;