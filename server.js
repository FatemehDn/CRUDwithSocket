const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const { User } = require("./dataBase/models");
const { getCache, setCache, deleteCache } = require("./redis");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt"); 

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("new user connected");

  socket.on("login", async (data) => {
    const { name, password } = data;

    try {
      const user = await User.findOne({ where: { name } });
      if (!user) {
        return socket.emit("loginResponse", { message: "user not found." });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return socket.emit("loginResponse", { message: "invalid password." });
      }

      const token = jwt.sign(
        { name: user.name },
        process.env.ACCESS_TOKEN_SECRET
      );
      socket.emit("loginResponse", token);
    } catch (error) {
      console.error(error);
    }
  });

  // Listen to submitData
  socket.on("submitData", async (data) => {
    const { name, password } = data;
    try {
      //save data in mysql
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ name, password: hashedPassword });
      socket.emit("dataSaved", { message: "user added." });
    } catch (error) {
      console.error("error saving to database:", error);
    }
  });

  socket.on("getUserById", async (id) => {
    try {
      let cache = await getCache(`user:${id}`);
      // console.log(cache);

      if (cache) {
        socket.emit("userData", cache);
        return;
      }

      // If not in cache, get from the database
      const user = await User.findByPk(id);
      if (!user) {
        socket.emit("userNotFound", { message: "user not found." });
      } else {
        // Cache the data in Redis
        await setCache(`user:${id}`, JSON.stringify(user), 3600);
        socket.emit("userData", user);
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("deleteUserById", async (id) => {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        socket.emit("userNotFound", { message: "user not found." });
      } else {
        await user.destroy();
        await deleteCache(`user:${id}`);
        socket.emit("userDeleted", { message: "user deleted." });
      }
    } catch (error) {
      socket.emit("error");
    }
  });

  socket.on("updateUserById", async (data) => {
    const { id, name, password } = data;
    try {
      const user = await User.findByPk(id);
      if (!user) {
        socket.emit("userNotFound", { message: "user not found." });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.name = name;
        user.password = hashedPassword;
        await user.save();
        socket.emit("userUpdated", { message: "user updated" });
      }
    } catch (error) {
      socket.emit("error");
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
