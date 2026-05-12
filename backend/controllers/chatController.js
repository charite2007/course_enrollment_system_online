import Message from "../models/message.js";

export async function getMessages(req, res) {
  try {
    const room = req.query.room || "global";
    const messages = await Message.find({ room })
      .populate("sender", "Fullname photo")
      .sort({ createdAt: 1 })
      .limit(100);
    return res.json({ messages });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}
