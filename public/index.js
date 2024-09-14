let socket = io();
///////////login/////////////
document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("loginName").value;
    const password = document.getElementById("loginPassword").value;

    socket.emit("login", { name, password });
  });

socket.on("loginResponse", (data) => {
  console.log(data);

  if (typeof data != "string") {
    console.log({ message: "login fail." });
  } else {
    localStorage.setItem("Token", data);
    console.log({ message: "you logged in" });
    connectWithToken();
  }
});

///////////new user/////////////
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

///////////get user by id/////////////
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
  });

///////////delete/////////////
document
  .getElementById("deleteUserForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const deleteUserId = document.getElementById("deleteUserId").value;
    console.log("Deleting user with ID:", deleteUserId);
    socket.emit("deleteUserById", deleteUserId);
  });

///////////update/////////////
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
socket.on("userDeleted", (response) => {
  console.log(response.message);
});

socket.on("userUpdated", (response) => {
  console.log(response.message);
});

function connectWithToken() {
  const token = localStorage.getItem("Token");
  socket = io("http://localhost:3000", {
    auth: {
      token: `Bearer ${token}`,
    },
  });
}
