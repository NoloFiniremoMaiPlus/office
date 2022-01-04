let currentNotationIndex = -1;
let localhost = "https://192.168.1.9:8443";

const allStates = ["Completed", "Finished", "Ongoing", "Booked"];
const timeoutByState = {
  Booked: "200",
  Ongoing: "100",
  Finished: "50",
  Completed: "0",
};

/* On Load */
window.onload = (event) => {
  token = getToken();
  refresh = getRefreshToken();
  expires = getExpires();
  currentDate = new Date().toISOString();
  if (token && refresh && expires && currentDate < expires) {
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

function getExpires() {
  return localStorage.getItem("expires");
}

function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

function getLoggedUser() {
  return localStorage.getItem("user");
}

function saveToken(response) {
  token = response.tokens.access.token;
  expires = response.tokens.access.expires;
  refreshToken = response.tokens.refresh.token;
  user = response.user.name;
  localStorage.setItem("token", token);
  localStorage.setItem("expires", expires);
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
  let email = $("#email").val();
  let pass = $("#password").val();
  let credentials = {
    email: email,
    password: pass,
  };
  console.log(credentials);
  $.ajax({
    url: localhost + "/v1/auth/login",
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
    url: localhost + "/v1/auth/logout",
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
  $("#OldRentals").attr("onclick", "allowOldRentals()");
}

function allowClients() {
  $("#Clients").attr("onclick", "userAnagraphic();");
}

function allowRentals() {
  $("#rentalsCaption").text("Noleggi Attivi");
  $("#Rentals").attr("onclick", "userRentals(true);");
}

function allowOldRentals() {
  $("#rentalsCaption").text("Noleggi Conclusi");
  $("#OldRentals").attr("onclick", "userRentals(false);");
}

/* User Anagraphic */
function userAnagraphic() {
  console.log("Procedo a recuperare i dati degli utenti");
  $.ajax({
    url: localhost + "/v1/users",
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
            <div>
              <div class="modalActions">
                <button class="btn btn-primary bi bi-pencil-fill" onclick="editUser(${index})"></button>
                <button class="btn btn-primary bi bi bi-bag-check" onclick="showUserRentals(${index})"></button>
                <button class="btn btn-primary bi bi-x" onclick="removeUser(${index})"></button>
              </div>
              <div class="modalActions">
                <button class="btn btn-primary bi bi-card-text" onclick="addUserAnnotationsPopUp(${index})"></button>
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
    url: localhost + `/v1/users/${id}`,
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

function removeUser(index) {
  let id = $(`#client${index}Id`).val().trim();
  console.log("Procedo a rimuovere l'utente con id: " + id);
  filters = {
    user: id,
    state: "Ongoing",
  };
  $.ajax({
    url: localhost + "/v1/rentals",
    type: "GET",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: filters,
    success: function (res) {
      console.log("Ci sono " + res.results.length + " noleggi attivi");
      ongoingLength = res.results.length;
      if (ongoingLength == 0) {
        rentals = res.results;
        filters.state = "Booked";
        $.ajax({
          url: localhost + "/v1/rentals",
          type: "GET",
          headers: {
            Authorization: "Bearer " + getToken(),
          },
          data: filters,
          success: function (res) {
            console.log("Ci sono " + res.results.length + " noleggi prenotati");
            bookedLength = res.results.length;
            rentals = res.results;
            if (bookedLength == 0) {
              $.ajax({
                url: localhost + `/v1/users/${id}`,
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
            } else {
              alert(
                "Non è possibile eliminare l'utente, ci sono noleggi prenotati"
              );
            }
          },
          error: function (res) {
            console.log("Errore durante la ricerca dei noleggi prenotati");
          },
        });
      } else {
        alert("Non è possibile eliminare l'utente, ci sono noleggi in corso");
      }
    },
    error: function (res) {
      console.log("Errore durante la ricerca dei noleggi in corso");
    },
  });
}

/* User Annotations */
function addUserAnnotationsPopUp(index) {
  currentNotationIndex = index;
  $("#UserAnagraphicModal").modal("hide");
  $("#AddUserAnnotationsModal").modal("show");
}

function addUserAnnotations() {
  console.log("Aggiungo le annotazioni");
  let index = currentNotationIndex;
  let id = $(`#client${index}Id`).val().trim();
  let rawAnnotations = $("#userAnnotations").find(":selected");
  let annotations = [];
  for (let i = 0; i < rawAnnotations.length; i++) {
    annotations.push(rawAnnotations[i].value);
  }
  let comment = $("#userComment").val();
  $.ajax({
    url: localhost + `/v1/users/${id}`,
    type: "POST",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: {
      annotation: {
        quick: annotations,
        text: comment,
      }
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
    url: localhost + `/v1/users/${id}`,
    type: "GET",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    success: function (res) {
      console.log(res);
      annotation = res.annotation;
      notes = annotation.quick || [];
      comment = annotation.text;
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

/* Rental Annotations */
function addRentalAnnotationsPopUp(index) {
  currentNotationIndex = index;
  $("#UserRentalsModal").modal("hide");
  $("#AddRentalAnnotationsModal").modal("show");
}

function addRentalsAnnotations() {
  console.log("Aggiungo le annotazioni");
  let index = currentNotationIndex;
  let id = $(`#rental${index}Id`).val().trim();
  let rawAnnotations = $("#rentalAnnotations").find(":selected");
  let annotations = [];
  for (let i = 0; i < rawAnnotations.length; i++) {
    annotations.push(rawAnnotations[i].value);
  }
  let comment = $("#rentalComment").val();
  $.ajax({
    url: localhost + `/v1/rentals/${id}/annotation`,
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

function showRentalAnnotations(index) {
  console.log("Mostro le annotazioni");
  let id = $(`#rental${index}Id`).val().trim();
  $("#UserRentalsModal").modal("hide");
  $("#ShowAnnotationsModal").modal("show");
  $.ajax({
    url: localhost + "/v1/rentals/" + id + "/annotation",
    type: "GET",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    success: function (res) {
      console.log(res);
      notes = res.quick || [];
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

function showUserRentals(index) {
  console.log("Mostro i noleggi dell'utente");
  let id = $(`#client${index}Id`).val().trim();
  $("#UserAnagraphicModal").modal("hide");
  $("#ShowRentalsModal").modal("show");
  userRentals(true, id);
}

function insertRentalActions(index, state) {
  if (state == "Completed") {
    $("#rentalEdit" + index).hide();
    $(`#rental${index}State`).prop("disabled", true);
  } else {
    $("#rentalBill" + index).hide();
  }

  if (state != "Booked") {
    $("#rentalRemove" + index).hide();
  } else {
    $(`#rental${index}UserId`).prop("disabled", false);
    $(`#rental${index}Item`).prop("disabled", false);
    $(`#rental${index}Dates`).prop("disabled", false);
    $(`#rental${index}Cost`).prop("disabled", false);
  }
}

function nisba() {
  return;
}

function userRentals(old, userId) {
  console.log("Recupero i noleggi");
  let index = 0;
  let tbody = $("#RentalsBody").empty();
  if (old) {
    states = userId
      ? ["Completed", "Finished", "Ongoing", "Booked"]
      : ["Finished", "Ongoing", "Booked"];
    tbody.append(createNewRentalFromRow(userId));
  } else states = ["Completed"];
  filters = userId
    ? { sortBy: "from:desc", user: userId }
    : { sortBy: "from:desc" };
  for (let state of states) {
    setTimeout(function () {
      filters.state = state;
      $.ajax({
        url: localhost + "/v1/rentals",
        type: "GET",
        headers: {
          Authorization: "Bearer " + getToken(),
        },
        data: filters,
        success: function (res) {
          console.log(res);
          rentals = res.results;
          for (let r of rentals) {
            let rentalId = r.id;
            let rentalUser = r.user;
            let item = r.item;
            let state = r.state;
            let start = r.from.substring(0, 10);
            let end = r.to.substring(0, 10);
            let price = parseInt(r.price.$numberDecimal);
            let surcharge = parseInt(r.surcharge.$numberDecimal);
            console.log("Recupero nome oggetto");
            // $.ajax({
            //   url: localhost + "/v1/items/" + item,
            //   type: "GET",
            //   headers: {
            //     Authorization: "Bearer " + getToken(),
            //   },
            //   success: function (res) {
            //     item = res.name;
            //     console.log("Recuperato nome oggetto");
            //   },
            //   error: function (res) {
            //     console.log("Errore durante il recupero dell'oggetto");
            //   },
            // });
            let tr = document.createElement("tr");
            tr.className = `${state}Row`;
            tr.innerHTML = `
              <td class="RentalData">
                <input type="text" class="form-control" id="rental${index}Id" value="${rentalId}" disabled>
              </td>
              <td class="RentalData">
                <input type="text" class="form-control" id="rental${index}UserId" value="${rentalUser}" disabled>
              </td>
              <td class="RentalData">
                <input type="text" class="form-control" id="rental${index}Item" value="${item}" disabled>
              </td>
              <td class="RentalData">
                <input type="text" class="form-control" id="rental${index}State" value="${state}">
              </td>
              <td class="RentalData">
                <input type="text" class="form-control" id="rental${index}Dates" value="${start} | ${end}" disabled>
              </td>
              <td class="RentalData">
                <input type="text" class="form-control" id="rental${index}Cost" value="${price} | ${surcharge}" disabled>
              </td>
              <td class="RentalData actionBar">
                <div id="rental${index}Actions">
                  <div class="modalActions">
                    <button class="btn btn-primary bi bi-pencil" id="rentalEdit${index}" onclick="editRental(${index})"></button>
                    <button class="btn btn-primary bi bi-receipt-cutoff" id="rentalBill${index}" onclick="getRentalBill(${index})"></button>
                    <button class="btn btn-primary bi bi-card-text" id="rentalAddNotes${index}" onclick="addRentalAnnotationsPopUp(${index})"></button>
                    <button class="btn btn-primary bi bi-list-task" id="rentalGetNotes${index}" onclick="showRentalAnnotations(${index})"></button>
                    <button class="btn btn-primary bi bi-x" id="rentalRemove${index}" onclick="removeRental(${index})"></button>
                  </div>
                </div>
              </td>`;
            tbody.append(tr);
            insertRentalActions(index++, state);
          }
        },
        error: function (res) {
          console.log("Errore durante il recupero dei noleggi");
        },
      });
    }, timeoutByState[state]);
  }
  $("#UserRentalsModal").modal("show");
}

function createNewRentalFromRow(userId) {
  let id = userId || "";
  let tr = document.createElement("tr");
  tr.innerHTML = `
    <td class="RentalData">
      <input type="text" class="form-control" id="rentalInputId" value="Auto-Generato" disabled>
    </td>
    <td class="RentalData">
      <input type="text" class="form-control" id="rentalInputUserId" value="${id}">
    </td>
    <td class="RentalData">
      <input type="text" class="form-control" id="rentalInputItem" value="">
    </td>
    <td class="RentalData">
      <input type="text" class="form-control" id="rentalInputState" value="">
    </td>
    <td class="RentalData">
      <input type="text" class="form-control" id="rentalInputDates" value="">
    </td>
    <td class="RentalData">
      <input type="text" class="form-control" id="rentalInputTotalPrice" value="">
    </td>
    <td class="RentalData">
      <div id="rentalInputActions">
        <button class="btn btn-primary bi bi-cloud-arrow-up" onclick="postRentalFromRow()"></button>
      </div>
    </td>`;
  return tr;
}

function postRentalFromRow() {
  let user = $("#rentalInputUserId").val().trim();
  let item = $("#rentalInputItem").val().trim();
  let state = $("#rentalInputState").val().trim();
  let dates = $("#rentalInputDates").val().trim();
  let start = dates.split("|")[0].trim();
  let end = dates.split("|")[1].trim();
  let totalePrice = $("#rentalInputTotalPrice").val().trim();
  let price = parseInt(totalePrice.split("|")[0].trim());
  let surcharge = parseInt(totalePrice.split("|")[1].trim());

  $.ajax({
    url: localhost + `/v1/rentals`,
    type: "POST",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: {
      user: user,
      item: item,
      state: state,
      from: start,
      to: end,
      price: price,
      surcharge: surcharge,
    },
    success: function (res) {
      location.reload();
    },
    error: function (res) {
      console.log("Errore durante l'aggiunta del noleggio");
    },
  });
}

function getRentalBill(index) {
  let rentalId = $("#rental" + index + "Id").val();
  let userId = $("#rental" + index + "UserId").val();
  let item = $("#rental" + index + "Item").val();
  let dates = $("#rental" + index + "Dates").val();
  let start = dates.split("|")[0].trim();
  let end = dates.split("|")[1].trim();
  let totalePrice = $("#rental" + index + "Cost").val();
  let price = parseInt(totalePrice.split("|")[0].trim());
  let surcharge = parseInt(totalePrice.split("|")[1].trim());
  $("#rentalId").text(rentalId);
  $("#billUserId").text(userId);
  $("#billItem").text(item);
  $("#billStart").text(start);
  $("#billEnd").text(end);
  $("#billCost").text(price + "€");
  $("#billSurcharge").text(surcharge + "€");
  $("#UserRentalsModal").modal("hide");
  $("#BillModal").modal("show");
}

function editRental(index) {
  console.log("Procedo ad editare il noleggio");
  let rentalId = $("#rental" + index + "Id").val();
  let userId = $("#rental" + index + "UserId").val();
  let item = $("#rental" + index + "Item").val();
  let state = $("#rental" + index + "State").val();
  let dates = $("#rental" + index + "Dates").val();
  let start = dates.split("|")[0].trim();
  let end = dates.split("|")[1].trim();
  let totalePrice = $("#rental" + index + "Cost").val();
  let price = parseInt(totalePrice.split("|")[0].trim());
  let surcharge = parseInt(totalePrice.split("|")[1].trim());
  $.ajax({
    url: localhost + `/v1/rentals/${rentalId}`,
    type: "PATCH",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: {
      user: userId,
      item: item,
      state: state,
      from: start,
      to: end,
      price: price,
      surcharge: surcharge,
    },
    success: function (res) {
      location.reload();
    },
    error: function (res) {
      console.log("Errore durante la modifica dell'utente");
    },
  });
}

function removeRental(index) {
  let id = $(`#rental${index}Id`).val().trim();
  console.log("Procedo a rimuovere il noleggio con id: " + id);
  $.ajax({
    url: localhost + `/v1/rentals/${id}`,
    type: "DELETE",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    success: function (res) {
      location.reload();
    },
    error: function (res) {
      console.log("Errore durante la ricerca dei noleggi in corso");
    },
  });
}
