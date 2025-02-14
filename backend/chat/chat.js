import supabase from "../config/db.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiverUsername, text } = req.body; // Expecting receiver's username
    const senderId = req.user.id; // Sender from authentication

    if (!receiverUsername) {
      return res.status(400).json({ error: "Receiver username is required" });
    }

    // step 1: Find Receiver ID by Username
    const { data: receiverData, error: receiverError } = await supabase
      .from("users")
      .select("id")
      .eq("username", receiverUsername) // Find user by username
      .single();

    if (receiverError || !receiverData) {
      return res.status(404).json({ error: "Receiver does not exist" });
    }

    // receiverData looks like { id: "33" }
    const receiverId = receiverData.id;

    // step 2: Insert Message into `messages` Table
    const { data: messageData, error: messageError } = await supabase
      .from("messages")
      .insert([{ sender_id: senderId, text, created_at: new Date() }])
      .select("id")
      .single();

    if (messageError) throw new Error(messageError.message);

    const messageId = messageData.id;

    // step 3: Insert Message Recipient into `message_recipients` Table
    const { error: recipientError } = await supabase
      .from("message_recipients")
      .insert([{ message_id: messageId, receiver_id: receiverId }]);

    if (recipientError) throw new Error(recipientError.message);

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const senderId = req.user.id; // Authenticated user (sender)
    const receiverUsername = req.params.username; // Receiver's username from URL

    // step 1: Find Receiver ID by Username
    const { data: receiverData, error: receiverError } = await supabase
      .from("users")
      .select("id")
      .eq("username", receiverUsername)
      .single();

    if (receiverError || !receiverData) {
      return res.status(404).json({ error: "Receiver does not exist" });
    }

    const receiverId = receiverData.id;

    // step 2: Fetch Messages Between Sender and Receiver
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select(
        "id, sender_id, text, created_at, message_recipients!inner(receiver_id)"
      ) // Join message_recipients
      .or(
        `and(sender_id.eq.${senderId}, message_recipients.receiver_id.eq.${receiverId}),
           and(sender_id.eq.${receiverId}, message_recipients.receiver_id.eq.${senderId})`
      ) // Messages where sender/receiver match
      .order("created_at", { ascending: true });

    if (messagesError) throw new Error(messagesError.message);

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
