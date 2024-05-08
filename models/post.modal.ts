import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPost extends Document {
  authorId: Schema.Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
}

const postSchema: Schema<IPost> = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const postModel: Model<IPost> = mongoose.model<IPost>("Post", postSchema);

export default postModel;
