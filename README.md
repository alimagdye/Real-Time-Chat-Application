# Real-Time Chat Application
A real-time chat application built with Node.js, Express.js, Socket.io, and Supabase, enabling instant messaging with JWT authentication, secure WebSocket communication, and persistent database storage.

## Features
-  Real-time messaging using WebSockets for instant updates
-  User authentication with JWT-protected login/signup
-  Secure WebSocket (Socket.io) connections with authentication middleware
-  Supabase as the database for storing messages and user data
-  Optimized relational database schema for efficient message retrieval
  
## Technologies Used
- Backend: Node.js, Express.js, Socket.io
- Database: Supabase client (PostgreSQL)
- Authentication: JWT, Middleware Protection
- Architecture: WebSockets, Event-driven Communication

## 🚀 Deployment
- The frontend is hosted on Netlify
- The backend is deployed on Railway, handling authentication and WebSocket connections.
- Database is hosted on Supabase

## Testing the App
You can test the app by visiting the following link: [Meow Chat](https://meow-chat.netlify.app/index.html).

Use the following account credentials to log in:

    Username: user1
    Password: User@111

    Username: user2
    Password: User@222

Alternatively, you can sign up for a new account directly within the app.
 
## Setup & Installation

1. Clone the repository:
```
git clone https://github.com/alimagdye/Real-Time-Chat-Application.git
cd real-time-chat-app
```
2. Install dependencies:
```
npm install
```
3. Set up Supabase and add your credentials in .env:
```
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=your_jwt_expiration_time
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_key
```
4. Start the server:
```
npm run dev
```
5. Open your browser and start chatting! 🎉

## Screenshots
- ![1739836617230](https://github.com/user-attachments/assets/1063f27d-a1ba-499d-889d-03d8c330e107)**Screenshot of the login page.**
- ![1739836865838](https://github.com/user-attachments/assets/1e2e7c4e-a8f9-4beb-b896-d3001e7960fa)**Screenshot of the signup page.**
- ![1741880048707](https://github.com/user-attachments/assets/427b17c1-8fc7-43fe-8573-e673030f9480)
  <br>**Screenshot of the messaging page.**


## Comprehensive Explaination
- for a comprehensive explaination about the project visit [the application deep-wiki](https://deepwiki.com/alimagdye/Real-Time-Chat-Application).

## 🗄️ Database Schema

This app uses a relational structure to manage users and their messages. Here’s an overview of the database tables:

### **Tables**

#### `users`

Stores registered user credentials.

| Field      | Type   | Description          |
| ---------- | ------ | -------------------- |
| `id`       | `uuid` | Primary key          |
| `username` | `text` | Unique username      |
| `email`    | `text` | User's email address |
| `password` | `text` | Hashed password      |

---

#### `messages`

Stores messages sent by users.

| Field        | Type          | Description                        |
| ------------ | ------------- | ---------------------------------- |
| `id`         | `uuid`        | Primary key                        |
| `text`       | `text`        | Message content                    |
| `sender_id`  | `uuid`        | Foreign key referencing `users.id` |
| `created_at` | `timestamptz` | Timestamp of when message was sent |

---

#### `message_recipients`

Joins messages to their recipients (supports 1-to-1 messaging and can support group chat in the future).

| Field         | Type   | Description                           |
| ------------- | ------ | ------------------------------------- |
| `message_id`  | `uuid` | Foreign key referencing `messages.id` |
| `receiver_id` | `uuid` | Foreign key referencing `users.id`    |

---

### 💡 Relationships

* A **user** can **send many messages**.
* A **message** can have **one or more recipients** (extensible to group chat).
* A **user** can **receive many messages**.

---
<img width="1364" height="638" alt="image" src="https://github.com/user-attachments/assets/50d22a24-12ca-4997-9560-53965cf15c68" />**Screenshot of the database Entity Relationship Diagram.**

## 🛡 Authentication & Security
- JWT-based authentication is implemented.
- Protected routes require authentication.
- Request validation ensures secure input handling.

## Authentication
| Method | Endpoint   | Description |
|--------|-----------|-------------|
| **POST**  | `/signup` | Register a new user |
| **POST**  | `/login`  | Authenticate a user |

---

## 💬 WebSocket Events (Socket.IO)
| Event  | Description |
|--------|-------------|
| **msg:post**  | Send a message to another user |
| **msg:get**   | Receive a message (automatically sent back to both sender & receiver on msg:post) |
| **msg:load**  | Load chat history with another user |

---

## Future Improvements

- 👨‍👩‍👧‍👦 groups chat for many users to chat together
- 🚀 Typing indicators for a better user experience
- 🔔 Real-time notifications for new messages

## 🎯 Contributing
- Contributions are welcome! If you find a bug or have a feature request, please create an issue or submit a pull request.
- Created by Ali Magdy. Feel free to contact me at alimagdye1@gmail.com for any questions or suggestions.

