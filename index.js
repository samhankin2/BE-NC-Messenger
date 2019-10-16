var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

let loggedInUsers = [];

io.on("connection", function(socket) {
  let added = false;
  let currentUser = "";
  let typing = false;
  console.log("Connected");
  socket.on("chat message", function(msg) {
    io.sockets.emit("sent message", { msg, currentUser });
    typing = false;
  });

  socket.on("login", user => {
    added = true;
    currentUser = user;
    loggedInUsers.push(user);
    io.sockets.emit("userLoggedIn", currentUser);
    console.log(user + " logged in");
  });

  socket.on("test", () => {
    // console.log(added);
    console.log(currentUser);
    console.log(loggedInUsers);
  });

  socket.on("typing", () => {
    console.log("on typing server");

    if (!typing) {
      if (added) {
        io.sockets.emit("typing", currentUser);
        typing = true;
      }
    }
  });
  socket.on("disconnect", reason => {
    console.log("disconnected");
    if (added) {
      io.sockets.emit("disconnected", currentUser);
      loggedInUsers = loggedInUsers.filter(user => {
        console.log(user);
        console.log(currentUser);
        return user !== currentUser;
      });
    }
  });
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});

// To Do

//make sure filter works properly and logged out properly
//changiing names should remove old name
