import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true, index: true },
  receiverId: { type: String, required: true, index: true },
  
  text: { type: String, required: true },
  
  // Future proofing for media in chats
  mediaUrl: String, 
  mediaType: { type: String, default: 'text' },

  isRead: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now, index: true }
});

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);