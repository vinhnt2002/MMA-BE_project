import { NextFunction, Response, Request } from 'express';
import { CatchAsyncErrors } from '../middleware/catchAsyncErrors';
import userModal from '../models/user.model';
import ErrorHandler from '../utils/error-handler';
import { accessTokenOptions, refreshTokenOptions, sendToken } from '../utils/jwt';
import { redis } from '../utils/redis';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from 'dotenv';
config();
//register
export const registerAccount = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, avatar } = req.body;

    const isEmailExist = await userModal.findOne({ email });

    if (isEmailExist) {
      return next(new ErrorHandler('Email already exits', 400));
    }

    await userModal.create({ name, email, password });

    res.status(200).json({
      success: true,
      message: 'Create successfully'
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// login user
export const loginUser = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler('please enter Email and Password', 400));
    }

    const user = await userModal.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorHandler('Invalid Email or Password', 400));
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return next(new ErrorHandler('Invalid Password', 400));
    }

    //sign token for jwt
    sendToken(user, 200, res);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});

//logout user
export const logoutUser = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.cookie('access_token', '', { maxAge: 1 });
    res.cookie('refresh_token', '', { maxAge: 1 });

    redis.del(req.user?._id);

    res.status(200).json({
      success: true,
      message: 'Logout successfully'
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// update access token by hand
export const updateAccessToken = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refresh_token = req.cookies.refresh_token as string;

    const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;
    const message = 'could not refresh token';

    if (!decoded) {
      return next(new ErrorHandler(message, 400));
    }

    const session = await redis.get(decoded.id as string);
    if (!session) {
      return next(new ErrorHandler(message, 400));
    }

    const user = JSON.parse(session);

    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, { expiresIn: '5m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, { expiresIn: '3d' });

    res.cookie('access_token', accessToken, accessTokenOptions);
    res.cookie('refresh_token', refreshToken, refreshTokenOptions);

    req.user = user;

    res.status(200).json({
      status: 'success',
      accessToken
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});
