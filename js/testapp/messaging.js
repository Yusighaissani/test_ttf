function sendUserMsg() {
    var chatMessage = document.getElementById('msg').value;
    var user = document.getElementById('msg-userId').value;
    if (msg == "") {
        return;
    }
    else if (user === "") {
        return;
    }

    var uniqueId = create_UUID();

    var msg = {
        v: 1,
        mid: uniqueId,
        sid: uniqueId,
        message_type: "text/html",
        from: {
            id: livechatapi.getLoggedInUserId(),
            name: ''
        },
        to: {
            id: user,
            name: ''
        },
        created_at: Date.now(),
        message_content: chatMessage, 
        conversation_type : 0,
        other: null
    }

    livechatapi.sendUserMessage(JSON.stringify(msg), "user:" + user);
    writeToScreen("sendUserMessage: MSG - " + msg.message_content);
    document.getElementById('msg').value = '';
    doneTyping();
}

var txtMsg = document.getElementById('msg');

var getKeyCode = function(str) {
    return str.charCodeAt(str.length - 1);
}

var typingTimer;               
var doneTypingInterval = 5000;

txtMsg.addEventListener('keyup', function(event) {           
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, doneTypingInterval);
   
});

txtMsg.addEventListener('keydown', function(event) {
    var user = document.getElementById('msg-userId').value;
    clearTimeout(typingTimer);  
    var typingMessage = {
         from : livechatapi.getLoggedInUserId(), 
         to : user, 
         conversation_type : 0,
          status : "START"
        };
    livechatapi.sendTypingState(JSON.stringify(typingMessage), "user:" + user);
});

//user is "finished typing," do something
function doneTyping () {
    var user = document.getElementById('msg-userId').value;
    var typingMessage = {
        from : livechatapi.getLoggedInUserId(), 
        to : user, 
        conversation_type : 0,
         status : "STOP"
       };
    console.log("info","doneTyping","Livechat: send typing stopped");
    livechatapi.sendTypingState(JSON.stringify(typingMessage), "user:" + user);
}

function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}
