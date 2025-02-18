import { supabase } from "./../config/db.js";

export const sendMessage = async (socket, receiverUsername, text) => {
  try {
    // Step 0: Validate receiverUsername and text using regular expressions
    const ReceiverUserNameRegEx = /^[a-zA-Z0-9_]{3,15}$/;
    if (!ReceiverUserNameRegEx.test(receiverUsername)) {
      return socket.emit("error", "Invalid receiver username");
    }

    const TextRegEx = /^.{1,500}$/;
    if (!TextRegEx.test(text)) {
      return socket.emit("error", "Invalid message text");
    }

    const senderId = socket.user.id; // Get sender from authentication

    // Step 1: Find Receiver ID by Username
    const { data: receiverData, error: receiverError } = await supabase
      .from("users")
      .select("id")
      .eq("username", receiverUsername)
      .single();

    if (receiverError || !receiverData) {
      return socket.emit("error", "Receiver does not exist");
    }

    const receiverId = receiverData.id;

    if (receiverId === senderId) {
      console.warn("⚠️ Cannot send messages to yourself");
      return;
    }

    // Step 2: Insert Message into `messages` Table
    const { data: messageData, error: messageError } = await supabase
      .from("messages")
      .insert([{ sender_id: senderId, text, created_at: new Date() }])
      .select("id, created_at, text, sender_id")
      .single();

    if (messageError) throw new Error(messageError.message);

    const messageId = messageData.id;

    // Step 3: Insert Message Recipient into `message_recipients` Table
    const { error: recipientError } = await supabase
      .from("message_recipients")
      .insert([{ message_id: messageId, receiver_id: receiverId }]);

    if (recipientError) throw new Error(recipientError.message);

    // will log: { id: 1, created_at: '2025-10-10T12:00:00.000Z', text: 'Hello', sender_id: 1, sender_username: 'alice' }

    return {
      id: messageData.id,
      created_at: messageData.created_at,
      text: messageData.text,
      sender_id: messageData.sender_id,
      sender_username: socket.user.username,
    };
  } catch (error) {
    console.error("Error sending message:", error.message);
    socket.emit("error", "Failed to send message");
  }
};

export const getMessages = async (socket, receiverUsername) => {
  try {
    const senderId = socket.user.id;

    // ✅ Validate Receiver Username
    const ReceiverUserNameRegEx = /^[a-zA-Z0-9_]{3,15}$/;
    if (!ReceiverUserNameRegEx.test(receiverUsername)) {
      console.warn("⚠️ Invalid receiver username format");
      return socket.emit("error", "Invalid receiver username");
    }

    // ✅ Step 1: Find Receiver ID by Username
    const { data: receiverData, error: receiverError } = await supabase
      .from("users")
      .select("id")
      .eq("username", receiverUsername)
      .single();

    if (receiverError || !receiverData) {
      console.warn("❌ Receiver does not exist:", receiverError?.message);
      return socket.emit("error", "Receiver does not exist");
    }

    const receiverId = receiverData.id;

    if (receiverId === senderId) {
      console.warn("⚠️ Cannot send messages to yourself");
      return;
    }

    // ✅ Step 2: Fetch Messages Between Sender and Receiver
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select(
        "id, text, sender_id, created_at, message_recipients!inner(receiver_id)"
      )
      .or(`sender_id.eq.${senderId}, sender_id.eq.${receiverId}`)
      .in("message_recipients.receiver_id", [senderId, receiverId])
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error(
        "❌ Database error while fetching messages:",
        messagesError.message
      );
      return socket.emit("error", "Failed to fetch messages");
    }

    // Return messages to the caller
    return {
      messages, // like { id: 1, text: 'Hello', sender_id: 1, created_at: '2025-10-10T12:00:00.000Z' }
      senderUsername: socket.user.username,
      receiverUsername,
    };
  } catch (error) {
    console.error("❌ getMessages Error:", error.message);
    socket.emit("error", "Internal Server Error");
  }
};
