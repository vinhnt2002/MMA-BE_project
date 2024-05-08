import express from 'express'
import { authorized, isAuthenticated } from '../middleware/auth'
import { deleteUser, getAllUsers, getUserInfo, updatePasswordUser, updateProfilePicture, updateUser, updateUserRole } from '../controllers/user.controller'


const userRouter = express.Router()

userRouter.get("/user-info", isAuthenticated , getUserInfo)

userRouter.put("/update-user", isAuthenticated, updateUser)

userRouter.put("/update-user-password", isAuthenticated, updatePasswordUser)

userRouter.put("/update-user-avatar", isAuthenticated, updateProfilePicture)

userRouter.get("/users", isAuthenticated, authorized("admin"), getAllUsers)

userRouter.put("/update-role", isAuthenticated, authorized("admin"), updateUserRole)

userRouter.delete("/delete-user/:id", isAuthenticated, authorized("admin"), deleteUser)


export default userRouter