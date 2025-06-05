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
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
```
4. Start the server:
```
npm run dev
```
5. Open your browser and start chatting! 🎉

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

## Comprehensive Explaination
- for a comprehensive explaination about the project visit [the application deep-wiki](https://deepwiki.com/alimagdye/Real-Time-Chat-Application).

## Future Improvements

- 👨‍👩‍👧‍👦 groups chat for many users to chat together
- 🚀 Typing indicators for a better user experience
- 🔔 Real-time notifications for new messages

## 🎯 Contributing
- Contributions are welcome! If you find a bug or have a feature request, please create an issue or submit a pull request.
