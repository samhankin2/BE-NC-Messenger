let app = require("express")();
let http = require("http").createServer(app);
let io = require("socket.io")(http);
let moment = require("moment");

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

let loggedInUsers = [];

io.on("connection", function(socket) {
  // moment().format();
  let added = false;
  let currentUser = { username: "", img_url: "", timestamp: null };
  let typing = false;
  console.log("Connected");

  socket.on("chat message", function(msg) {
    let timestamp = moment().format("h:mm:ss");
    io.sockets.emit("sent message", { msg, currentUser, timestamp });
    typing = false;
  });

  socket.on("login", ({ username, img_url }) => {
    if (!added) {
      added = true;
      console.log(username);
      currentUser.username = username;
      currentUser.img_url = img_url;
      currentUser.timestamp = moment().format("h:mm:ss");
      loggedInUsers.push(currentUser);

      io.sockets.emit("userLoggedIn", currentUser);
      console.log(currentUser + " logged in");
    }
  });

  socket.on("changeProfile", ({ username, img_url }) => {
    loggedInUsers = loggedInUsers.filter(user => {
      return user.username !== currentUser.username;
    });
    if (username) currentUser.username = username;
    if (img_url) currentUser.img_url = img_url;
    currentUser.timestamp = moment().format("h:mm:ss");

    loggedInUsers.push(currentUser);
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
      currentUser.timestamp = moment().format("h:mm:ss");
      io.sockets.emit("disconnected", currentUser);
      loggedInUsers = loggedInUsers.filter(user => {
        console.log(user);
        console.log(currentUser);
        return user !== currentUser.username;
      });
    }
  });

  socket.on("onlineUsers", () => {
    io.sockets.emit("onlineUsers", loggedInUsers);
  });
});

http.listen(3005, function() {
  console.log("listening on *:3000");
});

// To Do

//send back timestamp
