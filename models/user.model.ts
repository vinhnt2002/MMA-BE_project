import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
require("dotenv").config()

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

enum UserRole {
  GUEST = "guest",
  MEMBER = "member",
  STAFF = "staff",
  ADMIN = "admin",
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: UserRole;
  points?: number 
  isVerified: boolean;
  orders: Array<{ orderId: Schema.Types.ObjectId }>;
  comparePassword: (password: string) => Promise<boolean>;
  signAccessToken: () => void
  signRefreshToken: () => void
}



const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      validate: {
        validator: function (value: string) {
          return emailRegexPattern.test(value);
        },
        message: "please enter a valid email",
      },
      unique: true,
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.GUEST,
    },
    points: { type: Number, default: 0 },
    isVerified: {
      type: Boolean,
      default: false,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
  },
  { timestamps: true }
);

//Hash Password beforce saving
userSchema.pre<IUser>("save", async function (next) {
    if(!this.isModified('password')){
        next()
    }
    
    this.password = await bcrypt.hash(this.password, 10)
    next()
});

//compare password 
userSchema.methods.comparePassword = async function (enteredPassword: string) : Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password)
}


// --------------jwt--------------

//sign access token 
userSchema.methods.signAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", {expiresIn: "5m"});
};

//sign refresh token
userSchema.methods.signRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || "", {expiresIn: "3d"});
};

const userModal : Model<IUser> = mongoose.model("User", userSchema)

export default userModal;