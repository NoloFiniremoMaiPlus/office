let currentNotationIndex = -1;
let currentItemIndex = -1;
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

function getLoggedAdminId() {
  return localStorage.getItem("adminId");
}

function saveToken(response) {
  token = response.tokens.access.token;
  expires = response.tokens.access.expires;
  refreshToken = response.tokens.refresh.token;
  user = response.user.name;
  adminId = response.user.id;
  localStorage.setItem("token", token);
  localStorage.setItem("expires", expires);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("user", user);
  localStorage.setItem("adminId", adminId);
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

function loginFromItemRequired() {
  $("#AddItemModal").modal("hide");
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
  $("#itemButton").attr("onclick", "insertNewItem()");
  allowBrandFilter();
  allowStateFilter();
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

function allowBrandFilter() {
  $("#brandFilter").show();
}

function allowStateFilter() {
  $("#stateFilter").show();
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
          <input type="text" class="form-control id-cell" id="client${index}Id" value="${id}">
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
  console.log(comment);
  $.ajax({
    url: localhost + `/v1/users/${id}`,
    type: "PATCH",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: {
      annotation: {
        quick: annotations,
        text: comment,
      },
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

function addRentalAnnotations() {
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
    url: localhost + `/v1/rentals/${id}`,
    type: "PATCH",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: {
      annotation: {
        quick: annotations,
        text: comment,
      },
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
    url: localhost + "/v1/rentals/" + id,
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
    $(`#rental${index}Dates`).prop("disabled", true);
    $(`#rental${index}Expenses`).prop("disabled", true);
  } else {
    $("#rentalBill" + index).hide();
    $("#rentalAddNotes" + index).hide();
    $("#rentalGetNotes" + index).hide();
  }

  if (state != "Booked") {
    $("#rentalRemove" + index).hide();
  } else {
    $(`#rental${index}UserId`).prop("disabled", false);
    $(`#rental${index}AdminId`).prop("disabled", false);
    $(`#rental${index}Item`).prop("disabled", false);
  }
}

function elaboratePrice(basePrice, dailyPrice, discount, start, to, lateDays) {
  console.log("Calcolo il prezzo");
  var daysDifference = (Date(to) - Date(start)) / (1000 * 3600 * 24);
  return (
    (basePrice + dailyPrice * daysDifference) * (1 - discount / 100) +
    lateDays * dailyPrice * 1.5
  );
}

function appendAllClients(clients, userId) {
  html = `<option value=""></option>`;
  for (let client of clients) {
    html += `<option value="${client.id}">${client.email}</option>`;
  }
  return html;
}

function appedAllAdmins(admins) {
  html = `<option value="${getLoggedAdminId()}">${getLoggedUser()}</option>`;
  for (let admin of admins) {
    if (admin.id != getLoggedAdminId()) {
      html += `<option value="${admin.id}">${admin.email}</option>`;
    }
  }
  return html;
}

function appendAllItems(items) {
  html = `<option value=""></option>`;
  for (let item of items) {
    html += `<option value="${item.id}">${item.name}</option>`;
  }
  return html;
}

function appendCorrectUsers(users, userId) {
  html = `<option value=""></option>`;
  for (let user of users) {
    if (user.id == userId) {
      html += `<option value="${user.id}" selected>${user.name}</option>`;
    } else {
      html += `<option value="${user.id}">${user.name}</option>`;
    }
  }
  return html;
}

function appendCorrectAdmin(admins, adminId) {
  html = `<option value=""></option>`;
  for (let admin of admins) {
    if (admin.id == adminId) {
      html += `<option value="${admin.id}" selected>${admin.name}</option>`;
    } else {
      html += `<option value="${admin.id}">${admin.name}</option>`;
    }
  }
  return html;
}

function appendCorrectItem(items, itemId) {
  html = `<option value=""></option>`;
  for (let item of items) {
    if (item.id == itemId) {
      html += `<option value="${item.id}" selected>${item.name}</option>`;
    } else {
      html += `<option value="${item.id}">${item.name}</option>`;
    }
  }
  return html;
}

function userRentals(old, userId) {
  let index = 0;
  let tbody = $("#RentalsBody").empty();
  $.ajax({
    url: localhost + "/v1/users",
    type: "GET",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    success: function (allUsers) {
      console.log("Recupero gli utenti");
      admins = allUsers.results.filter((user) => user.role == "manager");
      users = allUsers.results.filter((user) => user.role == "user");
      $.ajax({
        url: localhost + "/v1/items",
        type: "GET",
        headers: {
          Authorization: "Bearer " + getToken(),
        },
        success: function (items) {
          if (old) {
            states = userId
              ? ["Completed", "Finished", "Ongoing", "Booked"]
              : ["Finished", "Ongoing", "Booked"];
            tbody.append(createNewRentalFromRow(userId, items));
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
                  console.log("Recupero i noleggi");
                  rentals = res.results;
                  for (let r of rentals) {
                    let rentalId = r.id;
                    let rentalUser = r.user;
                    let rentalAdmin = r.resp || "";
                    let rentalItem = r.item;
                    let state = r.state;
                    let start = r.from.substring(0, 10);
                    let end = r.to.substring(0, 10);
                    let basePrice = r.basePrice;
                    let dailyPrice = r.dailyPrice;
                    let discount = r.discount;
                    let lateDays = r.lateDays || 0;
                    let totalCost = elaboratePrice(
                      basePrice,
                      dailyPrice,
                      discount,
                      start,
                      end,
                      lateDays
                    );
                    console.log("Recuperati gli oggetti");
                    let tr = document.createElement("tr");
                    tr.className = `${state}Row`;
                    tr.innerHTML = `
                    <td class="RentalData">
                      <input type="text" class="form-control id-cell" id="rental${index}Id" value="${rentalId}" disabled>
                    </td>
                    <td class="RentalData">
                      <select class="form-control id-cell" id="rental${index}UserId" disabled>
                        ${appendAllClients(users, rentalUser)}
                      </select>
                    </td>
                    <td class="RentalData">
                      <select class="form-control id-cell" id="rental${index}AdminId" disabled>
                        ${appendCorrectAdmin(admins, rentalAdmin)}
                      </select>
                    </td>
                    <td class="RentalData">
                      <select class="form-control id-cell" id="rental${index}Item" disabled>
                        ${appendCorrectItem(items.results, rentalItem)}
                      </select>
                    </td>
                    <td class="RentalData">
                      <input type="text" class="form-control id-cell" id="rental${index}State" value="${state}">
                    </td>
                    <td class="RentalData">
                      <input type="text" class="form-control" id="rental${index}Dates" value="${start} | ${end}">
                    </td>
                    <td class="RentalData">
                      <input type="text" class="form-control id-cell" id="rental${index}Expenses" value="${basePrice} | ${dailyPrice} | ${discount} | ${lateDays}">
                    </td>
                    <td class="RentalData">
                      <input type="text" class="form-control id-cell" id="rental${index}TotalCost" value="${totalCost}" disabled>
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
        },
        error: function (res) {
          console.log("Errore durante il recupero degli oggetti");
        },
      });
    },
    error: function (res) {
      console.log("Errore durante il recupero degli utenti");
    },
  });
  $("#UserRentalsModal").modal("show");
}

function createNewRentalFromRow(userId, items) {
  let id = userId || "";
  let adminId = "";
  let tr = document.createElement("tr");
  tr.innerHTML = `
    <td class="RentalData">
      <input type="text" class="form-control id-cell" id="rentalInputId" value="Auto-Generato" disabled>
    </td>
    <td class="RentalData">
      <select class="form-control id-cell" id="rentalInputUserId" value="">
          ${appendCorrectUsers(users, id)}
      </select>
    </td>
    <td class="RentalData">
      <select class="form-control id-cell" id="rentalInputItem" value="">
          ${appedAllAdmins(admins)}
        </select>
    </td>
    <td class="RentalData">
      <select class="form-control id-cell" id="rentalInputItem" value="">
        ${appendAllItems(items.results)}
      </select>
    </td>
    <td class="RentalData">
      <input type="text" class="form-control id-cell" id="rentalInputState" value="">
    </td>
    <td class="RentalData">
      <input type="text" class="form-control" id="rentalInputDates" value="">
    </td>
    <td class="RentalData">
      <input type="text" class="form-control id-cell" id="rentalInputExpenses" value="">
    </td>
    <td class="RentalData">
      <input type="text" class="form-control id-cell" id="rentalInputTotalPrice" value="Auto-Calcolato" disabled>
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
  let priceVariables = $("#rentalInputExpenses").val().trim();
  let basePrice = parseInt(priceVariables.split("|")[0].trim());
  let dailyPrice = parseInt(priceVariables.split("|")[1].trim());
  let discount = parseInt(priceVariables.split("|")[2].trim());
  let lateDays = parseInt(priceVariables.split("|")[3].trim());

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
      basePrice: basePrice,
      dailyPrice: dailyPrice,
      discount: discount,
      lateDays: lateDays,
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
  let priceVariables = $("#rental" + index + "Expenses").val();
  let basePrice = parseInt(priceVariables.split("|")[0].trim());
  let dailyPrice = parseInt(priceVariables.split("|")[1].trim());
  let discount = parseInt(priceVariables.split("|")[2].trim());
  let lateDays = parseInt(priceVariables.split("|")[3].trim());
  let totalePrice = $("#rental" + index + "TotalCost").val();
  $("#rentalId").text(rentalId);
  $("#billUserId").text(userId);
  $("#billItem").text(item);
  $("#billStart").text(start);
  $("#billEnd").text(end);
  $("#billTotalCost").text(totalePrice + "€");
  $("#billExpenses").text(basePrice + "€" + " + " + dailyPrice + "€/g");
  $("#billDiscount").text(discount + "%");
  $("#billLateDays").text(lateDays + " giorni");
  $("#UserRentalsModal").modal("hide");
  $("#BillModal").modal("show");
}

function checkAdmin(adminId) {
  if (getLoggedAdminId() == adminId) {
    return true;
  } else {
    alert("Non sei autorizzato a modificare questo noleggio");
    return false;
  }
}

function editRental(index) {
  if (checkAdmin($("#rental" + index + "AdminId").val())) {
    console.log("Procedo ad editare il noleggio");
    let rentalId = $("#rental" + index + "Id").val();
    let userId = $("#rental" + index + "UserId").val();
    let item = $("#rental" + index + "Item").val();
    let state = $("#rental" + index + "State").val();
    let dates = $("#rental" + index + "Dates").val();
    let start = dates.split("|")[0].trim();
    let end = dates.split("|")[1].trim();
    let priceVariables = $("#rental" + index + "Expenses").val();
    let basePrice = parseInt(priceVariables.split("|")[0].trim());
    let dailyPrice = parseInt(priceVariables.split("|")[1].trim());
    let discount = parseInt(priceVariables.split("|")[2].trim());
    let lateDays = parseInt(priceVariables.split("|")[3].trim());
    let totalPrice = $("#rental" + index + "TotalCost")
      .val()
      .trim();
    console.log(item);
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
        basePrice: basePrice,
        dailyPrice: dailyPrice,
        discount: discount,
        lateDays: lateDays,
        totalPrice: totalPrice,
      },
      success: function (res) {
        location.reload();
      },
      error: function (res) {
        console.log("Errore durante la modifica dell'utente");
      },
    });
  }
}

function removeRental(index) {
  if (checkAdmin($("#rental" + index + "AdminId").val())) {
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
}

function activateButtonDropdown(idList, idButton) {
  $(`#${idList} a`).on("click", function () {
    $(`#${idButton}`).text($(this).html());
  });
}

function showInventory() {
  $("#InventoryModal").modal("show");
  activateButtonDropdown("category", "categoryDropdownMenuButton");
  activateButtonDropdown("brand", "brandDropdownMenuButton");
  activateButtonDropdown("state", "stateDropdownMenuButton");
  $("#slider-range").slider({
    range: true,
    min: 0,
    max: 1000,
    values: [0, 1000],
    slide: function (event, ui) {
      $("#minAmount").val(ui.values[0]);
      $("#maxAmount").val(ui.values[1]);
    },
    change: function (event, ui) {
      filterValues = {
        start: document.getElementById("minAmount").value,
        end: document.getElementById("maxAmount").value,
      };
      // $.ajax({
      //   url: "/db/filtersCataLOG/",
      //   type: "POST",
      //   data: { filters, filterValues },
      //   dataType: "json",
      //   contentType: "application/x-www-form-urlencoded",
      //   success: function (data) {
      //     cards(data);
      //   },
      // });
    },
  });

  $("#minAmount").val($("#slider-range").slider("values", 0));
  $("#maxAmount").val($("#slider-range").slider("values", 1));
}

function updateSlider() {
  $("#slider-range").slider(
    "values",
    0,
    document.getElementById("minAmount").value
  );
  $("#slider-range").slider(
    "values",
    1,
    document.getElementById("maxAmount").value
  );
}

function addItem() {
  $("#InventoryModal").modal("hide");
  $("#AddItemModal").modal("show");
}

function resetFilters() {
  console.log("Resetto i filtri");
  $(`#categoryDropdownMenuButton`).text("Categoria");
  $(`#brandDropdownMenuButton`).text("Marca");
  $(`#stateDropdownMenuButton`).text("Stato");
}

function searchItems() {
  let category = $(`#categoryDropdownMenuButton`).text();
  let brand = $(`#brandDropdownMenuButton`).text();
  let state = $(`#stateDropdownMenuButton`).text();
  let start = document.getElementById("minAmount").value;
  let end = document.getElementById("maxAmount").value;
  let filters = {
    category: category,
    brand: brand,
    state: state,
    minPrice: start,
    maxPrice: end,
  };
  // $.ajax({
  //   url: localhost + "/v1/items",
  //   type: "POST",
  //   data: { filters },
  //   dataType: "json",
  //   contentType: "application/x-www-form-urlencoded",
  //   success: function (data) {
  //     cards(data);
  //   },
  // });
  console.log("Filtri: " + JSON.stringify(filters));
  $("#InventoryModal").modal("hide");
  $("#ItemsModal").modal("show");
}

function insertNewItem() {
  let item = {
    image: $("#imageInput").val(),
    name: $("#nameInput").val(),
    description: $("#descriptionInput").val(),
    category: $("#categoriaInput").val(),
    brand: $("#brandInput").val(),
    state: $("#stateInput").val(),
    price: $("#costInput").val(),
    note: $("#noteInput").val(),
  };
  console.log("Procedo ad inserire l'oggetto: " + JSON.stringify(item));
  // $.ajax({
  //   url: localhost + "/v1/items",
  //   type: "POST",
  //   data: { item },
  //   dataType: "json",
  //   contentType: "application/x-www-form-urlencoded",
  //   success: function (data) {
  //     console.log("Item aggiunto");
  //     $("#ItemsModal").modal("hide");
  //     location.reload();
  //   },
  // });
}

function showAvaiability(index) {
  $("#ItemsModal").modal("hide");
  $("#AvaiabilityModal").modal("show");
  $("unavaiabilityButton").hide();
  currentItemIndex = index;
}

function showUnavaiability(index) {
  $("#ItemsModal").modal("hide");
  $("#AvaiabilityModal").modal("show");
  $("avaiabilityButton").show();
  currentItemIndex = index;
}

function addAvaiability() {
  index = currentItemIndex;
  let from = $("#fromInput").val();
  let to = $("#toInput").val();
  let itemId = $(`#item${index}Id`).val().trim();
  let avaiability = {
    from: from,
    to: to,
    itemId: itemId,
  };
  console.log(
    "Procedo ad aggiungere l'avaiabilità: " + JSON.stringify(avaiability)
  );
  // $.ajax({
  //   url: localhost + "/v1/avaiabilities",
  //   type: "POST",
  //   data: { avaiability },
  //   dataType: "json",
  //   contentType: "application/x-www-form-urlencoded",
  //   success: function (data) {
  //     console.log("Avaiabilità aggiunta");
  //     $("#AvaiabilityModal").modal("hide");
  //     location.reload();
  //   },
  //   error: function (data) {
  //   console.log("Errore nell'aggiunta della disponibilità");
  //   $("#AvaiabilityModal").modal("hide");
  // },
  // });
}

function removeAvaiability() {
  index = currentItemIndex;
  let from = $("#fromInput").val();
  let to = $("#toInput").val();
  let itemId = $(`#item${index}Id`).val().trim();
  let avaiability = {
    from: from,
    to: to,
    itemId: itemId,
  };
  console.log(
    "Procedo ad aggiungere l'avaiabilità: " + JSON.stringify(avaiability)
  );
  // $.ajax({
  //   url: localhost + "/v1/avaiabilities",
  //   type: "POST",
  //   data: { avaiability },
  //   dataType: "json",
  //   contentType: "application/x-www-form-urlencoded",
  //   success: function (data) {
  //     console.log("Avaiabilità aggiunta");
  //     $("#AvaiabilityModal").modal("hide");
  //     location.reload();
  //   },
  //   error: function (data) {
  //   console.log("Errore nell'aggiunta della disponibilità");
  //   $("#AvaiabilityModal").modal("hide");
  // },
  // });
}
