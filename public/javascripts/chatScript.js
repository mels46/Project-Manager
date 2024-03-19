const socket = io.connect('ws://localhost:3000');

let sendMessage = () => {
    console.log("Chat submitted");
    let text = document.getElementById("chat-input").value,
        userName = document.getElementById("chat-user-name").value,
        userId = document.getElementById("chat-user-id").value;

    socket.emit("message", {
        content: text,
        userName: userName,
        userId: userId
    });

    document.getElementById("chat-input").value = "";
    return false;
};

socket.on("message", (message) => {
    displayMessage(message);
    let chatIcon = document.getElementById("chat-icon");

    if (chatIcon) {
        chatIcon.style.color = "red";
    }
});

let displayMessage = (message) => {
    document.getElementById("chat").innerHTML += `
        <div  class="message ${getCurrentUserClass(message.userId)}">
            <span class="user-name">${message.userName}:</span>
            <span id="new-div" >${message.content} </span>
        </div>
    `;
};

let getCurrentUserClass = (id) => {
    let userId = document.getElementById("chat-user-id").value;
    if (userId === id) return "current-user";
    else return "";
};



socket.on("load all messages",(data)=> {
      data.forEach(message=>{
          displayMessage (message);
      });

  });










