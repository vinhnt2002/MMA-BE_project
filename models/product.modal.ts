import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

interface IComment extends Document {
  user: IUser;
  comment: string;
  commentReplies?: IComment[];
}

interface IReview extends Document {
  user: IUser;
  rating: number;
  comment: string;
  commentReplies: IComment[];
}

interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  thumbnail: object;
  category: string;
  reviews: IReview[];
  ratings?: number;
//   purschase?: number;
}

const reviewSchema = new Schema<IReview>({
  user: Object,
  rating: {
    type: Number,
    default: 0,
  },
  comment: String,
  commentReplies: [Object],
});

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  thumbnail: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  category: { type: String, required: true },
  reviews: [reviewSchema],
  ratings: {
    type: Number,
    default: 0,
  },
//   purschase: {
//     type: Number,
//     default: 0,
//   },
});

const productModel: Model<IProduct> = mongoose.model("Product", productSchema);
export default productModel;
