"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const validateTags = (tags) => {
    return tags.every((tag) => tag.toLowerCase() === tag);
};
const postSchema = new mongoose_1.default.Schema({
    authorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        validate: {
            validator: validateTags,
            message: (props) => `${props.value} contains invalid tag`
        }
    },
}, { timestamps: true });
const postModel = mongoose_1.default.model("Post", postSchema);
exports.default = postModel;
