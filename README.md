# Real-Time Chat Application
A real-time chat application built with Node.js, Express.js, Socket.io, and Supabase, enabling instant messaging with authentication, secure WebSocket communication, and persistent database storage.

## Features
-  Real-time messaging using WebSockets for instant updates
-  User authentication with JWT-protected login/signup
-  Secure WebSocket connections with authentication middleware
-  Supabase as the database for storing messages and user data
-  Optimized relational database schema for efficient message retrieval
-  Event-driven architecture for smooth two-way communication
  
## Technologies Used
- Backend: Node.js, Express.js, Socket.io
- Database: Supabase (PostgreSQL)
- Authentication: JWT, Middleware Protection
- Architecture: WebSockets, Event-driven Communication
 
## Setup & Installation

- Clone the repository:
```
git clone https://github.com/your-username/real-time-chat-app.git
cd real-time-chat-app
```
- Install dependencies:
```
npm install
```
- Set up Supabase and add your credentials in .env:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
```
- Start the server:
```
npm start
```
- Open your browser and start chatting! 🎉

## Future Improvements

- 🚀 Typing indicators for a better user experience
- 🔔 Real-time notifications for new messages
- 📱 Responsive UI for mobile support
