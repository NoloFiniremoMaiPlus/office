function home() {
  location.reload();
}

function loginRequired() {
  document.getElementById("loginRequiredText").textContent =
    "È necessario avere effettuato il login per accedere a questa funzionalità";
  $("#loginRequiredModal").modal("show");
}
//document.cookie returns all cookies related to the site
function getCookie(name) {
  var cookieName = name + "=";
  var cookieArray = document.cookie.split(";");
  for (var i = 0; i < cookieArray.length; i++) {
    var c = cookieArray[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(cookieName) == 0)
      return c.substring(cookieName.length, c.length);
  }
  return null;
}

function login() {
  let user = document.getElementById("username").value;
  let pass = document.getElementById("password").value;
  let cookie = getCookie("SessionCookie");
  console.log("Username: " + user, "\nPassword: " + pass);
  let credentials = {
    username: user,
    password: pass,
    cookie: cookie,
  };
  $.ajax({
    url: "/db/login",
    type: "POST",
    data: credentials,
    dataType: "json",
    success: function (data) {
      console.log(data);
      if (!data.valid) {
        $("#loginForm").trigger("reset");
        document.getElementById("alertContent").textContent =
          "Username o password errati";
        $("#alertModal").modal("show");
      } else {
        $("#loginModal").modal("hide");
        $("#loginForm").trigger("reset");
        location.reload();
        let newCookie = getCookie("SessionCookie");
        console.log(newCookie);
        let newData = { oldCookie: cookie, newCookie: newCookie };
        if (newData.oldCookie != newData.newCookie) {
          $.ajax({
            url: "/updateCookie",
            type: "POST",
            data: newData,
            dataType: "json",
            contentType: "application/x-www-form-urlencoded",
            success: function (data) {
              console.log(data);
            },
          });
        }
      }
    },
  });
}
