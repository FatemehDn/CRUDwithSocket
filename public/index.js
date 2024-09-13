const socket = io();

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const password = document.getElementById("password").value;

    socket.emit("login", { name, password });
  });

socket.on("loginResponse", (data) => {
  console.log(data);
});

document
  .getElementById("userForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const userName = document.getElementById("name").value;
    const password = document.getElementById("password").value;

    console.log("Name:", userName);
    console.log("Password:", password);

    // Send the data to the server
    socket.emit("submitData", { name: userName, password });
  });

document
  .getElementById("getUserForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const userId = document.getElementById("userId").value;
    socket.emit("getUserById", userId);

    socket.on("userData", (user) => {
      console.log("ID:", user.id);
      console.log("Name:", user.name);
    });

    document
      .getElementById("deleteUserForm")
      .addEventListener("submit", function (event) {
        event.preventDefault();
        const deleteUserId = document.getElementById("deleteUserId").value;
        console.log("Deleting user with ID:", deleteUserId);
        socket.emit("deleteUserById", deleteUserId);
      });

    document
      .getElementById("updateUserForm")
      .addEventListener("submit", function (event) {
        event.preventDefault();
        const id = document.getElementById("updateUserId").value;
        const updateName = document.getElementById("updateName").value;
        const updatePassword = document.getElementById("updatePassword").value;

        //send to server
        const data = {
          id: id,
          name: updateName,
          password: updatePassword,
        };
        socket.emit("updateUserById", data);
      });

    socket.on("userNotFound", (response) => {
      console.log(response.message);
    });
  });
