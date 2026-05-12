import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "Author", required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    room: { type: String, default: "global" },
    reactions: { type: Map, of: String, default: {} },
    replyTo: {
      messageId: { type: mongoose.Schema.Types.ObjectId, default: null },
      senderName: { type: String, default: null },
      text: { type: String, default: null },
    },
  },
  { timestamps: true }
);

messageSchema.index({ room: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);
