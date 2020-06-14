window.addEventListener("load", init, false);

function init() {
    userList.forEach(element => {
        var obj = element;
        var emailString = "'" + obj.email.toString() + "'";
        var passwordString = "'" + obj.password.toString() + "'";
        var onclick = 'AutoFillDetails(' + emailString + ',' + passwordString + ')'
        var ui = "<tr onclick=" + onclick + "><th scope='row'>" + obj.email + "</th><td>" + obj.password + "</td></tr >"
        var htmlObject = $(ui);
        document.getElementById('user-list-grid-body').append(htmlObject[ 0 ]);
    });

    output = document.getElementById("output");

    if (livechatapi.open() != false) {
        ChangePageContent(true);
        writeToScreen("Open Success");
        writeToScreen("User Id : " + livechatapi.livechat.getUserId());
        writeToScreen("Session Id : " + livechatapi.livechat.getSessionID());
        ShowNotification(notificationTypes.success, "Login Successful");
        try {
            initCallSdk();
        } catch (error) {
            
        }     
    }
}

function AutoFillDetails(emailId, password) {
    try {
        document.getElementById('email').value = emailId;
        document.getElementById('password').value = password;
    } catch (e) {

    }
}

var isVideoCall;

function OnSelectAudioVideo(isVideo, element) {
    $('#channel-selector-group > a').removeClass('btn-primary');
    $('#channel-selector-group > a').addClass('btn-default');

    element.classList.remove("btn-default");
    element.classList.add("btn-primary");

    isVideoCall = isVideo;
}