// src/models/Post.js
import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  userId: {
    type: String, 
    required: true,
  },
  username: String,
  userImage: String,
  
  caption: {
    type: String,
  },
  location: String,
  
  // Media Info (From Cloudinary)
  mediaUrl: String, 
  mediaType: {
    type: String,
    enum: ['image', 'video', 'text'], 
    default: 'image'
  },
  
  // Post Types
  postType: {
    type: String,
    enum: ['post', 'reel', 'event', 'confession', 'notice'],
    default: 'post'
  },
  
  // Extra data
  likes: {
    type: [String], 
    default: []
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// This check prevents "Model already defined" errors in Next.js
export default mongoose.models.Post || mongoose.model("Post", PostSchema);