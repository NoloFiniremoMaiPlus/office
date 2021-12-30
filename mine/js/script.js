let i = 1;

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
  let credentials = {
    email: user,
    password: pass,
  };
  console.log(credentials);
  $.ajax({
    url: "http://192.168.1.9:8000" + "/v1/auth/login",
    type: "POST",
    data: credentials,
    dataType: "json",
    success: function (data) {
      //$("#loginModal").modal("hide");
      location.reload();
      let newCookie = getCookie("SessionCookie");
      console.log(newCookie);
      if (cookie != newCookie) {
        $.ajax({
          url: "/updateCookie",
          type: "POST",
          data: newData,
          dataType: "json",
          success: function (data) {
            console.log(data);
          },
        });
      }
    },
    error: function (data) {
      $("#loginForm").trigger("reset");
      document.getElementById("loginCaption").textContent =
        "Username o password errati, ritenta";
    },
  });
}
