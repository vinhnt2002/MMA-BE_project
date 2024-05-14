import mongoose, { Document, Model, Schema } from "mongoose";


const validateTags = (tags: string[]) => {
  return tags.every((tag) => tag.toLowerCase() === tag);
};

export interface IPost extends Document {
  authorId: Schema.Types.ObjectId;
  title: string;
  content: string;
  thumbnail: object;
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
    thumbnail: {
      public_id: {
        type: String
      },
      url: {
        type: String
      }
    },
    content: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      validate:{
        validator:validateTags,
        message: (props) => `${props.value} contains invalid tag`
      }
    },
  },
  { timestamps: true }
);

const postModel: Model<IPost> = mongoose.model<IPost>("Post", postSchema);

export default postModel;
