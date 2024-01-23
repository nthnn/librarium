const showLoginError = (message)=> {
    $("#login-error").html(message);
    $("#login-error").removeClass("d-none");
    $("#login-error").addClass("d-block");
}, hideLoginError = ()=> {
    $("#login-error").html("");
    $("#login-error").removeClass("d-block");
    $("#login-error").addClass("d-none");
};

$(document).ready(()=> {
    setTimeout(()=> {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth"
        });
        sessionStorage.setItem("-", "true");
    }, sessionStorage.getItem("-") == "true" ? 2500 : 1500);

    $("#login-btn").click(()=> {
        hideLoginError();

        let username = $("#username").val(),
            password = $("#password").val();

        if(username == "") {
            showLoginError("Username cannot be empty.")
            return;
        }
        
        if(!Librarium.validateUsername(username)) {
            showLoginError("Invalid input username.")
            return;
        }

        if(password == "") {
            showLoginError("Password cannot be empty.")
            return;
        }

        Librarium.login(
            username, password,
            ()=> showLoginError("Invalid username and/or password."),
            ()=> window.location.href = "dashboard.html"
        );
    });
});