/* Variabili Globali */

let currentNotationIndex = -1;
let currentItemIndex = -1;
let allItems = [];
let localhost = "https://192.168.1.9:8443";
let surchargeTax = 1.5;
let minCost = 0;
let maxCost = 1000;

const allStates = ["Booked", "Ongoing", "Finished", "Completed"];
const itemStates = {
  Mint: "Nuovo",
  SlightlyDamaged: "Qualche Imperfezione",
  Damaged: "Danneggiato",
  Broken: "Rotto",
};
const timeoutByState = {
  Booked: "200",
  Ongoing: "100",
  Finished: "50",
  Completed: "0",
};
const enableStates = {
  true: "Sì",
  false: "No",
};

/* On Load */
window.onload = (event) => {
  toggleZoomScreen();
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

// Needed to be able to see the full modal
function toggleZoomScreen() {
  document.body.style.zoom = "80%";
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
  user = response.user.username;
  adminId = response.user.id;
  localStorage.setItem("token", token);
  localStorage.setItem("expires", expires);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("user", user);
  localStorage.setItem("adminId", adminId);
}

function deleteTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("expires");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("adminId");
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
    success: function (data) {
      deleteTokens();
      console.log("Logout Eseguito");
      location.reload();
    },
    error: function (err) {
      alert("Errore durante il logout");
      console.log(err.responseText);
    },
  });
}

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
  $("#Rentals").attr("onclick", "showRentals(fromUser=true);");
}

function allowOldRentals() {
  $("#rentalsCaption").text("Noleggi Conclusi");
  $("#OldRentals").attr("onclick", "showRentals(fromUser=false);");
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
      sortBy: "username:asc",
    },
    success: function (res) {
      users = res.results.filter(
        (user) => user.role == "user" || user.id == getLoggedAdminId()
      );
      let tbody = $("#ADBody");
      tbody.empty();
      for (let u of users) {
        let index = users.indexOf(u);
        let id = u.id;
        let username = u.username;
        let name = u.name;
        let surname = u.surname;
        let email = u.email;
        let phone = u.phone;
        let loyalties = u.loyalty;
        let tr = document.createElement("tr");
        tr.innerHTML = `
        <td class="ClientData">
          <input type="text" class="form-control id-cell" id="client${index}Id" value="${id}" disabled>
        </td>
        <td class="ClientData">
          <input type="text" class="form-control" id="client${index}Username" value="${username}">
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
          <td class="ClientData">
            <input type="text" class="form-control" id="client${index}Loyalty" value="${loyalties}" disabled>
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
      alert("Errore durante il recupero degli utenti");
      console.log(res.responseText);
    },
  });
  $("#UserAnagraphicModal").modal("show");
}

/* User Handling */
function editUser(index) {
  console.log("Procedo ad editare l'utente");
  let id = $(`#client${index}Id`).val().trim();
  let username = $(`#client${index}Username`).val().trim();
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
      username: username,
      surname: surname,
      email: email,
      phone: phone,
    },
    success: function (res) {
      location.reload();
    },
    error: function (res) {
      alert("Errore durante la modifica dell'utente");
      console.log(res.responseText);
    },
  });
}

function removeUser(index) {
  let id = $(`#client${index}Id`).val().trim();
  if (id != getLoggedAdminId()) {
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
              console.log(
                "Ci sono " + res.results.length + " noleggi prenotati"
              );
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
                    alert("Errore durante la rimozione dell'utente");
                    console.log(res.responseText);
                  },
                });
              } else {
                alert(
                  "Non è possibile eliminare l'utente, ci sono noleggi prenotati"
                );
                location.reload();
              }
            },
            error: function (res) {
              alert("Errore durante la ricerca dei noleggi prenotati");
              console.log(res.responseText);
            },
          });
        } else {
          alert("Non è possibile eliminare l'utente, ci sono noleggi in corso");
          location.reload();
        }
      },
      error: function (res) {
        alert("Errore durante la ricerca dei noleggi in corso");
        console.log(res.responseText);
      },
    });
  } else {
    alert("Non è possibile eliminare un admin");
    location.reload();
  }
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
      alert("Errore durante l'aggiunta delle annotazioni");
      console.log(res.responseText);
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
      alert("Errore durante il recupero degli utenti");
      console.log(res.responseText);
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
      alert("Errore durante l'aggiunta delle annotazioni");
      console.log(res.responseText);
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
      alert("Errore durante il recupero degli utenti");
      console.log(res.responseText);
    },
  });
}

/* Helpful functions for the rentals */
function getDaysDistance(start, end) {
  return Math.ceil((new Date(end) - new Date(start)) / (1000 * 3600 * 24));
}

function elaborateBaseCost(basePrice, dailyPrice, daysNumber) {
  return parseInt(basePrice + dailyPrice * daysNumber);
}

function elaborateDiscount(
  basePrice,
  dailyPrice,
  daysNumber,
  discount,
  points
) {
  return parseInt(
    (basePrice + dailyPrice * daysNumber) * (discount / 100) + parseInt(points)
  );
}

function elaborateSurcharge(basePrice, dailyPrice, daysNumber) {
  return parseInt(dailyPrice * daysNumber * surchargeTax);
}

function elaborateTotalCost(baseCost, discount, surcharge) {
  total = parseInt(baseCost - discount + surcharge);
  return total >= 0 ? total : 0;
}

/* Functions to insert select values */
function appendCorrectUsers(users, userId) {
  html = `<option value=""></option>`;
  for (let user of users) {
    if (user.id == userId) {
      html += `<option value="${user.id}" selected>${user.username}</option>`;
    } else {
      html += `<option value="${user.id}">${user.username}</option>`;
    }
  }
  return html;
}

function appendCorrectAdmin(admins, adminId) {
  html = `<option value=""></option>`;
  for (let admin of admins) {
    if (admin.id == adminId) {
      html += `<option value="${admin.id}" selected>${admin.username}</option>`;
    } else {
      html += `<option value="${admin.id}">${admin.username}</option>`;
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

function appendCorrectRentalState(stateId = "") {
  html = `<option disabled selected></option>`;
  for (state of allStates) {
    if (state == stateId) {
      html += `<option value="${state}" selected>${state}</option>`;
    } else {
      html += `<option value="${state}">${state}</option>`;
    }
  }
  return html;
}

function appendCorrectItemState(stateId) {
  html = `<option disabled selected>Stato</option>`;
  for (const [key, value] of Object.entries(itemStates)) {
    if (key == stateId) {
      html += `<option value="${key}" selected>${value}</option>`;
    } else {
      html += `<option value="${key}">${value}</option>`;
    }
  }
  return html;
}

function appendCorrectEnableState(enabledId) {
  html = `<option disabled selected>Disponibile?</option>`;
  for (const [key, value] of Object.entries(enableStates)) {
    if (String(key) == String(enabledId)) {
      html += `<option value="${key}" selected>${value}</option>`;
    } else {
      html += `<option value="${key}">${value}</option>`;
    }
  }
  return html;
}

function appendAllItemStates(id) {
  html = `<option disabled selected>Stato</option>`;
  for (const [key, value] of Object.entries(itemStates)) {
    html += `<option value="${key}">${value}</option>`;
  }
  $(`#${id}`).empty().append(html);
}

function appendAllItemCategories(id, categoryId) {
  $.ajax({
    url: localhost + "/v1/items/categories",
    type: "GET",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    success: function (res) {
      html = `<option disabled selected>Categoria</option>`;
      for (let category of res) {
        if (category == categoryId) {
          html += `<option value="${category}" selected>${category}</option>`;
        } else html += `<option value="${category}">${category}</option>`;
      }
      $(`#${id}`).empty().append(html);
    },
    error: function (res) {
      alert("Errore durante il recupero delle categorie");
    },
  });
}

function appendAllItemBrands(id, brandId) {
  $.ajax({
    url: localhost + "/v1/items/brands",
    type: "GET",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    success: function (res) {
      html = `<option disabled selected>Marca</option>`;
      for (let brand of res) {
        if (brand == brandId) {
          html += `<option value="${brand}" selected>${brand}</option>`;
        } else html += `<option value="${brand}">${brand}</option>`;
      }
      $(`#${id}`).empty().append(html);
    },
    error: function (res) {
      alert("Errore durante il recupero delle marche");
    },
  });
}

function appendAllItemAdmin(id) {
  $.ajax({
    url: localhost + "/v1/users",
    type: "GET",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: {
      role: "manager",
      sortBy: "username:asc",
    },
    success: function (res) {
      admins = res.results;
      html = `<option disabled selected>Responsabile</option>`;
      for (let admin of admins) {
        html += `<option value="${admin.id}">${admin.username}</option>`;
      }
      $(`#${id}`).empty().append(html);
    },
    error: function (res) {
      alert("Errore durante il recupero delle marche");
    },
  });
}

/* User Rentals */
function showUserRentals(index) {
  console.log("Mostro i noleggi dell'utente");
  let id = $(`#client${index}Id`).val().trim();
  $("#UserAnagraphicModal").modal("hide");
  $("#ShowRentalsModal").modal("show");
  showRentals(true, id);
}

function showItemRentals(index) {
  console.log("Mostro i noleggi dell'oggetto");
  let id = $(`#item${index}Id`).val().trim();
  $("#ItemsModal").modal("hide");
  $("#ShowRentalsModal").modal("show");
  showRentals(null, null, true, id);
}

function insertRentalActions(index, state) {
  if (state == "Completed") {
    $("#rentalEdit" + index).hide();
    $(`#rental${index}State`).prop("disabled", true);
    $(`#rental${index}ReturnDate`).prop("disabled", true);
    $(`#saveRentalInfos${index}Button`).hide();
    $(`#createRental${index}Button`).hide();
  } else {
    $("#rentalBill" + index).hide();
    $("#rentalAddNotes" + index).hide();
    $("#rentalGetNotes" + index).hide();
    $(`#createRental${index}Button`).hide();
  }

  if (state != "Booked") {
    $("#rentalRemove" + index).hide();
  } else {
    $(`#rental${index}AdminId`).prop("disabled", false);
    $(`#rental${index}Item`).prop("disabled", false);
    $(`#rental${index}Dates`).prop("disabled", false);
  }
}

function editRowRental(index) {
  let key = index != undefined ? index : "Input";
  console.log("Completo i campi del noleggio");
  let item = $(`#rental${key}Item`).val();
  let items = allItems;
  let dates = $(`#rental${key}Dates`).val().split(" | ");
  let returnDate = $(`#rental${key}ReturnDate`).val();
  let points = parseInt($(`#rental${key}Points`).val());
  let days = parseInt(getDaysDistance(dates[0], dates[1]));
  let lateDays = parseInt(getDaysDistance(dates[1], returnDate));
  let itemInfos = "";

  for (let i = 0; i < items.length; i++) {
    if (items[i].id == item) {
      itemInfos = items[i];
      break;
    }
  }

  let baseCost = elaborateBaseCost(
    itemInfos.basePrice,
    itemInfos.dailyPrice,
    days
  );
  let discount = elaborateDiscount(
    itemInfos.basePrice,
    itemInfos.dailyPrice,
    days,
    itemInfos.discount,
    points
  );
  let surcharge = elaborateSurcharge(
    itemInfos.basePrice,
    itemInfos.dailyPrice,
    lateDays
  );
  $(`#rental${key}BaseCost`).val(baseCost);
  $(`#rental${key}Discount`).val(discount);
  $(`#rental${key}Surcharge`).val(surcharge);
  $(`#createRental${key}Button`).show();
}

function elaborateStates(fromUser, userId, fromItem, itemId) {
  if (fromUser || fromItem) {
    states =
      userId || itemId
        ? ["Completed", "Finished", "Ongoing", "Booked"]
        : ["Finished", "Ongoing", "Booked"];
  } else states = ["Completed"];
  return states;
}

function showRentals(fromUser, userId, fromItem, itemId) {
  let index = 0;
  let tbody = $("#RentalsBody").empty();
  console.log("Recupero gli utenti");
  $.ajax({
    url: localhost + "/v1/users",
    type: "GET",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: {
      sortBy: "username:asc",
    },
    success: function (res) {
      admins = res.results.filter((user) => user.role == "manager");
      users = res.results.filter(
        (user) => user.role == "user" || user.id == getLoggedAdminId()
      );
      console.log("Recupero gli oggetti");
      $.ajax({
        url: localhost + "/v1/items",
        type: "GET",
        headers: {
          Authorization: "Bearer " + getToken(),
        },
        success: function (items) {
          states = elaborateStates(fromUser, userId, fromItem, itemId);
          if (states != ["Completed"])
            tbody.append(createNewRentalFromRow(userId, items, itemId));
          filters = {
            sortBy: "from:desc",
          };
          filters = userId ? { ...filters, user: userId } : filters;
          filters = itemId ? { ...filters, item: itemId } : filters;
          console.log("Recupero i noleggi");
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
                  rentals = res.results;
                  for (let r of rentals) {
                    let rentalId = r.id;
                    let rentalUser = r.user != null ? r.user.id : "";
                    let rentalAdmin = r.resp != null ? r.resp.id : "";
                    let rentalItem = r.item != null ? r.item.id : "";
                    let state = r.state;
                    let start = r.from.substring(0, 10);
                    let end = r.to.substring(0, 10);
                    let returnDate = r.return.substring(0, 10);
                    let baseCost = parseInt(r.price.$numberDecimal);
                    let discount = parseInt(r.discount.$numberDecimal);
                    let surcharge = parseInt(r.surcharge.$numberDecimal);
                    let loyalties = parseInt(r.loyalty);
                    let tr = document.createElement("tr");
                    tr.className = `${state}Row`;
                    tr.innerHTML = `
                      <td class="RentalData">
                        <input type="text" class="form-control id-cell" id="rental${index}Id" value="${rentalId}" disabled>
                      </td>
                      <td class="RentalData">
                        <select class="form-control id-cell" id="rental${index}UserId" disabled>
                          ${appendCorrectUsers(users, rentalUser)}
                        </select>
                      </td>
                      <td class="RentalData">
                        <select class="form-control id-cell" id="rental${index}Admin" disabled>
                          ${appendCorrectAdmin(admins, rentalAdmin)}
                        </select>
                      </td>
                      <td class="RentalData">
                        <select class="form-control id-cell" id="rental${index}Item" onchange="editRowExpenses(this, ${index})" disabled>
                          ${appendCorrectItem(items.results, rentalItem)}
                        </select>
                      </td>
                      <td class="RentalData">
                        <select class="form-control id-cell" id="rental${index}State">
                          ${appendCorrectRentalState(state)}
                        </select>
                      </td>
                      <td class="RentalData">
                        <input type="text" class="form-control" id="rental${index}Dates" value="${start} | ${end}" disabled>
                      </td>
                      <td class="RentalData">
                        <input type="text" class="form-control id-cell" id="rental${index}ReturnDate" value="${returnDate}">
                      </td>
                      <td class="RentalData">
                        <input type="text" class="form-control id-cell" id="rental${index}Points" value="${loyalties}" disabled>
                      </td>
                      <td class="RentalData">
                        <input type="text" class="form-control id-cell" id="rental${index}BaseCost" value="${baseCost}" disabled>
                      </td>
                      <td class="RentalData">
                        <input type="text" class="form-control id-cell" id="rental${index}Discount" value="${discount}" disabled>
                      </td>
                      <td class="RentalData">
                        <input type="text" class="form-control id-cell" id="rental${index}Surcharge" value="${surcharge}" disabled>
                      </td>
                      <td class="RentalData actionBar">
                        <div id="rental${index}Actions">
                          <div class="modalActions">
                            <button class="btn btn-primary bi bi-caret-down" id="saveRentalInfos${index}Button" onclick="editRowRental(${index})"></button>
                            <button class="btn btn-primary bi bi-pencil" id="createRental${index}Button" onclick="editRental(${index})"></button>
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
                  alert("Errore durante il recupero dei noleggi");
                  location.reload();
                },
              });
            }, timeoutByState[state]);
          }
        },
        error: function (res) {
          alert("Errore durante il recupero degli oggetti");
          location.reload();
        },
      });
    },
    error: function (res) {
      alert("Errore durante il recupero degli utenti");
      location.reload();
    },
  });
  $("#UserRentalsModal").modal("show");
}

function createNewRentalFromRow(userId, items, itemId) {
  allItems = items.results;
  let tr = document.createElement("tr");
  tr.innerHTML = `
    <td class="RentalData">
      <input type="text" class="form-control id-cell" id="rentalInputId" value="Auto-Generato" disabled>
    </td>
    <td class="RentalData">
      <select class="form-control id-cell" id="rentalInputUserId" value="">
        ${appendCorrectUsers(users, userId)}
      </select>
    </td>
    <td class="RentalData">
      <input type="text" class="form-control id-cell" id="rentalInputAdmin" value="Auto-Ricavato" disabled>
    </td>
    <td class="RentalData">
      <select class="form-control id-cell" id="rentalInputItem" value="">
        ${appendCorrectItem(allItems, itemId)}
      </select>
    </td>
    <td class="RentalData">
      <select class="form-control id-cell" id="rentalInputState" value="">
        ${appendCorrectRentalState()}
      </select>
    </td>
    <td class="RentalData">
      <input type="text" class="form-control" id="rentalInputDates" value="">
    </td>
    <td class="RentalData">
      <input type="text" class="form-control id-cell" id="rentalInputReturnDate">
    </td>
    <td class="RentalData">
      <input type="text" class="form-control id-cell" id="rentalInputPoints">
    </td>
    <td class="RentalData">
      <input type="text" class="form-control id-cell" id="rentalInputBaseCost" value="Premi e Calcola" disabled>
    </td>
    <td class="RentalData">
      <input type="text" class="form-control id-cell" id="rentalInputDiscount" value="Premi e Calcola" disabled>
    </td>
    <td class="RentalData">
      <input type="text" class="form-control id-cell" id="rentalInputSurcharge" value="Premi e Calcola" disabled>
    </td>
    <td class="RentalData">
      <div id="rentalInputActions">
        <button class="btn btn-primary bi bi-caret-down" id="saveRentalInfosInputButton" onclick="editRowRental()"></button>
        <button class="btn btn-primary bi bi-cloud-arrow-up" id="createRentalInputButton" onclick="postRentalFromRow()"></button>
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
  let returnDate = $("#rentalInputReturnDate").val().trim();
  let baseCost = $("#rentalInputBaseCost").val().trim();
  let points = $("#rentalInputPoints").val().trim();
  let discount = $("#rentalInputDiscount").val().trim();
  let surcharge = $("#rentalInputSurcharge").val().trim();
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
      return: returnDate,
      discount: discount,
      loyalty: points,
      surcharge: surcharge,
      price: baseCost,
    },
    success: function (res) {
      location.reload();
    },
    error: function (res) {
      alert("Errore durante l'aggiunta del noleggio");
      console.log(res.responseText);
    },
  });
}

function getRentalBill(index) {
  let id = $(`#rental${index}Id`).val().trim();
  let user = $(`#rental${index}UserId option:selected`).text().trim();
  let item = $(`#rental${index}Item option:selected`).text().trim();
  let dates = $(`#rental${index}Dates`).val().trim();
  let start = dates.split("|")[0].trim();
  let end = dates.split("|")[1].trim();
  let days = getDaysDistance(start, end);
  let returnDate = $(`#rental${index}ReturnDate`).val().trim();
  lateDays = getDaysDistance(end, returnDate);
  let baseCost = $(`#rental${index}BaseCost`).val().trim();
  let points = $(`#rental${index}Points`).val().trim();
  let discount = $(`#rental${index}Discount`).val().trim();
  let surcharge = $(`#rental${index}Surcharge`).val().trim();
  let totalCost = elaborateTotalCost(
    parseInt(baseCost),
    parseInt(discount),
    parseInt(surcharge)
  );
  $("#rentalIds").html(id + "<br>" + user + "<br>" + item);
  $("#billDates").html(start + "<br>" + end + "<br>" + returnDate);
  $("#billDays").html(
    days + " giorni" + "<br>" + lateDays + " giorni" + "<br>" + points
  );
  $("#billExpenses").html(
    baseCost + "€<br>" + discount + "€<br>" + surcharge + "€"
  );
  $("#billTotalCost").text(totalCost + "€");
  $("#UserRentalsModal").modal("hide");
  $("#BillModal").modal("show");
}

function checkAdmin(adminId) {
  if (getLoggedAdminId() == adminId || getLoggedAdminId() == "") {
    return true;
  }
  return false;
}

function editRental(index) {
  if (checkAdmin($("#rental" + index + "Admin").val())) {
    console.log("Procedo ad editare il noleggio");
    let rentalId = $(`#rental${index}Id`).val();
    let userId = $(`#rental${index}UserId`).val().trim();
    let resposible = $(`#rental${index}Admin`).val().trim();
    let item = $(`#rental${index}Item`).val().trim();
    let state = $(`#rental${index}State`).val().trim();
    let dates = $(`#rental${index}Dates`).val().trim();
    let start = dates.split(`|`)[0].trim();
    let end = dates.split(`|`)[1].trim();
    let returnDate = $(`#rental${index}ReturnDate`).val().trim();
    let baseCost = $(`#rental${index}BaseCost`).val().trim();
    let discount = $(`#rental${index}Discount`).val().trim();
    let surcharge = $(`#rental${index}Surcharge`).val().trim();
    $.ajax({
      url: localhost + `/v1/rentals/${rentalId}`,
      type: "PATCH",
      headers: {
        Authorization: "Bearer " + getToken(),
      },
      data: {
        user: userId,
        resp: resposible,
        item: item,
        state: state,
        from: start,
        to: end,
        return: returnDate,
        price: baseCost,
        discount: discount,
        surcharge: surcharge,
      },
      success: function (res) {
        location.reload();
      },
      error: function (res) {
        alert("Errore durante la modifica dell'utente");
        console.log(res.responseText);
      },
    });
  } else {
    alert("Non sei autorizzato a modificare questo noleggio");
  }
}

function removeRental(index) {
  if (checkAdmin($("#rental" + index + "Admin").val())) {
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
        alert("Errore durante la ricerca dei noleggi in corso");
        console.log(res.responseText);
      },
    });
  }
}

/* Inventory */
function showInventory() {
  appendAllItemCategories("categoryButton");
  appendAllItemBrands("brandButton");
  appendAllItemStates("stateButton");
  $("#InventoryModal").modal("show");
  $("#slider-range").slider({
    range: true,
    min: minCost,
    max: maxCost,
    values: [minCost, maxCost],
    slide: function (event, ui) {
      $("#minAmount").val(ui.values[0]);
      $("#maxAmount").val(ui.values[1]);
    },
    change: function (event, ui) {
      filterValues = {
        start: document.getElementById("minAmount").value,
        end: document.getElementById("maxAmount").value,
      };
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
  appendAllItemStates("stateInput");
  appendAllItemCategories("categoryInput");
  appendAllItemBrands("brandInput");
  appendAllItemAdmin("adminInput");
  $("#InventoryModal").modal("hide");
  $("#AddItemModal").modal("show");
}

function resetFilters() {
  $(`#categoryButton`).val("Categoria");
  $(`#brandButton`).val("Marca");
  $(`#stateButton`).val("Stato");
  $(`#minAmount`).val(minCost);
  $(`#maxAmount`).val(maxCost);
  $("#slider-range").slider("values", 0, minCost);
  $("#slider-range").slider("values", 1, maxCost);
}

function searchItems() {
  let tbody = $("#ItemsBody").empty();
  let category = $(`#categoryButton`).val() || "";
  let brand = $(`#brandButton`).val() || "";
  let state = $(`#stateButton`).val() || "";
  let start = document.getElementById("minAmount").value;
  let end = document.getElementById("maxAmount").value;
  let filters = {
    priceFrom: start,
    priceTo: end,
    sortBy: "id:asc",
  };
  filters = category != "" ? { ...filters, category: category } : filters;
  filters = brand != "" ? { ...filters, brand: brand } : filters;
  filters = state != "" ? { ...filters, state: state } : filters;
  console.log("Recupero gli utenti");
  $.ajax({
    url: localhost + "/v1/users",
    type: "GET",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: {
      role: "manager",
      sortBy: "username:asc",
    },
    success: function (users) {
      console.log("Recupero gli items");
      admins = users.results;
      $.ajax({
        url: localhost + "/v1/items",
        type: "GET",
        data: filters,
        dataType: "json",
        headers: {
          Authorization: "Bearer " + getToken(),
        },
        success: function (res) {
          items = res.results;
          for (let i of items) {
            index = items.indexOf(i);
            let itemId = i.id;
            let itemResp = i.resp;
            let name = i.name;
            let image = i.image;
            let description = i.description;
            let state = i.state;
            let category = i.category;
            let brand = i.brand;
            let baseCost = i.basePrice;
            let dailyCost = i.dailyPrice;
            let discount = i.discount;
            let enabled = i.enabled;
            let tr = document.createElement("tr");
            tr.innerHTML = `
                      <td class="RentalData">
                        <input type="file" class="form-control image-cell" id="item${index}Image" aria-describedby="Image" placeholder="Inserire Immagine" value=${image}>
                      </td>
                      <td class="RentalData">
                        <input type="text" class="form-control id-cell" id="item${index}Id" value="${itemId}" disabled>
                       </td>
                      <td class="RentalData">
                        <select class="form-control id-cell" id="item${index}Admin" >
                          ${appendCorrectAdmin(admins, itemResp)}
                        </select>
                      </td>
                      <td class="RentalData">
                        <input type="text" class="form-control id-cell" id="item${index}Name" value="${name}">
                      </td>
                      <td class="RentalData">
                        <input type="text" class="form-control id-cell" id="item${index}Description" value="${description}">
                      </td>
                      <td class="RentalData">
                        <select class="form-control id-cell" id="item${index}Category">
                          ${appendAllItemCategories(
                            `item${index}Category`,
                            category
                          )}
                        </select>
                      </td>
                      <td class="RentalData">
                        <select class="form-control id-cell" id="item${index}Brand">
                          ${appendAllItemBrands(`item${index}Brand`, brand)}
                        </select>
                      </td>
                      <td class="RentalData">
                        <select class="form-control id-cell" id="item${index}State">
                          ${appendCorrectItemState(state)}
                        </select>
                      </td>
                      <td class="RentalData">
                        <input type="text" class="form-control id-cell" id="item${index}Costs" value="${baseCost} | ${dailyCost}">
                      </td>
                      <td class="RentalData">
                        <input type="text" class="form-control id-cell" id="item${index}Discount" value="${discount}" >
                      </td>
                      <td class="RentalData">
                        <select class="form-control id-cell" id="item${index}State">
                          ${appendCorrectEnableState(enabled)}
                        </select>
                      </td>
                      <td class="RentalData actionBar">
                        <div id="rental${index}Actions">
                          <div class="modalActions">
                            <button class="btn btn-primary bi bi-bag-check" id="saveRentalInfos${index}Button" onclick="showItemRentals(${index})"></button>
                            <button class="btn btn-primary bi bi-pencil" id="createRental${index}Button" onclick="editItem(${index})"></button>
                            <button class="btn btn-primary bi bi-x" id="rentalRemove${index}" onclick="removeItem(${index})"></button>
                          </div>
                        </div>
                    </td>`;
            tbody.append(tr);
          }
        },
        error: function (err) {
          alert("Errore nel recupero degli items");
          console.log(err.responseText);
        },
      });
      $("#InventoryModal").modal("hide");
      $("#ItemsModal").modal("show");
    },
    error: function (err) {
      console.log("Errore nel recupero degli utenti");
      console.log(err.responseText);
    },
  });
}

function insertNewItem() {
  let item = {
    image: $("#imageInput").val(),
    name: $("#nameInput").val(),
    description: $("#descriptionInput").val(),
    category: $("#categoryInput").val(),
    resp: $("#adminInput").val(),
    brand: $("#brandInput").val(),
    state: $("#stateInput").val(),
    basePrice: $("#baseCostInput").val(),
    dailyPrice: $("#dailyCostInput").val(),
    discount: $("#discountInput").val(),
    enabled: $("#enabledInput").val(),
  };
  console.log("Recupero gli items");
  $.ajax({
    url: localhost + "/v1/items",
    type: "POST",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: item,
    success: function (data) {
      $("#ItemsModal").modal("hide");
      location.reload();
    },
    error: function (err) {
      alert("Errore nell'inserimento dell'item");
      console.log(err.responseText);
    },
  });
}

function editItem(index) {
  if (checkAdmin($("#item" + index + "Admin").val())) {
    let id = $("#item" + index + "Id").val();
    let item = {
      image: $("#item" + index + "Image").val(),
      name: $("#item" + index + "Name").val(),
      description: $("#item" + index + "Description").val(),
      category: $("#item" + index + "Category").val(),
      resp: $("#item" + index + "Admin").val(),
      brand: $("#item" + index + "Brand").val(),
      state: $("#item" + index + "State").val(),
      basePrice: $("#item" + index + "Costs")
        .val()
        .split("|")[0]
        .trim(),
      dailyPrice: $("#item" + index + "Costs")
        .val()
        .split("|")[1]
        .trim(),
      discount: $("#item" + index + "Discount").val(),
      enabled: $("#item" + index + "State").val() === "true",
    };
    console.log(item.enabled);
    console.log("Aggiorno l'item");
    $.ajax({
      url: localhost + "/v1/items/" + id,
      type: "PATCH",
      headers: {
        Authorization: "Bearer " + getToken(),
      },
      data: item,
      success: function (data) {
        $("#ItemsModal").modal("hide");
        location.reload();
      },
      error: function (err) {
        alert("Errore nella modifica dell'item");
        console.log(err.responseText);
      },
    });
  } else {
    alert("Non hai i permessi per modificare questo elemento");
    location.reload();
  }
}

function removeItem(index) {
  if (checkAdmin($("#item" + index + "Admin").val())) {
    let itemId = $("#item" + index + "Id").val();
    console.log("Recupero i noleggi dell'item");
    $.ajax({
      url: localhost + "/v1/rentals/",
      type: "GET",
      data: { item: itemId },
      success: function (data) {
        if (data.results.length == 0) {
          $.ajax({
            url: localhost + "/v1/items/" + itemId,
            type: "DELETE",
            headers: {
              Authorization: "Bearer " + getToken(),
            },
            success: function (data) {
              $("#ItemsModal").modal("hide");
              location.reload();
            },
            error: function (err) {
              alert("Errore nella rimozione dell'item");
            },
          });
        } else {
          $.ajax({
            url: localhost + "/v1/items/" + itemId,
            type: "PATCH",
            headers: {
              Authorization: "Bearer " + getToken(),
            },
            data: { enabled: false },
            success: function (data) {
              $("#ItemsModal").modal("hide");
              alert(
                "Non puoi eliminare un oggetto che è o è stato in prestito: è stato reso indisponibile"
              );
              location.reload();
            },
            error: function (err) {
              alert("Errore nell'editing dell'item");
            },
          });
        }
      },
      error: function (err) {
        alert("Errore nella recupero dei noleggi");
      },
    });
  } else {
    alert("Non hai i permessi per modificare questo elemento");
    location.reload();
  }
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
