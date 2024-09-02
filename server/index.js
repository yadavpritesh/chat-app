const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");

const {addUser, removeUser, getUsersInRoom,getUser} = require('./Users.js');

const PORT = process.env.PORT || 5000;
const router = require('./router');

const app = express();


app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});



io.on('connection', (socket) => {
  console.log('we have a new connection!!!');
  console.log(`User Connected: ${socket.id}`);
  
  socket.on('join', ({ name, room }, callback) => {
    console.log(room);
    console.log(name);
    if (!name || !room) {
      return callback('Name and room are required.');
    }
    console.log(room);
    console.log(name);
 
    const {error,user} = addUser({id:socket.id, name,room});
  
    if (error) return callback(error);
  

    socket.emit('message', { user:'admin', text:`${user.name}, welcome to the room ${user.room}`});
    socket.broadcast.to(user.room).emit('message', {user:'admin', text:`${user.name}, has joined !`});

    console.log(user.name);
    socket.join(user.room);
    callback();
  });

    socket.on('message', (message,callback)=>{
      const user = getUser(socket.id);

      io.to(user.room).emit('message',{ user: user.name, text:message});

      callback();
    });

  socket.on('disconnect', () => {
     const user=removeUser(socket.id);

     if (user){
         io.to(user.room).emit('message',{ user:'admin', text:`${user.name} has left`})
     }
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on PORT ${PORT}`));
