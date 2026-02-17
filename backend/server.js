const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });


let tasks = []; 

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  
 
  socket.emit("sync:tasks", tasks);

  // 1. Task Create
  socket.on("task:create", (data) => {
    const newTask = {
      id: `task-${Date.now()}`,
      text: data.text,
      status: "todo",
      priority: "Medium",
      category: "Feature",
      attachments: []
    };
    tasks.push(newTask);
    io.emit("sync:tasks", tasks); 
  });

  
  socket.on("task:move", (moveData) => {
    
    tasks = tasks.map(t => 
      t.id === moveData.id ? { ...t, status: moveData.status } : t
    );
   
    io.emit("sync:tasks", tasks); 
  });

  
  socket.on("task:update", (updatedData) => {
    tasks = tasks.map(t => 
      t.id === updatedData.id ? { ...t, ...updatedData } : t
    );
    io.emit("sync:tasks", tasks);
  });

  // 4. Task Delete
  socket.on("task:delete", (id) => {
    tasks = tasks.filter(t => t.id !== id);
    io.emit("sync:tasks", tasks);
  });
});

server.listen(5000, () => console.log(" Server updated & running on port 5000"));