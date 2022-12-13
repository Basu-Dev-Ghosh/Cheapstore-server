require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const { Server } = require("socket.io");
const server = http.createServer(app);
const path = require("path");
const cors = require("cors");
const port = process.env.PORT || 4000;

app.use(cors({ credentials: true, origin: 'https://cheapstore-client.vercel.app/' }));


const io = new Server(server);



require("./db/conn");



const cookieParser = require("cookie-parser");
const router = require("./routers/router");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

// Socket.io Connection

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
  console.log(users);
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};
const getUsers = (reciverId) => {
  return users.find((user) => user.userId === reciverId);
};

io.on("connection", (socket) => {
  // console.log("User connected");

  socket.on("add_user", (userId) => {
    // console.log(userId);
    addUser(userId, socket.id);

    io.emit("get_user", users);
  });

  socket.on("send_messege", ({ senderId, reciverId, text }) => {
    const user = getUsers(reciverId);
    // console.log(users);
    if (user) {
      io.to(user.socketId).emit("recive_messege", { senderId, text });
    } else {
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("User Left");
  });
});


server.listen(port, () => console.log(`Server Starts on port ${port}`));
