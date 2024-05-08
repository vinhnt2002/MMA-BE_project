require("dotenv").config();
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import { Request, Response, NextFunction } from "express";
import userModal from "../models/user.model";
import ErrorHandler from "../utils/error-handler";
import {
  getAllUsersServices,
  getUserById,
  updateUserRoleServices,
} from "../services/user.service";
import { redis } from "../utils/redis";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "../utils/cloudinary";

// get all user --admin
export const getAllUsers = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllUsersServices(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// update user role --admin
export const updateUserRole = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, role } = req.body;
      updateUserRoleServices(res, id, role);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
// delete user  --admin
export const deleteUser = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const user = await userModal.findById(id);

      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }

      await user.deleteOne({ id });

      await redis.del(id);

      res.status(200).json({
        success: true,
        message: "delete successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getUserInfo = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      getUserById(userId, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const updateUser = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name } = req.body;
      const userId = req.user?._id;

      const user = await userModal.findById(userId);

      if (email && user) {
        const isEmailExist = await userModal.findOne({ email });
        if (isEmailExist) {
          return next(new ErrorHandler("Email aldready exits", 400));
        }

        user.email = email;
      }

      if (name && user) {
        user.name = name;
      }
      await user?.save();
      await redis.set(userId, JSON.stringify(user));

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const updatePasswordUser = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return next(
          new ErrorHandler("Please enter the old and new password", 400)
        );
      }

      const user = await userModal.findById(req.user?._id).select("+password");

      if (user?.password === undefined) {
        return next(new ErrorHandler("Invalid User", 400));
      }
      const isPasswordMatch = await user?.comparePassword(oldPassword);

      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid Old pasword", 400));
      }

      user.password = newPassword;
      await user?.save();

      await redis.set(req.user?._id, JSON.stringify(user));

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const updateProfilePicture = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body;

      const userId = req.user?._id;

      const user = await userModal.findById(userId);

      if (avatar && user) {
        if (user.avatar.public_id) {
          await deleteImageFromCloudinary(user.avatar.public_id);
        }
        const myCloud = await uploadImageToCloudinary(avatar, "avatars", 150);

        user.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.url,
        };
      }

      res.status(200).json({
        success: true,
        user,
      });

      await user?.save();
      await redis.set(userId, JSON.stringify(user));
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
