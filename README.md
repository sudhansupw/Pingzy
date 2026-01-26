<h1>🚀 Ephemeral Group Chat Application (DMs + Self-Destructing Groups)
</h1>
A real-time chat application built with MERN + Socket.IO, supporting direct messages and temporary password-protected group chats that automatically self-destruct after a fixed duration.

This project focuses on privacy, real-time communication, and clean backend architecture.


<h2>✨ Features</h2>
<h3>🔐 Authentication</h3>

JWT-based authentication

Secure cookie handling

Protected routes

<h3>💬 Direct Messages (DMs)</h3>

One-to-one real-time chat

Online/offline status

Image support

Persistent message history


<h3>👥 Ephemeral Group Chats</h3>

Create password-protected groups

Join groups using a group code + password

Admin-controlled groups

Auto-expire after 2 hours

All messages are automatically deleted

Admin actions:

End chat instantly

Extend chat duration

Invite via link

Secure group membership validation


<h3>⏱ Auto-Destruction (Privacy First)</h3>

MongoDB TTL indexes for:

Groups

Group messages

No cron jobs

No background workers

Works even if the server is down


<h3>⚡ Real-Time Communication</h3>

Socket.IO for:

DMs

Group messages

Online presence

Multiple tabs per user supported

Group room isolation


<h3>🛠 Tech Stack</h3>
Frontend

React

Zustand (state management)

Tailwind CSS + DaisyUI

Socket.IO Client

Backend

Node.js

Express.js

MongoDB + Mongoose

Socket.IO

JWT Authentication

Cloudinary (image uploads)


<h3>🧠 Architecture Highlights</h3>

Single Message Schema for both DMs and Groups

Conditional validation based on messageType

TTL-based cleanup for groups and messages

Socket + HTTP parity (same data rules)

Secure role-based admin actions

No orphaned data


<h3>📁 Folder Structure (Simplified)</h3>
```
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── socket
│   └── middleware
│
├── frontend
│   ├── components
│   ├── store (Zustand)
│   ├── pages
│   ├── hooks
│   └── lib
```

<h3>⚙️ Environment Variables</h3>

Backend (.env)
```
PORT=5001
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

Frontend (.env)
```
VITE_API_URL=http://localhost:5001/api
```

▶️ Getting Started
1️⃣ Clone the repository
```
git clone https://github.com/Binay-panda19/CHATAPP.git
cd CHATAPP
```

2️⃣ Install dependencies

Backend

```
cd backend
npm install
npm run dev
```


Frontend

```
cd frontend
npm install
npm run dev
```

<h3>🔐 Group Expiry Logic (Important)</h3>
Scenario	Action
Group expires (2 hrs)	MongoDB TTL deletes group
Group expires	MongoDB TTL deletes all messages
Admin deletes group	Backend instantly deletes group + messages
Server down	TTL still works


<h3>🧪 Key Validations</h3>

DM messages require receiverId

Group messages require groupId

Group messages never require receiverId

Only group members can send messages

Only admin can end or extend group



<h3>🧠 Learning Outcomes
</h3>
This project demonstrates:

Advanced Socket.IO usage

TTL-based data lifecycle management

Clean Mongoose schema design

Real-world chat system architecture

Secure role-based actions

Zustand + Socket synchronization



<h3>🚀 Future Enhancements</h3>

Typing indicators

Read receipts

Message reactions

One-time invite links

Group chat history export

End-to-end encryption (E2EE)



<h3>🤝 Contributing</h3>

Pull requests are welcome.
Feel free to open an issue for suggestions or improvements.


<h2>⭐ If you found this project useful, consider giving it a star!</h2>
