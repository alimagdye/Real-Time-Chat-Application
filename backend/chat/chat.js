import { supabase } from "./../config/db.js";

export const sendMessage = async (socket, { receiverUsername, text }) => {
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

    // Step 2: Insert Message into `messages` Table
    const { data: messageData, error: messageError } = await supabase
      .from("messages")
      .insert([{ sender_id: senderId, text, created_at: new Date() }])
      .select("id, created_at")
      .single();

    if (messageError) throw new Error(messageError.message);

    const messageId = messageData.id;

    // Step 3: Insert Message Recipient into `message_recipients` Table
    const { error: recipientError } = await supabase
      .from("message_recipients")
      .insert([{ message_id: messageId, receiver_id: receiverId }]);

    if (recipientError) throw new Error(recipientError.message);

    // Notify sender and receiver
    const newMessage = {
      senderUsername: socket.user.username,
      receiverUsername,
      text,
      created_at: messageData.created_at,
    };

    socket.emit("msg:new", newMessage); // Send to sender
    socket.to(receiverId).emit("msg:new", newMessage); // Send to receiver
  } catch (error) {
    console.error("Error sending message:", error.message);
    socket.emit("error", "Failed to send message");
  }
};

// export const sendMessage2 = async (socket, { receiverUsername, text }) => {
//   try {
//     console.log(`📩 Message received: "${text}" from ${socket.user.username} to ${receiverUsername}`);

//     // ✅ Step 1: Validate Input
//     if (!receiverUsername || !text) {
//       return socket.emit("error", "Receiver and message text are required.");
//     }

//     // ✅ Step 2: Find Receiver ID by Username
//     const { data: receiverData, error: receiverError } = await supabase
//       .from("users")
//       .select("id")
//       .eq("username", receiverUsername)
//       .single();

//     if (receiverError || !receiverData) {
//       console.error("❌ Error: Receiver does not exist:", receiverUsername);
//       return socket.emit("error", "Receiver does not exist.");
//     }

//     const receiverId = receiverData.id;
//     console.log(`✅ Found receiver ID: ${receiverId}`);

//     // ✅ Step 3: Insert Message into `messages` Table (WITHOUT receiver_username)
//     const { data: messageData, error: messageError } = await supabase
//       .from("messages")
//       .insert([{ sender_id: socket.user.id, text }]) // ❌ No receiver_username here
//       .select("id, text, sender_id, created_at")
//       .single();

//     if (messageError) {
//       console.error("❌ Database error:", messageError.message);
//       return socket.emit("error", "Failed to send message.");
//     }

//     console.log("✅ Message saved to DB:", messageData);

//     // ✅ Step 4: Insert Message Recipient into `message_recipients`
//     const { error: recipientError } = await supabase
//       .from("message_recipients")
//       .insert([{ message_id: messageData.id, receiver_id: receiverId }]);

//     if (recipientError) {
//       console.error("❌ Error saving recipient:", recipientError.message);
//       return socket.emit("error", "Failed to associate message with receiver.");
//     }

//     console.log("✅ Message recipient saved");

//     // ✅ Step 5: Emit the Message in Real-Time to Sender & Receiver
//     const newMessage = {
//       id: messageData.id,
//       text: messageData.text,
//       senderUsername: socket.user.username, // Attach sender name for UI
//       created_at: messageData.created_at,
//     };

//     socket.emit("msg:new", newMessage); // Send to sender
//     socket.to(receiverId).emit("msg:new", newMessage); // Send to receiver

//     console.log("🚀 Sent messages to client");
//   } catch (error) {
//     console.error("❌ Error handling message:", error.message);
//     socket.emit("error", "Internal Server Error.");
//   }
// };


// export const sendMessage3 = async (socket, messageText, receiverUsername) => {
//   try {
//     const senderId = socket.user.id;
//     const senderUsername = socket.user.username;

//     // ✅ Find receiver ID
//     const { data: receiverData, error: receiverError } = await supabase
//       .from("users")
//       .select("id")
//       .eq("username", receiverUsername)
//       .single();

//     if (receiverError || !receiverData) {
//       return socket.emit("error", "Receiver does not exist");
//     }

//     const receiverId = receiverData.id;

//     // ✅ Save message to database
//     const { data: messageData, error: messageError } = await supabase
//       .from("messages")
//       .insert([{ text: messageText, sender_id: senderId }])
//       .select()
//       .single();

//     if (messageError) {
//       return socket.emit("error", "Failed to send message");
//     }

//     // ✅ Save recipient reference
//     await supabase.from("message_recipients").insert([
//       { message_id: messageData.id, receiver_id: receiverId },
//     ]);

//     // ✅ Emit message event to both users
//     const newMessage = {
//       id: messageData.id,
//       text: messageData.text,
//       sender_id: senderId,
//       created_at: messageData.created_at,
//     };

//     socket.emit("msg:new", newMessage); // Send to sender
//     socket.to(receiverId).emit("msg:new", newMessage); // Send to receiver
//   } catch (error) {
//     socket.emit("error", "Internal Server Error");
//   }
// };

export const getMessages = async (socket, receiverUsername) => {
  try {
    console.log(
      `📡 Fetching messages for conversation with ${receiverUsername}`
    );

    const senderId = socket.user.id;
    const senderUsername = socket.user.username;

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
    console.log(`✅ Found receiver ID: ${receiverId}`);

    // ✅ Step 2: Fetch Messages Between Sender and Receiver
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select(
        "id, text, sender_id, created_at, message_recipients(receiver_id)"
      )
      .eq("message_recipients.receiver_id", receiverId)
      .or(`sender_id.eq.${senderId}, sender_id.eq.${receiverId}`)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error(
        "❌ Database error while fetching messages:",
        messagesError.message
      );
      return socket.emit("error", "Failed to fetch messages");
    }

    console.log("📩 Messages Retrieved:", messages);
    socket.emit("msg:get", {
      messages,
      senderUsername: socket.user.username,
      receiverUsername,
    });

    console.log("🚀 Sent messages to client");
  } catch (error) {
    console.error("❌ getMessages Error:", error.message);
    socket.emit("error", "Internal Server Error");
  }
};
