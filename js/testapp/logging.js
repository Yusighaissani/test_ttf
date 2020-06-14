function writeToScreen(message) {
    document.getElementById("output").style.display = 'block';
    document.getElementById("output").innerHTML += "<p class=\"card-text\">" + message + "</p>";
    document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
    return message;
}

var notificationTypes = {
    info: "info",
    success: "success",
    error: "error"
}

function ShowNotification(notificationType, message) {
    switch (notificationType) {
        case notificationTypes.info:
            PNotify.info({
                text: message
            });
            break;
        case notificationTypes.success:
            PNotify.success({
                text: message
            });
            break;
        case notificationTypes.error:
            PNotify.error({
                text: message
            });
            break;
    }
}

PNotify.defaults.styling = 'bootstrap4';
PNotify.defaults.icons = 'fontawesome5';
PNotify.defaults.delay = 2000;

function showTyping() {
  var typingElement = document.getElementById("typing");

    if(typeof(typingElement) == 'undefined' || typingElement == null){
        document.getElementById("output").innerHTML += "<div id='typing' class='ticontainer'> <div class='tiblock'> <div class='tidot'></div> <div class='tidot'></div> <div class='tidot'></div></div> </div>";
        document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
    } 
    
}

function hideTyping(){
    var typingElement = document.getElementById("typing");
    typingElement.parentNode.removeChild(typingElement);
}