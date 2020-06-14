function loginAndConnect() {
    try {
        event.preventDefault();

        email = document.getElementById('email').value;
        var password = document.getElementById('password').value;

        if (email == "" || password == "") {
            return;
        }

        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementById('user-login-form');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });

        if (useTenancyBasedLogin) {
            if (loginAuthURL === undefined || loginAuthURL === "") {
                ShowNotification(notificationTypes.error, "loginAuthURL has not been configured");
                return;
            }

            livechatapi.loginV2(email, password, onSuccess, loginAuthURL);
        }

        else
            livechatapi.login(email, password, onSuccess);
    } catch (error) {
        console.error("Error in loginAndConnect : " + error)
    }
}

function end() {
    writeToScreen("SENT: CHAT END ");
    livechatapi.end('client side end.');
    ChangePageContent(false);
}

function onSuccess(status, auth, info) {

    console.log("status : " + status);
    console.log("token : " + auth);
    console.log("token Info : " + info);

    writeToScreen("email :" + email);
    writeToScreen("User Id:" + livechatapi.livechat.getUserId());

    if (status) {
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        openChannel();
        ShowNotification(notificationTypes.success, "Login Successful");
    }
    else {
        alert("Login Failed");
        ShowNotification(notificationTypes.error, "Login Failed");
    }
}

function openChannel() {
    let custDetails = { name: "Sandeep", address: "Mangalore" };
    livechatapi.start(custDetails);
    writeToScreen("SENT: START MESSAGE");
}

function overrideSession() {
    let custDetails = { name: "Sandeep", address: "Mangalore" };
    livechatapi.start(custDetails, true);
    writeToScreen("SENT: START FETCH MESSAGE");

    $('#sessionModal').modal('hide');
}

function NavbarSwitch(navbar) {
    try {
        $("#testapp-navs > li").removeClass("active");
        $("#" + navbar + "-nav-item").addClass("active");
        $("#testapp-navs-content > div").addClass("hidden");
        $("#" + navbar + "-content").removeClass("hidden");

    } catch (e) {

    }
}

function ChangePageContent(isStart) {
    try {
        if (isStart) {
            $("#login-page").addClass("hidden");
            $("#content-page").removeClass("hidden");
            $('#output').height(($(window).height() - $('header').outerHeight() - 75) + "px");
        }
        else {
            $("#login-page").removeClass("hidden");
            $("#content-page").addClass("hidden");
        }
    } catch (e) {

    }
}