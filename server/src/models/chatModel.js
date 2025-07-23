import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "AI"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const ChatSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    unique: true,
  },
  messages: [MessageSchema],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const ChatModel = mongoose.model("Chat", ChatSchema);
