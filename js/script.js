/* Variabili Globali */

let currentNotationIndex = -1;
let currentItemIndex = -1;
let currentItemId = -1;
let allItems = [];
let localhost = "https://site202132.tw.cs.unibo.it";
let surchargeTax = 1.5;
let minCost = 0;
let maxCost = 100;

const allStates = ["Booked", "Accepted", "Ongoing", "Expired", "Returned"];
const itemStates = {
  Mint: "Nuovo",
  SlightlyDamaged: "Qualche Imperfezione",
  Damaged: "Danneggiato",
  Broken: "Rotto",
};
const timeoutByState = {
  Booked: "200",
  Accepted: "150",
  Ongoing: "100",
  Expired: "50",
  Returned: "0",
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

function saveTokens(response) {
  let token = response.tokens.access.token;
  let expires = response.tokens.access.expires;
  let refreshToken = response.tokens.refresh.token;
  let user = response.user.username;
  let adminId = response.user.id;
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
      if (data.user.role == "user") {
        $("#LoginModal").modal("hide");
        alert("Non sei autorizzato ad accedere a questa pagina");
      } else saveTokens(data);
      location.reload();
    },
    error: function (data) {
      $("#loginForm").trigger("reset");
      $("#loginCaption").text("Email o password errata");
    },
  });
}

function logout() {
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
      location.reload();
    },
    error: function (err) {
      alert("Errore durante il logout");
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
      users = res.results;
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
        let role = u.role;
        let tr = document.createElement("tr");
        tr.innerHTML = `
        <td class="ClientData hidden">
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
          <td class="ClientData">
            <input type="text" class="form-control" id="client${index}Role" value="${role}" disabled>
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
    },
  });
  $("#UserAnagraphicModal").modal("show");
}

/* User Handling */
function editUser(index) {
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
    },
  });
}

function removeUser(index) {
  let id = $(`#client${index}Id`).val().trim();
  if (id != getLoggedAdminId()) {
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
            },
          });
        } else {
          alert("Non è possibile eliminare l'utente, ci sono noleggi in corso");
          location.reload();
        }
      },
      error: function (res) {
        alert("Errore durante la ricerca dei noleggi in corso");
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
    },
  });
}

function showUserAnnotations(index) {
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
    },
  });
}

function showRentalAnnotations(index) {
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
      alert("Errore durante il recupero delle annotazioni");
    },
  });
}

/* Helpful functions for the rentals */
function getDaysDistance(start, end, returnal = false) {
  let days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 3600 * 24));
  if (!returnal) days++;
  return days;
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

function elaborateTotalCost(baseCost, discount, loyalty, surcharge) {
  total = parseInt(baseCost - discount - loyalty + surcharge);
  return total >= 0 ? total : 0;
}

/* Functions to insert select values */
function appendCorrectUsers(users, userId) {
  html = `<option value="" selected disabled></option>`;
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
  html = `<option value="" selected disabled></option>`;
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
  html = `<option value="" selected disabled></option>`;
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
      role: "backoffice",
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
  if (getLoggedAdminId()) {
    let id = $(`#client${index}Id`).val().trim();
    $("#UserAnagraphicModal").modal("hide");
    $("#ShowRentalsModal").modal("show");
    showRentals(true, id);
  } else {
    alert(
      "Non sei autorizzato a visualizzare i noleggi degli utenti. Esegui il login come amministratore"
    );
  }
}

function showItemRentals(index) {
  if (getLoggedAdminId()) {
    let id = $(`#item${index}Id`).val().trim();
    $("#ItemsModal").modal("hide");
    $("#ShowRentalsModal").modal("show");
    showRentals(null, null, true, id);
  } else {
    alert(
      "Non sei autorizzato a visualizzare i noleggi degli oggetti. Esegui il login come amministratore"
    );
  }
}

function insertRentalActions(index, state) {
  if (state == "Returned") {
    $("#rentalEdit" + index).hide();
    $(`#rental${index}State`).prop("disabled", true);
    $(`#rental${index}ReturnDate`).prop("disabled", true);
    $(`#createRental${index}Button`).hide();
  } else {
    $("#rentalBill" + index).hide();
    $("#rentalAddNotes" + index).hide();
    $("#rentalGetNotes" + index).hide();
  }

  if (state != "Booked") {
    $("#rentalRemove" + index).hide();
  } else {
    $(`#rental${index}AdminId`).prop("disabled", false);
    $(`#rental${index}Dates`).prop("disabled", false);
  }
  $(`#saveRentalInfos${index}Button`).hide();
}

function editRowRental(index) {
  let key = index != undefined ? index : "Input";
  let item = $(`#rental${key}Item`).val();
  let user = $(`#rental${key}UserId`).val();
  let start = $(`#rental${key}StartDate`).val();
  let end = $(`#rental${key}EndDate`).val();
  let returnDate = $(`#rental${key}ReturnDate`).val() || "";
  let points = parseInt($(`#rental${key}Points`).val()) || 0;

  start = start.split("/").reverse().join("-");
  end = end.split("/").reverse().join("-");
  returnDate = returnDate.split("/").reverse().join("-");

  let data = {
    user: user,
    item: item,
    from: start,
    to: end,
    loyalty: points,
    estimate: true,
  };

  if (returnDate != "") {
    data.return = returnDate;
  }

  $.ajax({
    url: localhost + "/v1/rentals",
    type: "POST",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: data,
    success: function (res) {
      base = res.base;
      loyalty = res.loyalty;
      surcharge = res.surcharge;
      total = res.total;
      $(`#rental${key}BaseCost`).val(base.toFixed(2));
      $(`#rental${key}Discount`).val(
        (base - total - loyalty + surcharge).toFixed(2)
      );
      $(`#rental${key}Surcharge`).val(surcharge.toFixed(2));
      $(`#createRental${key}Button`).show();
    },
    error: function () {
      alert("Errore durante il recupero del preventivo");
    },
  });
}

function elaborateStates(fromUser, userId, fromItem, itemId) {
  states = [];
  if (fromUser || fromItem) {
    states =
      userId || itemId
        ? ["Returned", "Expired", "Ongoing", "Accepted", "Booked"]
        : ["Expired", "Ongoing", "Accepted", "Booked"];
  } else states = ["Returned"];
  return states;
}

function changeDates() {
  let today = new Date();
  let tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  $("#rentalInputStartDate").datepicker("destroy");
  $("#rentalInputEndDate").datepicker("destroy");
  let id = $("#rentalInputItem").val();
  $.ajax({
    url: localhost + "/v1/items/" + id,
    type: "GET",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    success: function (res) {
      let unavailableDates = [];
      let unavailableDatesRanges = res.unavailable;
      for (range of unavailableDatesRanges) {
        //Push every Date between from and to into unavailableDates
        let from = range.from.slice(0, 10);
        let to = range.to.slice(0, 10);
        while (from <= to) {
          unavailableDates.push(from);
          let current = new Date(from);
          current.setDate(current.getDate() + 1);
          from = current.toISOString().slice(0, 10);
        }
      }
      $(`#rentalInputStartDate`).datepicker({
        dateFormat: "dd/mm/yy",
        //TODO: se devo permetterli nel passato commento
        minDate: today,
        beforeShowDay: function (date) {
          let string = jQuery.datepicker.formatDate("yy-mm-dd", date);
          return [unavailableDates.indexOf(string) == -1];
        },
      });
      $(`#rentalInputEndDate`).datepicker({
        dateFormat: "dd/mm/yy",
        //TODO: se devo permetterli nel passato commento
        minDate: tomorrow,
        beforeShowDay: function (date) {
          let string = jQuery.datepicker.formatDate("yy-mm-dd", date);
          return [unavailableDates.indexOf(string) == -1];
        },
      });
      $(`#rentalInputReturnDate`).datepicker({
        dateFormat: "dd/mm/yy",
        minDate: tomorrow,
        beforeShowDay: function (date) {
          let string = jQuery.datepicker.formatDate("yy-mm-dd", date);
          return [unavailableDates.indexOf(string) == -1];
        },
      });
    },
    error: function (res) {
      alert("Errore durante il recupero dell'oggetto");
    },
  });
}

function changeEndDate() {
  let min = $(`#rentalInputStartDate`).val();
  min = min.split("/").reverse().join("/");
  let minDate = new Date(min);
  $("#rentalInputEndDate").datepicker("option", "minDate", minDate);
  $(`#rentalInputReturnDate`).datepicker("option", "minDate", minDate);
}

function changeReturnDate() {
  let min = $(`#rentalInputEndDate`).val();
  min = min.split("/").reverse().join("/");
  let minDate = new Date(min);
  $(`#rentalInputReturnDate`).datepicker("option", "minDate", minDate);
}

function showRentals(fromUser, userId, fromItem, itemId) {
  let index = 0;
  let tbody = $("#RentalsBody").empty();
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
      admins = res.results.filter(
        (user) => user.role == "backoffice" || user.role == "manager"
      );
      users = res.results;
      $.ajax({
        url: localhost + "/v1/items",
        type: "GET",
        headers: {
          Authorization: "Bearer " + getToken(),
        },
        success: function (items) {
          states = elaborateStates(fromUser, userId, fromItem, itemId);
          if (states.length != 1 || states[0] != "Returned")
            tbody.append(createNewRentalFromRow(userId, items, itemId));
          filters = {
            sortBy: "from:desc",
          };
          filters = userId ? { ...filters, user: userId } : filters;
          filters = itemId ? { ...filters, item: itemId } : filters;
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
                    let returnDate = r.return ? r.return.substring(0, 10) : "";
                    let baseCost = Number(r.base.toFixed(2));
                    let surcharge = Number(r.surcharge.toFixed(2));
                    let loyalties = Number(r.loyalty.toFixed(2));
                    let total = Number(r.total).toFixed(2);
                    let discount = Number(
                      (baseCost - total - loyalties + surcharge).toFixed(2)
                    );
                    let tr = document.createElement("tr");
                    tr.className = `${state}Row`;
                    tr.innerHTML = `
                      <td class="RentalData hidden">
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
                        <input type="text" class="form-control" id="rental${index}StartDate" value="${start}" onchange="changeEndDate()" disabled>
                      </td>
                      <td class="RentalData">
                        <input type="text" class="form-control" id="rental${index}EndDate" value="${end}" disabled>
                      </td>
                      <td class="RentalData">
                        <input type="text" class="form-control" id="rental${index}ReturnDate" value="${returnDate}">
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
          alert("Errore durante il recupero degli utenti");
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
    <td class="RentalData hidden">
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
      <select class="form-control id-cell" id="rentalInputItem" value="" onchange="changeDates()">
        ${appendCorrectItem(allItems, itemId)}
      </select>
    </td>
    <td class="RentalData">
      <select class="form-control id-cell" id="rentalInputState" value="">
        ${appendCorrectRentalState()}
      </select>
    </td>
    <td class="RentalData">
      <input type="text" class="form-control" id="rentalInputStartDate" onchange="changeEndDate()" value="">
    </td>
    <td class="RentalData">
      <input type="text" class="form-control" id="rentalInputEndDate" onchange="changeReturnDate()" value="">
    </td>
    <td class="RentalData">
      <input type="text" class="form-control" id="rentalInputReturnDate">
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
  let item = $(`#rentalInputItem`).val();
  let user = $(`#rentalInputUserId`).val();
  let state = $(`#rentalInputState`).val();
  let start = $(`#rentalInputStartDate`).val();
  let end = $(`#rentalInputEndDate`).val();
  let returnDate = $(`#rentalInputReturnDate`).val() || "";
  let points = parseInt($(`#rentalInputPoints`).val()) || 0;

  start = start.split("/").reverse().join("-");
  end = end.split("/").reverse().join("-");
  returnDate = returnDate.split("/").reverse().join("-");

  let data = {
    user: user,
    item: item,
    state: state,
    from: start,
    to: end,
    loyalty: points,
  };

  if (returnDate != "") {
    data.return = returnDate;
  }

  $.ajax({
    url: localhost + "/v1/rentals",
    type: "POST",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: data,
    success: function () {
      location.reload();
    },
    error: function () {
      alert("Errore durante la creazione del noleggio");
    },
  });
}

function editRental(index) {
  let rentalId = $(`#rental${index}Id`).val();
  let item = $(`#rental${index}Item`).val();
  let user = $(`#rental${index}UserId`).val();
  let state = $(`#rental${index}State`).val();
  let start = $(`#rental${index}StartDate`).val();
  let end = $(`#rental${index}EndDate`).val();
  let returnDate = $(`#rental${index}ReturnDate`).val() || "";

  start = start.split("/").reverse().join("-");
  end = end.split("/").reverse().join("-");
  returnDate = returnDate.split("/").reverse().join("-");

  let data = {
    user: user,
    item: item,
    state: state,
    from: start,
    to: end,
  };

  if (returnDate != "") {
    data.return = returnDate;
  }

  $.ajax({
    url: localhost + "/v1/rentals/" + rentalId,
    type: "PATCH",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: data,
    success: function () {
      location.reload();
    },
    error: function () {
      alert("Errore durante la creazione del noleggio");
    },
  });
}

function removeRental(index) {
  let id = $(`#rental${index}Id`).val().trim();
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
    },
  });
}

function getRentalBill(index) {
  let id = $(`#rental${index}Id`).val().trim();
  let user = $(`#rental${index}UserId option:selected`).text().trim();
  let item = $(`#rental${index}Item option:selected`).text().trim();
  let start = $(`#rental${index}StartDate`).val().trim();
  let end = $(`#rental${index}EndDate`).val().trim();
  let days = getDaysDistance(start, end);
  let returnDate = $(`#rental${index}ReturnDate`).val().trim();
  let lateDays = getDaysDistance(end, returnDate, true);
  let baseCost = $(`#rental${index}BaseCost`).val().trim();
  let points = $(`#rental${index}Points`).val().trim();
  let discount = $(`#rental${index}Discount`).val().trim();
  let surcharge = $(`#rental${index}Surcharge`).val().trim();
  let totalCost = elaborateTotalCost(
    parseInt(baseCost),
    parseInt(discount),
    parseInt(points),
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
  if (getLoggedAdminId()) {
    appendAllItemStates("stateInput");
    appendAllItemCategories("categoryInput");
    appendAllItemBrands("brandInput");
    appendAllItemAdmin("adminInput");
    $("#InventoryModal").modal("hide");
    $("#AddItemModal").modal("show");
  } else {
    alert("Non sei autorizzato a inserire un nuovo oggetto");
  }
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

function changeIcon() {
  let icon = $(`#item${index}Image`).val().trim();
  $(`#item${index}Icon`).attr("src", icon);
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
                        <img src="${image}" class="itemImage image-cell" id="item${index}Icon" alt="Icona Oggetto">
                      </td>
                      <td class="RentalData">
                        <input type="text" class="form-control id-cell" id="item${index}Image" onchange="changeIcon(${index})" aria-describedby="Image" placeholder="Inserire Link Immagine" value=${image}>
                      </td>
                      <td class="RentalData hidden">
                        <input type="text" class="form-control id-cell" id="item${index}Id" value="${itemId}">
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
                        <select class="form-control id-cell" id="item${index}Enable">
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
                          <div class="modalActions">
                            <button class="btn btn-primary bi bi-calendar-date" id="changeDatesRangeDiscount${index}Button" onclick="showDatesRangeDiscountModal(${index})"></button>
                            <button class="btn btn-primary bi bi-calendar-week" id="changeWeekDayDiscount${index}Button" onclick="showWeekDayDiscountModal(${index})"></button>
                          </div>
                        </div>
                    </td>`;
        tbody.append(tr);
      }
    },
    error: function (err) {
      alert("Errore nel recupero degli items");
    },
  });
  $("#InventoryModal").modal("hide");
  $("#ItemsModal").modal("show");
}

function insertNewItem() {
  let item = {
    image: $("#imageInput").val(),
    name: $("#nameInput").val(),
    description: $("#descriptionInput").val(),
    category: $("#categoryInput").val(),
    brand: $("#brandInput").val(),
    state: $("#stateInput").val(),
    basePrice: $("#baseCostInput").val(),
    dailyPrice: $("#dailyCostInput").val(),
    discount: $("#discountInput").val(),
    enabled: $("#enabledInput").val(),
  };
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
    },
  });
}

function editItem(index) {
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
    enabled: $("#item" + index + "Enable").val() == "true",
  };
  $.ajax({
    url: localhost + "/v1/items/" + id,
    type: "PATCH",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: item,
    success: function () {
      $("#ItemsModal").modal("hide");
      location.reload();
    },
    error: function (err) {
      alert("Errore nella modifica dell'item");
    },
  });
}

function removeItem(index) {
  let itemId = $("#item" + index + "Id").val();
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
}

function showDatesRangeDiscountModal(id) {
  $("#ItemsModal").modal("hide");
  $("#DatesRangeDiscountModal").modal("show");
  let itemId = $("#item" + index + "Id").val();
  currentItemId = itemId;
  $.ajax({
    url: localhost + "/v1/items/" + itemId,
    type: "GET",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    success: function (data) {
      html = "";
      discounts = data.discountsDate;
      for (discount of discounts) {
        html += `
          <div class="discountRangeContainer">
              <div class="rangeLabel">Inizio Sconto: <span>${discount.from.slice(
                0,
                10
              )}</span></div>
              <div class="rangeLabel">Fine Sconto: <span>${discount.to.slice(
                0,
                10
              )}</span></div>
              <div class="rangeLabel">Percentuale Sconto: <span>${
                discount.amount
              }</span></div>
              <div class="rangeLabel">Descrizione Sconto: <span>${
                discount.description
              }</span></div>
          </div>
        `;
      }
      $("#existingDiscounts").html(html);
    },
    error: function (err) {
      alert("Errore nella recupero dell'item");
    },
  });
}

function showWeekDayDiscountModal(id) {
  $("#ItemsModal").modal("hide");
  $("#WeekDayDiscountModal").modal("show");
  let itemId = $("#item" + index + "Id").val();
  currentItemId = itemId;
  $.ajax({
    url: localhost + "/v1/items/" + itemId,
    type: "GET",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    success: function (data) {
      html = "";
      discounts = data.discountsWeekday;
      for (discount of discounts) {
        $("#startDate" + (discounts.indexOf(discount) + 1)).val(discount.from);
        $("#endDate" + (discounts.indexOf(discount) + 1)).val(discount.to);
        $("#amountWeek" + (discounts.indexOf(discount) + 1)).val(
          discount.amount
        );
        $("#descriptionWeek" + (discounts.indexOf(discount) + 1)).val(
          discount.description
        );
      }
    },
    error: function (err) {
      alert("Errore nella recupero dell'item");
    },
  });
}

function addRangeDiscount() {
  let itemId = currentItemId;
  let start = $("#startDate").val();
  let end = $("#endDate").val();
  let description = $("#descriptionRange").val();
  let amount = $("#amountRange").val();
  let discount = {
    from: start,
    to: end,
    description: description,
    amount: amount,
  };
  $.ajax({
    url: localhost + "/v1/items/" + itemId,
    type: "GET",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    success: function (data) {
      discounts = data.discountsDate;
      discounts.push(discount);
      $.ajax({
        url: localhost + "/v1/items/" + itemId,
        type: "PATCH",
        headers: {
          Authorization: "Bearer " + getToken(),
        },
        data: {
          discountsDate: discounts,
        },
        success: function (data) {
          $("#DatesRangeDiscountModal").modal("hide");
          location.reload();
        },
      });
    },
  });
}

function addWeekDayDiscounts() {
  let itemId = currentItemId;
  let discounts = [];
  for (let j = 0; j < 7; j++) {
    let i = j + 1;
    let start = $("#startDate" + i).val();
    let end = $("#endDate" + i).val();
    let description = $("#descriptionWeek" + i).val();
    let amount = $("#amountWeek" + i).val();
    if (start != "" && end != "" && description != "" && amount != "") {
      let discount = {
        from: start,
        to: end,
        description: description,
        amount: amount,
      };
      discounts.push(discount);
    }
  }

  $.ajax({
    url: localhost + "/v1/items/" + itemId,
    type: "GET",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    success: function (data) {
      item = data;
      item.discountsWeekday = discounts;
      delete item.id;
      delete item.totalPrice;
      $.ajax({
        url: localhost + "/v1/items/" + itemId,
        type: "PATCH",
        headers: {
          Authorization: "Bearer " + getToken(),
        },
        data: data,
        success: function (data) {
          $("#WeekDayDiscountModal").modal("hide");
          location.reload();
        },
      });
    },
  });
}
