let currentNotationIndex = -1;

/* On Load */
window.onload = (event) => {
  token = getToken();
  if (token) {
    loggedPrivileges();
  }
};

/* Misc */
function home() {
  location.reload();
}

/* Tokens Related*/
function getToken() {
  return localStorage.getItem("token");
}

function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

function getLoggedUser() {
  return localStorage.getItem("user");
}

function saveToken(response) {
  token = response.tokens.access.token;
  refreshToken = response.tokens.refresh.token;
  user = response.user.name;
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("user", user);
}

function deleteTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

/* Login Related */
function loginRequired() {
  $("#LoginRequiredModal").modal("show");
}

function login() {
  console.log("Procedo ad eseguire il login");
  let user = $("#email").val();
  let pass = $("#password").val();
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
      saveToken(data);
      location.reload();
    },
    error: function (data) {
      $("#loginForm").trigger("reset");
      $("#loginCaption").text("Email o password errati");
    },
  });
}

function logout() {
  console.log("Procedo ad eseguire il logout");
  $.ajax({
    url: "http://192.168.1.9:8000" + "/v1/auth/logout",
    type: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    data: {
      refreshToken: getRefreshToken(),
    },
    success: function (d) {
      deleteTokens();
      console.log("Logout Eseguito");
      location.reload();
    },
    error: function (d) {
      console.log("Errore durante il logout");
    },
  });
}

/* Login Privileges */
function loggedPrivileges() {
  $("#home").text(getLoggedUser());
  $("#loginButton").hide();
  $("#logoutButton").show();
  $("#Clients").attr("onclick", "allowClients()");
  $("#Rentals").attr("onclick", "allowRentals()");
}

function allowClients() {
  $("#Clients").attr("onclick", "userAnagraphic();");
}

function allowRentals() {
  $("#Rentals").attr("onclick", "userRentals();");
}

/* User Anagraphic */
function userAnagraphic() {
  console.log("Procedo a recuperare i dati degli utenti");
  $.ajax({
    url: "http://192.168.1.9:8000" + "/v1/users",
    type: "GET",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: {
      role: "user",
      sortBy: "name:asc",
    },
    success: function (res) {
      console.log(res);
      users = res.results;
      let tbody = $("#ADBody");
      tbody.empty();
      for (let u of users) {
        let index = users.indexOf(u);
        let id = u.id;
        let name = u.name;
        let surname = u.surname;
        let email = u.email;
        let phone = u.phone;
        let tr = document.createElement("tr");
        tr.innerHTML = `
        <td class="ClientData">
          <input type="text" class="form-control" id="client${index}Id" value="${id}">
        </td>
        <td class="ClientData">
          <input type="text" class="form-control" id="client${index}Name" value="${name}">
        </td>
        <td class="ClientData">
          <input type="text" class="form-control" id="client${index}Surname" value="${surname}">
        </td>
         <td class="ClientData">
            <input type="text" class="form-control" id="client${index}Email" value="${email}">
          </td>
          <td class="ClientData">
            <input type="text" class="form-control" id="client${index}Phone" value="${phone}">
          </td>
          <td class="ClientData actionBar">
            <div class="clientActionBar">
              <div class="modalActions">
                <button class="btn btn-primary bi bi-pencil-fill" onclick="editUser(${index})"></button>
                <button class="btn btn-primary bi bi bi-bag-check" onclick="showUserRentals(${index})"></button>
                <button class="btn btn-primary bi bi-x" onclick="removeUser(${index})"></button>
              </div>
              <div class="modalActions">
                <button class="btn btn-primary bi bi-card-text" onclick="addUserAnnotations(${index})"></button>
                <button class="btn btn-primary bi bi-list-task" onclick="showUserAnnotations(${index})"></button>
              </div>
            </div>
          </td>`;
        tbody.append(tr);
      }
    },
    error: function (res) {
      console.log("Errore durante il recupero degli utenti");
    },
  });
  $("#UserAnagraphicModal").modal("show");
}

/* User Handling */
function editUser(index) {
  console.log("Procedo ad editare l'utente");
  let id = $(`#client${index}Id`).val().trim();
  let name = $(`#client${index}Name`).val();
  let surname = $(`#client${index}Surname`).val();
  let email = $(`#client${index}Email`).val();
  let phone = $(`#client${index}Phone`).val();
  $.ajax({
    url: "http://192.168.1.9:8000" + `/v1/users/${id}`,
    type: "PATCH",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: {
      name: name,
      surname: surname,
      email: email,
      phone: phone,
    },
    success: function (res) {
      location.reload();
    },
    error: function (res) {
      console.log("Errore durante la modifica dell'utente");
    },
  });
}

//! TODO: eliminare solo se non ha noleggi prenotati/attivi
function removeUser(index) {
  console.log("Procedo a rimuovere l'utente");
  let id = $(`#client${index}Id`).val().trim();
  console.log(id);
  $.ajax({
    url: "http://192.168.1.9:8000" + `/v1/users/${id}`,
    type: "DELETE",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    success: function (res) {
      location.reload();
    },
    error: function (res) {
      console.log("Errore durante la rimozione dell'utente");
    },
  });
}

/* User Annotations */
function addUserAnnotations(index) {
  currentNotationIndex = index;
  $("#UserAnagraphicModal").modal("hide");
  $("#AddAnnotationsModal").modal("show");
}

function addAnnotations() {
  console.log("Aggiungo le annotazioni");
  let index = currentNotationIndex;
  let id = $(`#client${index}Id`).val().trim();
  let rawAnnotations = $("#annotations").find(":selected");
  let annotations = [];
  for (let i = 0; i < rawAnnotations.length; i++) {
    annotations.push(rawAnnotations[i].value);
  }
  let comment = $("#comment").val();
  $.ajax({
    url: "http://192.168.1.9:8000" + `/v1/users/${id}/annotation`,
    type: "POST",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: {
      quick: annotations,
      text: comment,
    },
    success: function (res) {
      location.reload();
    },
    error: function (res) {
      console.log("Errore durante l'aggiunta delle annotazioni");
    },
  });
}

function showUserAnnotations(index) {
  console.log("Mostro le annotazioni");
  let id = $(`#client${index}Id`).val().trim();
  $("#UserAnagraphicModal").modal("hide");
  $("#ShowAnnotationsModal").modal("show");
  $.ajax({
    url: "http://192.168.1.9:8000" + "/v1/users/" + id + "/annotation",
    type: "GET",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    success: function (res) {
      console.log(res);
      notes = res.quick;
      comment = res.text;
      $("#commenti").empty().text(comment);
      $("#features").empty();
      for (let note of notes) {
        $("#features").append(
          `<li class="list-group-item list-group-item-info">${note}</li>`
        );
      }
    },
    error: function (res) {
      console.log("Errore durante il recupero degli utenti");
    },
  });
}

/* User Rentals */
function userRentals(userId) {
  $.ajax({
    url: "http://192.168.1.9:8000" + "/v1/rentals",
    type: "GET",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: {},
    success: function (res) {
      console.log(res);
      rentals = res.results;
      let tbody = $("#rentalsBody");
      tbody.empty();
      for (let r of rentals) {
        let rentalId = r.id;
        let item = r.item.name;
        let state = r.state;
        let start = r.from;
        let end = r.to;
        let price = r.price;
        let surcharge = r.surcharge;
        let annotation = r.annotation;
        let tr = document.createElement("tr");
        tr.innerHTML = `
        <td class="ClientData">
          <input type="text" class="form-control" id="rental${index}Id" value="${rentalId}">
        </td>
        <td class="ClientData">
          <input type="text" class="form-control" id="rental${index}UserId" value="${userId}">
        </td>
        <td class="ClientData">
          <input type="text" class="form-control" id="rental${index}Item" value="${item}">
        </td>
        <td class="ClientData">
          <input type="text" class="form-control" id="rental${index}State" value="${state}">
        </td>
         <td class="ClientData">
            <input type="text" class="form-control" id="rental${index}Start" value="${start}">
          </td>
          <td class="ClientData">
            <input type="text" class="form-control" id="rental${index}End" value="${end}">
          </td>
          <td class="ClientData">
            <input type="text" class="form-control" id="rental${index}TotalPrice" value="${
          price + surcharge
        }">
          </td>
          <td class="ClientData">
            <input type="text" class="form-control" id="rental${index}Annotation" value="${annotation}">
          </td>`;
        tbody.append(tr);
      }
    },
    error: function (res) {
      console.log("Errore durante il recupero dei noleggi");
    },
  });
  $("#UserRentalsModal").modal("show");
}
