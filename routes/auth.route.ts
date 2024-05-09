import express from 'express';
import { loginUser, logoutUser, registerAccount, updateAccessToken } from '../controllers/auth.controller';
import { isAuthenticated } from '../middleware/auth';

const authRouter = express.Router();

authRouter.post('/register', registerAccount);

authRouter.post('/login', loginUser);

authRouter.get('/logout', isAuthenticated, logoutUser);

authRouter.get('/refresh-token', updateAccessToken);

export default authRouter;
