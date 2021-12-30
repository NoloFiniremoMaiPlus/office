let filters = {};
let filterValues = {
  start: 0,
  end: 1000,
};
//oggetto da modificare che viene aggiornato ad ogni chiamata
let idOldObj = null;
let idOldUser = null;
let idOldAdmin = null;
let idRent = null;
let oldPunti = 0;
let oldStartDate = null;
let oldEndDate = null;
let imgRent = "";
let condizioniGlobal = "";
let ruoloEmployee = "";

const categorySet = new Set();
const brandSet = new Set();
const usernameSet = new Set();

let categoryArray = [];
let brandArray = [];
let usernameArray = [];
let prezzoObj = 1;

$.datepicker.setDefaults(
  $.extend({ dateFormat: "dd-mm-yy" }, $.datepicker.regional["it"])
);
let firstCookie = getCookie("SessionCookie");
let firstData = { cookie: firstCookie };

window.onload = (event) => {
  $.ajax({
    url: "/sessionUser",
    type: "POST",
    data: firstData,
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (data) {
      console.log(data);
      if (document.getElementById("spanLogin")) {
        document.getElementById("spanLogin").innerText =
          "Autenticato come " + data.username;
      }
      formData = { username: data.username };
      $.ajax({
        url: "/db/searchEmployee/",
        type: "POST",
        data: formData,
        dataType: "json",
        contentType: "application/x-www-form-urlencoded",
        success: function (d) {
          if (d.result[0]) {
            ruoloEmployee = d.result[0].ruolo;
          }
        },
      });
    },
  });
};

function alertConfirm() {
  $("#alertModal").modal("hide");
  document.getElementById("alertContent").textContent = "";
}

function resetObjFilters() {
  visualizzaCatalogo();
  cataLOG();
}

function cards(d) {
  document.getElementById("carousel-inner").innerHTML = "";
  categorySet.clear();
  brandSet.clear();
  categoryArray = [];
  brandArray = [];
  for (let i in d.result) {
    let idObj = d.result[i]._id;
    let modello = d.result[i].modello.toLowerCase();
    let marca = d.result[i].marca.toLowerCase();
    let categoria = d.result[i].categoria.toLowerCase();
    let anno = d.result[i].anno;
    let prezzo = d.result[i].prezzo;
    let condizioni = d.result[i].condizioni.toLowerCase();
    let immagine = d.result[i].img;
    console.log(immagine);
    // let disponibilità = d.result[i].disponibilità;
    let count = $("div[id^=singleCard]").length;
    categorySet.add(categoria.toLowerCase());
    brandSet.add(marca.toLowerCase());
    if (count == 0) {
      console.log("devo aggiungere la prima riga");
      const div = document.createElement("div");
      div.className = "carousel-item active";
      div.innerHTML =
        `
                        <div class="row">
                            <ul class="cards justify-content-around" tabindex="0" aria-label="Strumento">
                                <li class="cards_item">
                                    <div id="singleCard" tabindex="0" aria-label="Strumento">
                                    <div class="card_image"><img src=` +
        immagine +
        `></div>
                                    <div class="card_content">
                                        <h2 class="card_title" tabindex="0">
        <span class = "spanMarca">` +
        marca +
        `</span>` +
        ` <br>
        <span class = "spanModello">` +
        modello +
        `</span>` +
        `</h2>
                                        <p class="card_text">
                                            <ul class = "ulCard">
                                                <li tabindex="0">` +
        categoria +
        `</li>
        <li tabindex="0">` +
        condizioni +
        `</li>
                                                <li tabindex="0">Anno: ` +
        anno +
        `</li>
                                                <li tabindex="0">Prezzo: ` +
        prezzo +
        `€` +
        `</li>
        <li style="display:none">` +
        idObj +
        `</li>
        
                                            </ul>
                                        </p>
                                        <button aria-label="Bottone manutenzione strumento" class="btnCard" type="button" onclick="unavailableObj(this)" style="float:left; margin-right: 0.5rem"><i class="bi bi-exclamation-triangle"></i></button>
                                        <button aria-label="Bottone noleggio strumento" class="btnCard rentBtnCard" data-bs-toggle="modal" data-bs-target="#rentObjModal" type="button" onclick="rentObj(this)"><i class="bi bi-cart4"></i></button>
                                        <button aria-label="Bottone modifica strumento" class="btnCard updateBtnCard" data-bs-toggle="modal" data-bs-target="#modObjModal" style="margin-right: 0.5rem" type="button" onclick="getObj(this)"><i class="bi bi-pencil-square"></i></button>
                                      </div>
                                    </div>
                                </li>
                            </ul>
                        </div>`;
      let carousel = document.getElementById("carousel-inner").appendChild(div);
    } else if (count % 3 == 0) {
      console.log("devo aggiungere una riga");
      const div = document.createElement("div");
      div.className = "carousel-item";
      div.innerHTML =
        `
                        <div class="row">
                            <ul class="cards justify-content-around">
                                <li class="cards_item">
                                    <div id="singleCard" tabindex="0" aria-label="Strumento">
                                    <div class="card_image"><img src=` +
        immagine +
        `></div>
                                    <div class="card_content">
                                        <h2 class="card_title" tabindex="0">
        <span class = "spanMarca">` +
        marca +
        `</span>` +
        ` <br>
        <span class = "spanModello">` +
        modello +
        `</span>` +
        `</h2>
                                        <p class="card_text">
                                            <ul class = "ulCard">
                                                <li tabindex="0">` +
        categoria +
        `</li>
        <li tabindex="0">` +
        condizioni +
        `</li>
                                                <li tabindex="0">Anno: ` +
        anno +
        `</li>
                                                <li tabindex="0">Prezzo: ` +
        prezzo +
        `€` +
        `</li>
        <li style="display:none">` +
        idObj +
        `</li>
                                            </ul>
                                        </p>
                                        <button aria-label="Bottone manutentezione strumento" class="btnCard" type="button" onclick="unavailableObj(this)" style="float:left; margin-right: 0.5rem"><i class="bi bi-exclamation-triangle"></i></button>
                                        <button aria-label="Bottone noleggio strumento" class="btnCard rentBtnCard" data-bs-toggle="modal" data-bs-target="#rentObjModal" type="button" onclick="rentObj(this)"><i class="bi bi-cart4"></i></button>
                                        <button aria-label="Bottone modifica strumento" class="btnCard updateBtnCard" data-bs-toggle="modal" data-bs-target="#modObjModal" style="margin-right: 0.5rem" type="button" onclick="getObj(this)"><i class="bi bi-pencil-square"></i></button>
                                       </div>
                                    </div>
                                </li>
                            </ul>
                        </div>`;
      let carousel = document.getElementById("carousel-inner").appendChild(div);
    } else {
      console.log("non devo aggiungerla");
      const li = document.createElement("li");
      li.className = "cards_item";
      li.innerHTML =
        `
                            <div id="singleCard" tabindex="0" aria-label="Strumento">
                            <div class="card_image"><img src=` +
        immagine +
        `></div>
                            <div class="card_content">
                                <h2 class="card_title" tabindex="0">
        <span class = "spanMarca">` +
        marca +
        `</span>` +
        ` <br>
        <span class = "spanModello">` +
        modello +
        `</span>` +
        `</h2>
                                <p class="card_text">
                                    <ul class = "ulCard">
                                        <li tabindex="0">` +
        categoria +
        `</li> 
        <li tabindex="0">` +
        condizioni +
        `</li>
                                        <li tabindex="0">Anno: ` +
        anno +
        `</li>
                                        <li tabindex="0">Prezzo: ` +
        prezzo +
        `€` +
        `</li>
        <li style="display:none">` +
        idObj +
        `</li>
                                    </ul>
                                </p>
                                <button aria-label="Bottone manutenzione oggetto" class="btnCard" type="button" onclick="unavailableObj(this)" style="float:left; margin-right: 0.5rem"><i class="bi bi-exclamation-triangle"></i></button>
                                <button aria-label="Bottone noleggio oggetto" class="btnCard rentBtnCard" data-bs-toggle="modal" data-bs-target="#rentObjModal" type="button" onclick="rentObj(this)"><i class="bi bi-cart4"></i></button>
                                <button aria-label="Bottone modifica oggetto" class="btnCard updateBtnCard" data-bs-toggle="modal" data-bs-target="#modObjModal" style="margin-right: 0.5rem" type="button" onclick="getObj(this)"><i class="bi bi-pencil-square"></i></button>
                              </div>
                            </div>`;
      var rows = document.querySelectorAll(".cards");
      console.log(rows);
      var len = rows.length;
      console.log(len);
      if (len < 1) {
        console.log("non ci sono elementi");
      } else {
        var lastRow = rows[len - 1];
      }
      console.log(lastRow);

      lastRow.appendChild(li);
    }
  }
}

function tableCustomer(d) {
  document.getElementById("anagraficaClientiBody").innerHTML = "";
  usernameSet.clear();
  usernameArray = [];
  for (let i in d.result) {
    let idCliente = d.result[i]._id;
    let nome = d.result[i].nome.toLowerCase();
    let cognome = d.result[i].cognome.toLowerCase();
    let username = d.result[i].username.toLowerCase();
    let mail = d.result[i].mail;
    let tel = d.result[i].tel;
    let punti = d.result[i].punti;
    let indirizzo = d.result[i].indirizzo;
    let provincia = d.result[i].provincia;
    let cap = d.result[i].cap;
    usernameSet.add(username.toLowerCase());
    let tbody = document.getElementById("anagraficaClientiBody");
    const tr = document.createElement("tr");
    tr.innerHTML =
      `
        <th scope="row" style="text-transform: capitalize" class="titleRowCustomer">` +
      nome +
      ` ` +
      cognome +
      `</th>
        <td class="tdCustomer">` +
      username +
      `</td>
        <td class="tdCustomer">` +
      mail +
      `</td>
        <td class="tdCustomer">` +
      tel +
      `</td> 
      <td class="tdCustomer">` +
      indirizzo +
      ", " +
      provincia +
      ", " +
      cap +
      `</td> 
        <td class="tdCustomer">` +
      punti +
      `</td> 
        <td class="tdCustomer" style="display:none">` +
      idCliente +
      `</td> 
      <td class="tdCustomer"><button data-bs-toggle="modal" data-bs-target="#modUserModal" class="btn btn-secondary" aria-label="bottone di modifica cliente" type="button" onclick="getUser(this)"><i class="bi bi-pencil-square"></i></button></td>`;
    tbody.appendChild(tr);
  }
}

function switchToInCorso(e) {
  let current = e.parentNode.parentNode;
  idRent = current.getElementsByClassName("tdRent")[6].textContent;
  let stato = "in corso";
  let formData = { name: "stato", value: stato };
  $.ajax({
    url: "/db/switchStateRent/",
    type: "POST",
    data: { idRent, formData },
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (data) {
      noleggiLOG();
    },
  });
}

function switchToInRitardo(e) {
  let current = e.parentNode.parentNode;
  idRent = current.getElementsByClassName("tdRent")[6].textContent;
  let stato = "in ritardo";
  let formData = { name: "stato", value: stato };
  $.ajax({
    url: "/db/switchStateRent/",
    type: "POST",
    data: { idRent, formData },
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (data) {
      noleggiLOG();
    },
  });
}

function switchToConcluso(e, bool) {
  //Creazione fattura
  let current = e.parentNode.parentNode;
  idRent = current.getElementsByClassName("tdRent")[6].textContent;
  let username = current.getElementsByClassName("tdRent")[0].textContent;
  let statoNoleggio = current.getElementsByClassName("tdRent")[4].textContent;
  console.log(statoNoleggio);
  let formDataSaveStateRent = {
    name: "stato precedente",
    value: statoNoleggio,
  };
  $.ajax({
    url: "/db/saveStateRent/",
    type: "POST",
    data: { idRent, formDataSaveStateRent },
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (data) {},
  });
  let stato = "";
  let formData = {};
  switch (bool) {
    case true:
      $.ajax({
        url: "/db/removePuntiFed/",
        type: "POST",
        data: { username },
        dataType: "json",
        contentType: "application/x-www-form-urlencoded",
        success: function (data) {},
      });
      stato = "invalido";
      formData = { name: "stato", value: stato };
      $.ajax({
        url: "/db/switchStateRent/",
        type: "POST",
        data: { idRent, formData },
        dataType: "json",
        contentType: "application/x-www-form-urlencoded",
        success: function (data) {
          noleggiLOG();
        },
      });
      break;
    case false:
      stato = "concluso";
      formData = { name: "stato", value: stato };
      $.ajax({
        url: "/db/switchStateRent/",
        type: "POST",
        data: { idRent, formData },
        dataType: "json",
        contentType: "application/x-www-form-urlencoded",
        success: function (data) {
          noleggiLOG();
        },
      });
      //Creazione dati fattura
      //currentDate, indirizzo, provincia, cap, telefono, durata
      var typeSearch = "username";
      var array = username.split(" ");
      var formDataSearch = { type: typeSearch, user: array };
      var cognome = "";
      var nome = "";
      var indirizzoFatturazione = "";
      var telefono = 0;
      var today = new Date();
      var dataFatturazione =
        today.getDate() +
        "/" +
        (today.getMonth() + 1) +
        "/" +
        today.getFullYear();

      $.ajax({
        url: "/db/searchUser/",
        type: "POST",
        data: formDataSearch,
        dataType: "json",
        contentType: "application/x-www-form-urlencoded",
        success: function (d) {
          cognome = d.result[0].cognome;
          nome = d.result[0].nome;
          indirizzoFatturazione =
            d.result[0].indirizzo +
            ", " +
            d.result[0].provincia +
            ", " +
            d.result[0].cap;
          telefono = d.result[0].tel;

          let formDataInvoice = [];
          formDataInvoice[0] = { name: "nome", value: nome };
          formDataInvoice[1] = { name: "cognome", value: cognome };
          formDataInvoice[2] = {
            name: "indirizzo",
            value: indirizzoFatturazione,
          };
          formDataInvoice[3] = { name: "tel", value: telefono };
          formDataInvoice[4] = { name: "currentDate", value: dataFatturazione };
          formDataInvoice[5] = { name: "id", value: idRent };

          $.ajax({
            url: "/db/createInvoice/",
            type: "POST",
            data: formDataInvoice,
            dataType: "json",
            contentType: "application/x-www-form-urlencoded",
            success: function (d) {},
          });
        },
      });
      break;
    default:
      break;
  }
}

function tableRent(d) {
  document.getElementById("storicoNoleggiBody").innerHTML = "";
  for (let i in d.result) {
    let idRent = d.result[i]._id;
    let marca = d.result[i].marca.toLowerCase();
    let modello = d.result[i].modello.toLowerCase();
    let username = d.result[i].username.toLowerCase();
    let startDate = d.result[i].startDate;
    let endDate = d.result[i].endDate;
    let prezzo = d.result[i].prezzo;
    let stato = d.result[i].stato.toUpperCase();
    let statoPrec = d.result[i].statoPrec.toUpperCase();
    let prezzoGiornaliero = d.result[i].prezzoGiornaliero;
    let idObj = d.result[i].idOggetto;
    let punti = d.result[i].punti;
    let tbody = document.getElementById("storicoNoleggiBody");
    const tr = document.createElement("tr");
    tr.className = "rowRent";
    tr.innerHTML =
      `
        <th scope="row" style="text-transform: capitalize" class="titleRowRent">
        <span class = "spanMarcaTable">` +
      marca +
      `</span>
      <span class = "spanModelloTable">` +
      modello +
      `</span>
      </th>
        <td class="tdRent">` +
      username +
      `</td>
        <td class="tdRent">` +
      startDate +
      `</td>
        <td class="tdRent">` +
      endDate +
      `</td> 
        <td class="tdRent">` +
      prezzo +
      `€</td>
        <td class="tdRent">` +
      stato +
      `</td>
      <td class="tdRent" style="display:none">` +
      prezzoGiornaliero +
      `</td> 
        <td class="tdRent" style="display:none">` +
      idRent +
      `</td> 
      <td class="tdRent" style="display:none">` +
      idObj +
      `</td> 
      <td class="tdRent" style="display:none">` +
      statoPrec +
      `</td> 
      <td class="tdRent" style="display:none">` +
      punti +
      `</td> 
        <td class="tdRent">
          <button data-bs-toggle="modal" data-bs-target="#modRentModal" aria-label = "bottone di modifica noleggio" class="btn btn-secondary" type="button" onclick="modRent(this)">
            <i class="bi bi-pencil-square"></i>
          </button>
        </td>`;
    let today = new Date();
    let currentDay = new Date(
      today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate()
    );
    if (
      stringToDate(startDate, "dd/mm/yyyy", "/") <= currentDay ||
      stato != "PRENOTATO"
    ) {
      tr.getElementsByClassName("btn")[0].disabled = true;
    }
    tbody.appendChild(tr);
  }

  let rows = document.getElementsByClassName("rowRent");

  for (let i = 0; i < rows.length; i++) {
    let stateRow = rows[i].getElementsByClassName("tdRent")[4].textContent;
    let precStateRow = rows[i].getElementsByClassName("tdRent")[8].textContent;
    let startDateRow = rows[i].getElementsByClassName("tdRent")[1].textContent;
    let endDateRow = rows[i].getElementsByClassName("tdRent")[2].textContent;
    let btnUpdateState = document.createElement("button");
    btnUpdateState.setAttribute("type", "button");
    let btnUpdateStatePast = document.createElement("button");
    btnUpdateStatePast.setAttribute("type", "button");
    btnUpdateStatePast.style.marginRight = "0.3rem";
    let flagPast = false; // questo mi serve per controllare se sto simulando un noleggio nel passato, e quindi ho bisogno di abilitare il doppio bottone: 1 per concluso (non ritirato) e 1 per simularlo effettivamente (btnUpdateStatePast)
    let nonRitirato = false; // questo mi serve per controllare se lo stato precendente alla conclusione del noleggio era quello di non ritirato o meno
    let td = rows[i].getElementsByClassName("tdRent")[10];
    let today = new Date();
    let currentDay = new Date(
      today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate()
    );
    let dataFineNoleggio = stringToDate(endDateRow, "dd/mm/yyyy", "/");
    let dataInizioNoleggio = stringToDate(startDateRow, "dd/mm/yyyy", "/");

    switch (stateRow) {
      case "PRENOTATO":
        if (currentDay.getTime() >= dataInizioNoleggio.getTime()) {
          btnUpdateState.className = "btn btn-success";
          btnUpdateState.setAttribute("onclick", "switchToInCorso(this)");
          btnUpdateState.innerHTML = `<i class="bi bi-check-square"></i>`;
          btnUpdateState.setAttribute(
            "aria-label",
            "bottone di aggiornamento a IN CORSO"
          );
          if (currentDay.getTime() > dataFineNoleggio.getTime()) {
            btnUpdateStatePast.className = "btn btn-success";
            btnUpdateStatePast.setAttribute("onclick", "switchToInCorso(this)");
            btnUpdateStatePast.innerHTML = `<i class="bi bi-check-square"></i>`;
            btnUpdateStatePast.setAttribute(
              "aria-label",
              "bottone di aggiornamento a IN CORSO"
            );
            btnUpdateState.className = "btn btn-secondary";
            btnUpdateState.setAttribute(
              "onclick",
              "switchToConcluso(this, true)"
            );
            btnUpdateState.innerHTML = `<i class="bi bi-check-square"></i>`;
            btnUpdateState.setAttribute(
              "aria-label",
              "bottone di aggiornamento a INVALIDO"
            );
            flagPast = true;
          }
        } else {
          btnUpdateState.className = "btn btn-success";
          btnUpdateState.setAttribute("onclick", "switchToInCorso(this)");
          btnUpdateState.setAttribute(
            "aria-label",
            "bottone di aggiornamento a IN CORSO"
          );
          btnUpdateState.disabled = true;
          btnUpdateState.innerHTML = `<i class="bi bi-calendar2-check"></i>`;
        }
        break;
      case "IN CORSO":
        if (currentDay.getTime() > dataFineNoleggio.getTime()) {
          btnUpdateState.className = "btn btn-danger";
          btnUpdateState.setAttribute("onclick", "switchToInRitardo(this)");
          btnUpdateState.setAttribute(
            "aria-label",
            "bottone di aggiornamento a IN RITARDO"
          );
          btnUpdateState.innerHTML = `<i class="bi bi-alarm"></i>`;
        } else {
          btnUpdateState.className = "btn btn-secondary";
          btnUpdateState.setAttribute(
            "onclick",
            "switchToConcluso(this, false)"
          );
          btnUpdateState.setAttribute(
            "aria-label",
            "bottone di aggiornamento a CONCLUSO"
          );
          btnUpdateState.innerHTML = `<i class="bi bi-check-square"></i>`;
        }
        break;
      case "IN RITARDO":
        btnUpdateState.className = "btn btn-secondary";
        btnUpdateState.setAttribute("onclick", "switchToConcluso(this, false)");
        btnUpdateState.innerHTML = `<i class="bi bi-check-square"></i>`;
        btnUpdateState.setAttribute(
          "aria-label",
          "bottone di aggiornamento a CONCLUSO"
        );
        break;
      case "CONCLUSO":
        switch (precStateRow) {
          case "IN CORSO":
            btnUpdateState.className = "btn btn-outline-secondary";
            btnUpdateState.setAttribute("data-bs-toggle", "modal");
            btnUpdateState.setAttribute("data-bs-target", "#invoiceModal");
            btnUpdateState.setAttribute("onclick", "getFattura(this)");
            btnUpdateState.innerHTML = `<i class="bi bi-cash-coin"></i>`;
            btnUpdateState.setAttribute(
              "aria-label",
              "bottone visualizzazione fattura"
            );
            break;
          case "IN RITARDO":
            btnUpdateState.className = "btn btn-outline-secondary";
            btnUpdateState.setAttribute("data-bs-toggle", "modal");
            btnUpdateState.setAttribute("data-bs-target", "#invoiceModal");
            btnUpdateState.setAttribute("onclick", "getFattura(this)");
            btnUpdateState.innerHTML = `<i class="bi bi-cash-coin"></i>`;
            btnUpdateState.setAttribute(
              "aria-label",
              "bottone visualizzazione fattura"
            );
            break;
          case "PRENOTATO":
            nonRitirato = true;
            break;
          default:
            console.log("Errore");
            break;
        }
        break;
      case "INVALIDO":
        switch (precStateRow) {
          case "PRENOTATO":
            nonRitirato = true;
            break;
          default:
            console.log("Errore");
            break;
        }
        break;
      case "DA SOSTITUIRE":
        btnUpdateState.disabled = true;
        btnUpdateState.style.display = "none";
        break;
      default:
        console.log("Errore");
        break;
    }
    if (nonRitirato == false) {
      if (flagPast == true) {
        td.appendChild(btnUpdateStatePast);
      }
      td.appendChild(btnUpdateState);
    }
  }
}

function updateState() {
  let stato = document.getElementsByClassName("tdRent")[4].textContent;
  console.log(stato);
}

function visualizzaCatalogo() {
  var div = document.getElementById("content");
  div.style.visibility = "visible";
  div.innerHTML = `
  <div class="row align-items-center" id="buttons" aria-label="Sezione filtri e aggiunta strumento" tabindex="0">
  <div id="filtri">
    <div class="row">
      <div class="col-4 text-center">
        <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle" type="button" id="categoryFilter"
            aria-label="Bottone filtro categoria" data-bs-toggle="dropdown" aria-expanded="false">
            Categoria
          </button>
          <ul id="dropdownCategoryFilter" class="dropdown-menu" aria-labelledby="categoryFilter"
            style="text-transform: capitalize"></ul>
        </div>
      </div>
      <div class="col-4 text-center">
        <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle" type="button" id="brandFilter"
            aria-label="Bottone filtro marca" data-bs-toggle="dropdown" aria-expanded="false">
            Marca
          </button>
          <ul id="dropdownBrandFilter" class="dropdown-menu" aria-labelledby="brandFilter"
            style="text-transform: capitalize"></ul>
        </div>
      </div>
      <div class="col-4 text-center">
        <button id="resetObjBtn" type="button" aria-label="Bottone reset filtri" class="btn btn-danger"
          onclick="resetObjFilters()">
          Reset
        </button>
      </div>
    </div>
    <div class="row" style = "margin-top:1rem">
      <div class="col-12 text-center" style = "display:flex; justify-content:center">
        <div class="prezzo">
          <p>
            €
            <input type="text" id="amountMin" aria-label="Inserisci prezzo minimo" onchange="filtroPrezzoAria()"
              style="border: 0; color: #f6931f; font-weight: bold" />
            - €
            <input type="text" id="amountMax" aria-label="Inserisci prezzo massimo" onchange="filtroPrezzoAria()"
              style="border: 0; color: #f6931f; font-weight: bold" />
          </p>
          <div aria-hidden="true" tabindex="-1">
            <div id="slider-range"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div id = "rightButton" class = "text-center">
    <button id="addObjBtn" type="button" aria-label="Bottone aggiunta oggetti catalogo" class="btn btn-primary"
      data-bs-toggle="modal" data-bs-target="#addObjModal">
      Aggiungi <br />
      Oggetto
    </button>
  </div>
</div>
        <div
            class="row d-flex align-items-center justify-content-space-evenly"
            style="height: 80%;" 
            aria-label="Catalogo strumenti"
            tabindex="0"
            >
            <div class="col-1 d-flex align-items-center">
                <button
                class="indicator"
                tabindex="0"
                aria-label="Pagina precedente del catalogo"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide="prev"
                >
                <div class="carousel-nav-icon">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 129 129"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    >
                    <path
                        d="m88.6,121.3c0.8,0.8 1.8,1.2 2.9,1.2s2.1-0.4 2.9-1.2c1.6-1.6 1.6-4.2 0-5.8l-51-51 51-51c1.6-1.6 1.6-4.2 0-5.8s-4.2-1.6-5.8,0l-54,53.9c-1.6,1.6-1.6,4.2 0,5.8l54,53.9z"
                    />
                    </svg>
                </div>
                </button>
            </div>
            <div class="col-10">
                <!--Start carousel-->
                <div
                id="carouselExampleIndicators"
                class="carousel slide"
                data-bs-interval="false"
                >
                <div class="carousel-inner" id="carousel-inner" data-bs-interval="false"></div>
                </div>
                <!--End carousel-->
            </div>
            <div class="col-1 d-flex align-items-center justify-content-center">
                <button
                class="indicator"
                tabindex="0"
                aria-label="Pagina successiva del catalogo"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide="next"
                >
                <div class="carousel-nav-icon">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 129 129"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    >
                    <path
                        d="m40.4,121.3c-0.8,0.8-1.8,1.2-2.9,1.2s-2.1-0.4-2.9-1.2c-1.6-1.6-1.6-4.2 0-5.8l51-51-51-51c-1.6-1.6-1.6-4.2 0-5.8 1.6-1.6 4.2-1.6 5.8,0l53.9,53.9c1.6,1.6 1.6,4.2 0,5.8l-53.9,53.9z"
                    />
                    </svg>
                </div>
                </button>
            </div>
            </div>`;

  $("#slider-range").slider({
    range: true,
    min: 0,
    max: 1000,
    values: [0, 1000],
    slide: function (event, ui) {
      $("#amountMin").val(ui.values[0]);
      $("#amountMax").val(ui.values[1]);
    },
    change: function (event, ui) {
      filterValues = {
        start: document.getElementById("amountMin").value,
        end: document.getElementById("amountMax").value,
      };
      $.ajax({
        url: "/db/filtersCataLOG/",
        type: "POST",
        data: { filters, filterValues },
        dataType: "json",
        contentType: "application/x-www-form-urlencoded",
        success: function (data) {
          cards(data);
        },
      });
    },
  });

  $("#amountMin").val($("#slider-range").slider("values", 0));
  $("#amountMax").val($("#slider-range").slider("values", 1));
  //document.getElementById("prova").focus()
}

function focusCatalogo() {
  document.getElementById("categoryFilter").focus();
}
function filtroPrezzoAria() {
  $("#slider-range").slider(
    "values",
    0,
    document.getElementById("amountMin").value
  );
  $("#slider-range").slider(
    "values",
    1,
    document.getElementById("amountMax").value
  );
  filterValues = {
    start: document.getElementById("amountMin").value,
    end: document.getElementById("amountMax").value,
  };
  console.log(filterValues);

  $.ajax({
    url: "/db/filtersCataLOG/",
    type: "POST",
    data: { filters, filterValues },
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (data) {
      cards(data);
    },
  });
}

function visualizzaClienti() {
  var div = document.getElementById("content");
  div.style.visibility = "visible";
  div.innerHTML = `
            <div class="row align-items-center" id="buttons" >
              <div id="search"> 
                  <form onkeypress="return event.keyCode != 13" id="searchForm">
                      <div class="mb-3">
                          <select id="searchSelection" class="form-select" aria-label="Filtro ricerca clienti">
                              <option value="username" aria-selected="true" selected>Ricerca per username</option>
                              <option value="nome" aria-selected="false">Ricerca per nome</option>
                              <option value="cognome" aria-selected="false">Ricerca per cognome</option>
                          </select>
                      </div>
                      <div class="mb-3 row">
                          <div class="col-10">
                              <input id="inputSearch" type="text" placeholder="Inserisci testo..." class="form-control" aria-label="Inserisci testo ricerca">
                          </div>
                          <div class="col-2">
                              <button aria-label="Bottone ricerca clienti" type="button" class="btn btn-primary" id="searchBtn" onclick="searchUser()">
                                  <i class="fa fa-search"></i>
                              </button>
                          </div>
                      </div> 
                  </form>
              </div>
              <div id = "rightButton" class ="text-center">
                <button
                    id="addUserBtn"
                    type="button"
                    aria-label="Bottone aggiunta clienti"
                    class="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#addUserModal"
                >
                    Aggiungi <br />
                    Utente
                </button>
                </div>
            </div>
            <div
            class="row d-flex align-items-center"
            style="padding: 2rem; height: 80%; position: relative;"
            id="anagraficaClienti"
            >
              <table class="table" tabIndex="0" aria-label = "tabella clienti" style="position: absolute; top: 0; width: 95%">
                <thead>
                  <tr>
                    <th scope="col">Nome e Cognome</th>
                    <th scope="col">Username</th>
                    <th scope="col">Mail</th>
                    <th scope="col">Telefono</th>
                    <th scope="col">Indirizzo di Fatturazione</th>
                    <th scope="col">Punti Fedeltà</th>
                    <th scope="col">Modifica</th>
                  </tr>
                </thead>
                <tbody id="anagraficaClientiBody">
                </tbody>
              </table>
            </div>
            </div>`;
}

function visualizzaDipendenti() {
  if (ruoloEmployee != "manager") {
    notManager();
  } else {
    var div = document.getElementById("content");
    div.style.visibility = "visible";
    div.innerHTML = `
              <div class="row align-items-center" id="buttons">
              </div>
              <div
              class="row d-flex align-items-center"
              style="padding: 2rem; height: 80%; position: relative;"
              id="anagraficaDipendenti"
              >
                <table class="table" tabIndex = "0" aria-label = "tabella dipendenti" style="position: absolute; top: 0; width: 95%">
                  <thead>
                    <tr>
                      <th scope="col">Username</th>
                      <th scope="col">Nome</th>
                      <th scope="col">Cognome</th>
                      <th scope="col">Mail</th>
                      <th scope="col">Telefono</th>
                      <th scope="col">Ruolo</th>
                    </tr>
                  </thead>
                  <tbody id="anagraficaDipendentiBody">
                  </tbody>
                </table>
              </div>
              </div>`;
  }
}

function visualizzaNoleggi() {
  var div = document.getElementById("content");
  div.style.visibility = "visible";
  div.innerHTML = `
            <div class="row align-items-center" id="buttons" >
            <div id="searchRentDiv"> 
                <form onkeypress="return event.keyCode != 13" id="searchFormRent">
                    <div class="mb-3">
                        <select id="searchSelectionRent" class="form-select" aria-label="Search select" aria-label="Filtro ricerca noleggi">
                            <option value="username" selected aria-selected="true">Ricerca per username</option>
                            <option value="strumento" aria-selected="false">Ricerca per strumento</option>
                        </select>
                    </div>
                    <div class="mb-3 row">
                        <div class="col-10">
                            <input aria-label="Inserisci testo ricerca" id="inputSearchRent" type="text" placeholder="Inserisci testo..." class="form-control">
                        </div>
                        <div class="col-2">
                            <button aria-label="Bottone ricerca noleggi" type="button" class="btn btn-primary" id="searchBtnRent" onclick="searchRent()">
                                <i class="fa fa-search"></i>
                            </button>
                        </div>
                    </div> 
                </form>
            </div>
            </div>
            <div
            class="row d-flex align-items-center"
            style="padding: 2rem; height: 80%; position: relative;"
            id="storicoNoleggi"
            >
              <table class="table" tabIndex = "0" aria-label = "tabella noleggi" style="position: absolute; top: 0; width: 95%">
                <thead>
                  <tr>
                    <th scope="col">Strumento</th>
                    <th scope="col">Utente</th>
                    <th scope="col">Data Inizio</th>
                    <th scope="col">Data Fine</th>
                    <th scope="col">Prezzo</th>
                    <th scope="col">Stato</th>
                    <th scope="col">Operazioni</th>
                  </tr>
                </thead>
                <tbody id="storicoNoleggiBody">
                </tbody>
              </table>
            </div>
          </div>`;
}

function searchUser() {
  $("#button i").removeClass("fa fa-search");
  $("#button i").addClass("fa fa-circle-o-notch fa-spin");
  setTimeout(function () {
    $("#button i").removeClass("fa fa-circle-o-notch fa-spin");
    $("#button i").addClass("fa fa-search");
  }, 1500);

  var user = document.getElementById("inputSearch").value;
  var typeSearch = document.getElementById("searchSelection").value;
  var array = user.split(" ");
  var formData = { type: typeSearch, user: array };
  $.ajax({
    url: "/db/searchUser/",
    type: "POST",
    data: formData,
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (d) {
      document.getElementById("inputSearch").value = "";
      tableCustomer(d);
    },
  });
}

function searchRent() {
  $("#button i").removeClass("fa fa-search");
  $("#button i").addClass("fa fa-circle-o-notch fa-spin");
  setTimeout(function () {
    $("#button i").removeClass("fa fa-circle-o-notch fa-spin");
    $("#button i").addClass("fa fa-search");
  }, 1500);

  var rent = document.getElementById("inputSearchRent").value;
  var typeSearch = document.getElementById("searchSelectionRent").value;
  var array = rent.split(" ");
  var formData = { type: typeSearch, rent: array };
  $.ajax({
    url: "/db/searchRent/",
    type: "POST",
    data: formData,
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (d) {
      tableRent(d);
    },
  });
}

function home() {
  var div = document.getElementById("content");
  div.innerHTML = `
  <div class = "main-text-container">
      <div class="main-text">
          <h1>NoloNolo</h1>
          <h2>Plus</h2>
      </div>
  </div>`;
}

//funzioni relative agli Oggetti

function convertToBase64() {
  let img = document.getElementById("imgAddObj");
  var reader = new FileReader();
  if (img.files[0] != undefined) {
    reader.readAsDataURL(img.files[0]);
    reader.onload = function () {
      //console.log(reader.result);//base64encoded string
      document.getElementById("base64Img").innerText = reader.result;
    };
    reader.onerror = function (error) {
      console.log("Error: ", error);
    };
  } else return "";
}

function addObj() {
  let marca = document.getElementById("marcaAddObj").value.toLowerCase();
  let modello = document.getElementById("modelloAddObj").value.toLowerCase();
  let categoria = document
    .getElementById("categoriaAddObj")
    .value.toLowerCase();
  let condizioni = document
    .getElementById("condizioniSelectionAddObj")
    .value.toLowerCase();
  let anno = document.getElementById("annoAddObj").value;
  let prezzo = document.getElementById("prezzoAddObj").value;
  let base64 = convertToBase64();
  let encodedImg = document.getElementById("base64Img").innerText;
  console.log(encodedImg);
  let cookie = getCookie("SessionCookie");
  let formData = [];

  formData[0] = { name: "marca", value: marca };
  formData[1] = { name: "modello", value: modello };
  formData[2] = { name: "categoria", value: categoria };
  formData[3] = { name: "condizioni", value: condizioni };
  formData[4] = { name: "anno", value: anno };
  formData[5] = { name: "prezzo", value: prezzo };
  formData[6] = { name: "img", value: encodedImg };
  formData[7] = { name: "cookie", value: cookie };
  // var imgObj = {
  //     name: "immagine",
  //     value: document.getElementById("imgObj").files[0].name
  // }
  // formData[4] = imgObj;

  if (
    formData[0].value != "" &&
    formData[1].value != "" &&
    formData[2].value != "" &&
    formData[3].value != "" &&
    formData[4].value != "" &&
    formData[5].value != "" &&
    formData[6].value != "" /* && formData[6].value != "" */
  ) {
    $.ajax({
      url: "/db/createObj/",
      type: "POST",
      data: formData,
      dataType: "text",
      contentType: "application/x-www-form-urlencoded",
      success: function (data) {
        console.log(data);
        if (data == "false") {
          notLogged();
        } else {
          document.getElementById("alertContent").textContent =
            "Oggetto aggiunto!";
          $("#alertModal").modal("show");
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        if (xhr.status == 413) {
          document.getElementById("alertContent").textContent =
            "Error: " + xhr.status + " " + thrownError;
          $("#alertModal").modal("show");
        }
      },
    });

    document.getElementById("base64Img").innerText = "";
    $("#addObjForm").trigger("reset");
    $("#addObjModal").modal("hide");
    console.log("Oggetto aggiunto");
    cataLOG(); // ogni volta che aggiungo un oggetto, aggiorno il catalogo
  } else {
    document.getElementById("alertContent").textContent =
      "Compilare tutti i campi";
    $("#alertModal").modal("show");
  }
}

function modObj() {
  let marca = document.getElementById("marcaModObj").value;
  let modello = document.getElementById("modelloModObj").value;
  let categoria = document.getElementById("categoriaModObj").value;
  let condizioni = document.getElementById("condizioniSelectionModObj").value;
  let anno = document.getElementById("annoModObj").value;
  let prezzo = document.getElementById("prezzoModObj").value;
  let cookie = getCookie("SessionCookie");
  let formData = [];

  formData[0] = { name: "marca", value: marca };
  formData[1] = { name: "modello", value: modello };
  formData[2] = { name: "categoria", value: categoria };
  formData[3] = { name: "condizioni", value: condizioni };
  formData[4] = { name: "anno", value: anno };
  formData[5] = { name: "prezzo", value: prezzo };
  formData[6] = { name: "cookie", value: cookie };

  // var imgObj = {
  //     name: "immagine",
  //     value: document.getElementById("imgObj").files[0].name
  // }
  // formData[4] = imgObj;
  if (
    formData[0].value != "" &&
    formData[1].value != "" &&
    formData[2].value != "" &&
    formData[3].value != "" &&
    formData[4].value != "" &&
    formData[5].value != "" /* && formData[6].value != "" */
  ) {
    $.ajax({
      url: "/db/updateObj/",
      type: "POST",
      data: { idOldObj, formData },
      dataType: "json",
      contentType: "application/x-www-form-urlencoded",
      success: function (data) {
        console.log(data);
        if (data == false) {
          notLogged();
        } else {
          document.getElementById("alertContent").textContent =
            "Oggetto modificato!";
          $("#alertModal").modal("show");
          console.log("Oggetto modificato");
        }
      },
    });
    $("#modObjForm").trigger("reset");
    $("#modObjModal").modal("hide");
    cataLOG(); // ogni volta che aggiungo un oggetto, aggiorno il catalogo
  } else {
    document.getElementById("alertContent").textContent =
      "Compilare tutti i campi";
    $("#alertModal").modal("show");
  }
}

function delObj() {
  let formData = { type: "idOggetto", rent: idOldObj };
  $.ajax({
    url: "/db/searchRent/",
    type: "POST",
    data: formData,
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (data) {
      console.log(data.result);
      console.log(data.result.length);
      if (!data.result.length) {
        let cookie = getCookie("SessionCookie");
        let data = { cookie: cookie };
        $.ajax({
          url: "/db/deleteObj/",
          type: "DELETE",
          data: { idOldObj, data },
          dataType: "json",
          contentType: "application/x-www-form-urlencoded",
          success: function (data) {
            if (data == false) {
              notLogged();
            } else {
              document.getElementById("alertContent").textContent =
                "Oggetto rimosso!";
              $("#alertModal").modal("show");
              console.log("Oggetto rimosso");
            }
          },
        });
        $("#modObjForm").trigger("reset");
        $("#modObjModal").modal("hide");
        cataLOG(); // ogni volta che aggiungo un oggetto, aggiorno il catalogo
      } else {
        document.getElementById("alertContent").textContent =
          "Non è possibile rimuovere oggetti che sono stati noleggiati.";
        $("#alertModal").modal("show");
      }
    },
  });
}

function getObj(e) {
  let current = e.parentNode;
  let string = current.getElementsByClassName("card_title")[0].textContent;
  let marca = current.querySelector(".spanMarca").textContent;
  let modello = current.querySelector(".spanModello").textContent;
  let categoria = current.querySelector(".ulCard li:nth-child(1)").textContent;
  let condizioni = current
    .querySelector(".ulCard li:nth-child(2)")
    .textContent.toLowerCase();
  let anno = current
    .querySelector(".ulCard li:nth-child(3)")
    .textContent.substr(6);
  let prezzo = current
    .querySelector(".ulCard li:nth-child(4)")
    .textContent.substr(8);
  prezzo = parseInt(prezzo.substr(0, prezzo.length - 1));
  idOldObj = current.querySelector(".ulCard li:nth-child(5)").textContent;
  let selected = document.getElementById("condizioniSelectionModObj").children;
  switch (condizioni) {
    case "come nuovo":
      selected[0].selected = true;
      selected[0].ariaSelected = true;
      break;
    case "ottime condizioni":
      selected[1].selected = true;
      selected[1].ariaSelected = true;
      break;
    case "buone condizioni":
      selected[2].selected = true;
      selected[2].ariaSelected = true;
      break;
    case "usurato":
      selected[3].selected = true;
      selected[3].ariaSelected = true;
      break;
    default:
      console.log("Errore; Inserire una condizione valida");
      break;
  }
  let modal = document.getElementById("modObjModal");
  let data = modal.getElementsByClassName("form-control");
  data[0].value = marca;
  data[1].value = modello;
  data[2].value = categoria;
  data[3].value = anno;
  data[4].value = prezzo;
}

function unavailableObj(e) {
  let current = e.parentNode;
  let idObj = current.querySelector(".ulCard li:nth-child(5)").textContent;
  let condizioni = current.querySelector(".ulCard li:nth-child(2)").textContent;
  let nuoveCondizioni = "";
  if (condizioni.toLowerCase() != "manutenzione") {
    nuoveCondizioni = "manutenzione";
    console.log(idObj);
    let cookie = getCookie("SessionCookie");
    let data = { cookie: cookie };
    $.ajax({
      url: "/db/unavailableObj/",
      type: "POST",
      data: { idObj, nuoveCondizioni, data },
      dataType: "json",
      contentType: "application/x-www-form-urlencoded",
      success: function (data) {
        if (data == false) {
          notLogged();
        } else {
          document.getElementById("alertContent").textContent =
            "Oggetto in manutenzione";
          $("#alertModal").modal("show");
          $.ajax({
            url: "/db/searchRent/",
            type: "POST",
            data: { type: "idOggetto", rent: idObj },
            dataType: "json",
            contentType: "application/x-www-form-urlencoded",
            success: function (data) {
              console.log(data);
              let formDataArray = [];
              if (data.result != null) {
                let stato = "da sostituire";
                let formData = { name: "stato", value: stato };
                let today = new Date();
                let currentDay = new Date(
                  today.getFullYear() +
                    "/" +
                    (today.getMonth() + 1) +
                    "/" +
                    today.getDate()
                );
                for (let i = 0; i < data.result.length; i++) {
                  if (
                    stringToDate(data.result[i].startDate, "dd/mm/yyyy", "/") >
                    currentDay
                  ) {
                    let idRent = data.result[i]._id;
                    let username = data.result[i].username;
                    let prezzo =
                      data.result[i].prezzo + data.result[i].punti / 2;
                    let punti = data.result[i].punti;
                    formDataArray.push({
                      username: username,
                      prezzo: prezzo,
                      punti: punti,
                    });
                    $.ajax({
                      url: "/db/switchStateRent/",
                      type: "POST",
                      data: { idRent, formData },
                      dataType: "json",
                      contentType: "application/x-www-form-urlencoded",
                      success: function (data) {},
                    });
                  }
                }
                console.log(formDataArray);
                for (let k = 0; k < formDataArray.length; k++) {
                  $.ajax({
                    url: "/db/puntiFed/",
                    type: "POST",
                    data: formDataArray[k],
                    dataType: "json",
                    contentType: "application/x-www-form-urlencoded",
                    success: function (data) {},
                  });
                }
              }
            },
          });
        }
      },
    });
    cataLOG();
  } else {
    nuoveCondizioni = "buone condizioni";
    console.log(idObj);
    let cookie = getCookie("SessionCookie");
    let data = { cookie: cookie };
    $.ajax({
      url: "/db/unavailableObj/",
      type: "POST",
      data: { idObj, nuoveCondizioni, data },
      dataType: "json",
      contentType: "application/x-www-form-urlencoded",
      success: function (data) {
        if (data == false) {
          notLogged();
        } else {
          document.getElementById("alertContent").textContent =
            "Oggetto di nuovo disponibile";
          $("#alertModal").modal("show");
          cataLOG();
        }
      },
    });
  }
}

function selectionUser() {
  $("#button i").removeClass("fa fa-search");
  $("#button i").addClass("fa fa-circle-o-notch fa-spin");
  setTimeout(function () {
    $("#button i").removeClass("fa fa-circle-o-notch fa-spin");
    $("#button i").addClass("fa fa-search");
  }, 1500);
  var user = document.getElementById("utenteNoleggio").value;
  var typeSearch = "username";
  var array = user.split(" ");
  var formData = { type: typeSearch, user: array };
  $.ajax({
    url: "/db/searchUser/",
    type: "POST",
    data: formData,
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (d) {
      let selected = document.getElementById("selUser");
      selected.innerHTML = `<option value="" selected>
                Utenti corrispondenti alla ricerca </option>`;
      document.getElementById("utenteNoleggio").value = "";
      for (let i in d.result) {
        let username = d.result[i].username.toLowerCase();
        const option = document.createElement("option");
        option.textContent = username;
        option.value = username;
        selected.appendChild(option);
      }
      selected.style.display = "block";
    },
  });
}

function selectionUserPuntiFed(e) {
  let selected = [e.value];
  let formData = { type: "username", user: selected };
  $.ajax({
    url: "/db/searchUser/",
    type: "POST",
    data: formData,
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (d) {
      document.getElementById("puntiFedeltàNoleggio").value = 0;
      let puntiFedeltà = d.result[0].punti;
      let preventivo = document.getElementById("preventivoNoleggio").value;
      let prezzo = parseInt(preventivo);
      let punti = Math.min(puntiFedeltà, prezzo);
      if (punti < 0) {
        punti = 0;
      }
      document
        .getElementById("puntiFedeltàNoleggio")
        .setAttribute("max", punti);
      document.getElementById("labelPuntiFedeltàNoleggio").textContent =
        "Punti Fedeltà da utilizzare (max. " + punti + ")";
      document.getElementById("puntiFedUtente").value = puntiFedeltà;
      console.log(document.getElementById("startDate"));
      console.log(document.getElementById("endDate"));
      if (
        document.getElementById("startDate").value != "" &&
        document.getElementById("endDate").value != ""
      ) {
        document.getElementById("preventivoNoleggio").style.display = "block";
        document.getElementById("labelPreventivoNoleggio").style.display =
          "block";
        document.getElementById("puntiFedeltàNoleggio").style.display = "block";
        document.getElementById("labelPuntiFedeltàNoleggio").style.display =
          "block";
        document.getElementById("rentObjConfirmBtn").style.display = "inline";
        let prezzoaggiornato = quotePreventivo();
        document.getElementById("preventivoNoleggio").value = prezzoaggiornato;
      } else {
        document.getElementById("preventivoNoleggio").style.display = "none";
        document.getElementById("labelPreventivoNoleggio").style.display =
          "none";
        document.getElementById("puntiFedeltàNoleggio").style.display = "none";
        document.getElementById("labelPuntiFedeltàNoleggio").style.display =
          "none";
        document.getElementById("rentObjConfirmBtn").style.display = "none";
      }
    },
  });
}

function changePuntiFedeltà() {
  let prezzoaggiornato = quotePreventivo();
  document.getElementById("preventivoNoleggio").value = prezzoaggiornato;
  console.log(document.getElementById("preventivoNoleggio").value);
}

function modRent(e) {
  idRent = null;
  let current = e.parentNode.parentNode;
  let marca = current.querySelector(".spanMarcaTable").textContent;
  let modello = current.querySelector(".spanModelloTable").textContent;
  document.getElementById("noleggioMarcaModello").value =
    marca.capitalize() + " " + modello.capitalize();
  let punti = current.getElementsByClassName("tdRent")[9].textContent;
  document.getElementById("noleggioPuntiFedeltàUtilizzati").value = punti;
  let prezzo = current.getElementsByClassName("tdRent")[3].textContent;

  if (punti == 0) {
    document.getElementById("noleggioPuntiFedeltàGuadagnati").value =
      Math.floor(parseInt(prezzo) / 50) * 10;
    oldPunti = Math.floor(parseInt(prezzo) / 50) * 10;
  } else {
    document.getElementById("noleggioPuntiFedeltàGuadagnati").value = 0;
  }

  let username = current.getElementsByClassName("tdRent")[0].textContent;
  document.getElementById("noleggioUsername").value = username;
  let prezzoGiornaliero =
    current.getElementsByClassName("tdRent")[5].textContent;
  console.log(prezzoGiornaliero);

  idRent = current.getElementsByClassName("tdRent")[6].textContent;
  document.getElementById("idNoleggio").value = idRent;
  let idObj = current.getElementsByClassName("tdRent")[7].textContent;
  prezzo = parseInt(prezzo.substr(0, prezzo.length - 1));
  document.getElementById("prezzoNoleggio").value = prezzo;

  let dataInizio = current.getElementsByClassName("tdRent")[1].textContent;
  let dataFine = current.getElementsByClassName("tdRent")[2].textContent;
  let today = new Date();
  let currentDay = new Date(
    today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate()
  );
  let start = stringToDate(dataInizio, "dd/mm/yyyy", "/");

  var formData = { type: "idOggetto", rent: idObj };

  if (currentDay.getTime() >= start.getTime()) {
    document
      .getElementById("noleggioStartDate")
      .setAttribute("readonly", "readonly");
    document
      .getElementById("noleggioEndDate")
      .setAttribute("readonly", "readonly");
    document
      .getElementById("modRentConfirmBtn")
      .setAttribute("readonly", "readonly");
  } else {
    document.getElementById("noleggioStartDate").removeAttribute("readonly");
    document.getElementById("noleggioEndDate").removeAttribute("readonly");
    document.getElementById("modRentConfirmBtn").removeAttribute("readonly");
  }

  let cnt = 0;
  let dateArray = [];
  $("#noleggioStartDate").datepicker("destroy");
  $("#noleggioEndDate").datepicker("destroy");
  $.ajax({
    url: "/db/searchRent/",
    type: "POST",
    data: formData,
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (d) {
      for (let i in d.result) {
        if (idRent != d.result[i]._id) {
          condizioniGlobal = d.result[i].condizioni;
          let startDate = d.result[i].startDate;
          let splitStartData = startDate.split("/");
          let endDate = d.result[i].endDate;
          let splitEndData = endDate.split("/");
          cnt = cnt + 1;
          var dates = {
            start: new Date(
              parseInt(splitStartData[2]) +
                "-" +
                parseInt(splitStartData[1]) +
                "-" +
                parseInt(splitStartData[0])
            ).setHours(00, 00, 00),
            end: new Date(
              parseInt(splitEndData[2]) +
                "-" +
                parseInt(splitEndData[1]) +
                "-" +
                parseInt(splitEndData[0])
            ).setHours(00, 00, 00),
          };
          dateArray.push(dates);
        }
      }
    },
  });

  $("#noleggioStartDate").val(dataInizio);
  $("#noleggioEndDate").val(dataFine);
  oldStartDate = document.getElementById("noleggioStartDate").value;
  oldEndDate = document.getElementById("noleggioEndDate").value;
  $("#noleggioStartDate").datepicker({
    onSelect: function (date) {
      let splitStart = document
        .getElementById("noleggioStartDate")
        .value.split("/");
      let start = new Date(
        parseInt(splitStart[2]) +
          "-" +
          parseInt(splitStart[1]) +
          "-" +
          parseInt(splitStart[0])
      ).setHours(00, 00, 00);
      let splitEnd = document
        .getElementById("noleggioEndDate")
        .value.split("/");
      let end = new Date(
        parseInt(splitEnd[2]) +
          "-" +
          parseInt(splitEnd[1]) +
          "-" +
          parseInt(splitEnd[0])
      ).setHours(00, 00, 00);
      for (let i = 0; i < dateArray.length; i++) {
        if (end == "") {
          console.log("Inserisci una data di fine");
        } else {
          if (
            (start < dateArray[i].start && end > dateArray[i].start) ||
            (start > dateArray[i].end && end < dateArray[i].end)
          ) {
            document.getElementById("alertContent").textContent =
              "Date non valide!";
            $("#alertModal").modal("show");
            document.getElementById("noleggioStartDate").value = oldStartDate;
            document.getElementById("noleggioEndDate").value = oldEndDate;
            break;
          }
        }
      }

      if (document.getElementById("noleggioStartDate").value != "") {
        document.getElementById("prezzoNoleggio").style.display = "block";
        document.getElementById("labelPrezzoNoleggio").style.display = "block";
        document.getElementById("rentObjConfirmBtn").style.display = "inline";
      }
      let prezzoaggiornato = quotePrezzoNoleggioStart(
        prezzoGiornaliero,
        oldStartDate,
        prezzo
      );
      document.getElementById("prezzoNoleggio").value = prezzoaggiornato;
    },
    beforeShowDay: function (date) {
      for (var i = 0; i < cnt; i++) {
        if (date >= dateArray[i].start && date <= dateArray[i].end)
          return [false, ""];
      }
      return [true, ""];
    },
  });
  $("#noleggioEndDate").datepicker({
    onSelect: function (date) {
      let splitEnd = document
        .getElementById("noleggioEndDate")
        .value.split("/");
      let end = new Date(
        parseInt(splitEnd[2]) +
          "-" +
          parseInt(splitEnd[1]) +
          "-" +
          parseInt(splitEnd[0])
      ).setHours(00, 00, 00);
      let splitStart = document
        .getElementById("noleggioStartDate")
        .value.split("/");
      let start = new Date(
        parseInt(splitStart[2]) +
          "-" +
          parseInt(splitStart[1]) +
          "-" +
          parseInt(splitStart[0])
      ).setHours(00, 00, 00);
      for (let i = 0; i < dateArray.length; i++) {
        if (start == "") {
          console.log("Inserisci una data di inizio");
        } else {
          if (
            (start < dateArray[i].start && end > dateArray[i].start) ||
            (start > dateArray[i].end && end < dateArray[i].end)
          ) {
            document.getElementById("alertContent").textContent =
              "Date non valide!";
            $("#alertModal").modal("show");
            document.getElementById("noleggioStartDate").value = oldStartDate;
            document.getElementById("noleggioEndDate").value = oldEndDate;
            break;
          }
        }
      }

      if (document.getElementById("noleggioEndDate").value != "") {
        document.getElementById("prezzoNoleggio").style.display = "block";
        document.getElementById("labelPrezzoNoleggio").style.display = "block";
        document.getElementById("rentObjConfirmBtn").style.display = "inline";
      }
      let prezzoaggiornato = quotePrezzoNoleggio(
        prezzoGiornaliero,
        oldEndDate,
        prezzo
      );
      document.getElementById("prezzoNoleggio").value = prezzoaggiornato;
    },
    beforeShowDay: function (date) {
      for (var i = 0; i < cnt; i++) {
        if (date >= dateArray[i].start && date <= dateArray[i].end)
          return [false, ""];
      }
      return [true, ""];
    },
  });
}

function modRentConfirm() {
  let prezzo = document.getElementById("prezzoNoleggio").value;
  let startDate = document.getElementById("noleggioStartDate").value;
  let endDate = document.getElementById("noleggioEndDate").value;
  let punti = parseInt(
    document.getElementById("noleggioPuntiFedeltàUtilizzati").value
  );
  let username = document.getElementById("noleggioUsername").value;
  let newPunti = 0;

  if (punti == 0) {
    newPunti = Math.floor(parseInt(prezzo) / 50) * 10;
  } else {
    document.getElementById("noleggioPuntiFedeltàGuadagnati").value = 0;
  }

  let modPunti = [];
  modPunti[0] = { name: "oldPunti", value: oldPunti };
  modPunti[1] = { name: "newPunti", value: newPunti };
  modPunti[2] = { name: "username", value: username };

  $.ajax({
    url: "/db/modPuntiRent/",
    type: "POST",
    data: modPunti,
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (d) {},
  });
  let cookie = getCookie("SessionCookie");

  let formData = [];
  formData[0] = { name: "prezzo", value: prezzo };
  formData[1] = { name: "startDate", value: startDate };
  formData[2] = { name: "endDate", value: endDate };
  formData[3] = { name: "idRent", value: idRent };
  formData[4] = { name: "cookie", value: cookie };
  if (
    formData[0].value != "" &&
    formData[1].value != "" &&
    formData[2].value != "" &&
    formData[3].value != ""
  ) {
    $.ajax({
      url: "/db/modRent/",
      type: "POST",
      data: formData,
      dataType: "json",
      contentType: "application/x-www-form-urlencoded",
      success: function (d) {
        if (d) {
          $("#modRentModal").modal("hide");
          document.getElementById("alertContent").textContent =
            "Modifica Effettuata!";
          $("#alertModal").modal("show");
          noleggiLOG();
        } else {
          document.getElementById("alertContent").textContent =
            "Errore in fase di modifica!";
          $("#alertModal").modal("show");
        }
      },
    });
  } else {
    document.getElementById("alertContent").textContent =
      "Compilare tutti i campi";
    $("#alertModal").modal("show");
  }
}

function delRent(e) {
  let puntiGuadagnati = document.getElementById(
    "noleggioPuntiFedeltàGuadagnati"
  ).value;
  let puntiUtilizzati = document.getElementById(
    "noleggioPuntiFedeltàUtilizzati"
  ).value;
  let username = document.getElementById("noleggioUsername").value;
  let idRent = document.getElementById("idNoleggio").value;
  $.ajax({
    url: "/db/deleteRent/",
    type: "DELETE",
    data: { idRent, puntiGuadagnati, puntiUtilizzati, username },
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (data) {
      if (data) {
        document.getElementById("alertContent").textContent =
          "Noleggio rimosso!";
        $("#alertModal").modal("show");
        $("#modRentForm").trigger("reset");
        $("#modRentModal").modal("hide");
        console.log("Noleggio rimosso");
        noleggiLOG(); // ogni volta che aggiungo un oggetto, aggiorno il catalogo
      } else {
        document.getElementById("alertContent").textContent =
          "Errore in fase di rimozione!";
        $("#alertModal").modal("show");
      }
    },
  });
}

function rentObj(e) {
  imgRent = "";
  $("#rentObjForm").trigger("reset");
  //$("#modObjModal").modal("hide");
  document.getElementById("puntiFedeltàNoleggio").value = 0;
  let current = e.parentNode;
  let categoria = current.querySelector(".ulCard li:nth-child(1)").textContent;
  let marca = current.querySelector(".spanMarca").textContent;
  let modello = current.querySelector(".spanModello").textContent;
  console.log(modello);
  condizioniGlobal = current.querySelector(
    ".ulCard li:nth-child(2)"
  ).textContent;
  let prezzo = current
    .querySelector(".ulCard li:nth-child(4)")
    .textContent.substr(8);
  document.getElementById("spanMarcaRentObjModal").textContent = marca;
  document.getElementById("spanModelloRentObjModal").textContent = modello;
  let idRentObj = current.querySelector(".ulCard li:nth-child(5)").textContent;
  var formData = { type: "idOggetto", rent: idRentObj };
  imgRent = current.parentNode
    .getElementsByClassName("card_image")[0]
    .querySelector("img").src;
  let cnt = 0;
  let dateArray = [];
  $("#startDate").datepicker("destroy");
  $("#endDate").datepicker("destroy");
  $.ajax({
    url: "/db/searchRent/",
    type: "POST",
    data: formData,
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (d) {
      for (let i in d.result) {
        let condizioni = d.result[i].condizioni;
        let startDate = d.result[i].startDate;
        let splitStartData = startDate.split("/");
        let endDate = d.result[i].endDate;
        let splitEndData = endDate.split("/");
        cnt = cnt + 1;
        var dates = {
          start: new Date(
            parseInt(splitStartData[2]) +
              "-" +
              parseInt(splitStartData[1]) +
              "-" +
              parseInt(splitStartData[0])
          ).setHours(00, 00, 00),
          end: new Date(
            parseInt(splitEndData[2]) +
              "-" +
              parseInt(splitEndData[1]) +
              "-" +
              parseInt(splitEndData[0])
          ).setHours(00, 00, 00),
        };
        dateArray.push(dates);
      }
    },
  });

  $("#startDate").datepicker({
    onSelect: function (date) {
      document.getElementById("puntiFedeltàNoleggio").value = 0;
      let splitEnd = document.getElementById("endDate").value.split("/");
      let end = new Date(
        parseInt(splitEnd[2]) +
          "-" +
          parseInt(splitEnd[1]) +
          "-" +
          parseInt(splitEnd[0])
      ).setHours(00, 00, 00);
      let splitStart = document.getElementById("startDate").value.split("/");
      let start = new Date(
        parseInt(splitStart[2]) +
          "-" +
          parseInt(splitStart[1]) +
          "-" +
          parseInt(splitStart[0])
      ).setHours(00, 00, 00);
      console.log(start, end);
      for (let i = 0; i < dateArray.length; i++) {
        if (start == "") {
          console.log("Inserisci una data di inizio");
        } else {
          if (
            (start < dateArray[i].start && end > dateArray[i].start) ||
            (start > dateArray[i].end && end < dateArray[i].end)
          ) {
            document.getElementById("alertContent").textContent =
              "Date non valide!";
            $("#alertModal").modal("show");
            document.getElementById("startDate").value = "";
            document.getElementById("endDate").value = "";
            break;
          }
        }
      }
      if (
        document.getElementById("endDate").value != "" &&
        document.getElementById("puntiFedUtente").value != ""
      ) {
        document.getElementById("preventivoNoleggio").style.display = "block";
        document.getElementById("labelPreventivoNoleggio").style.display =
          "block";
        document.getElementById("puntiFedeltàNoleggio").style.display = "block";
        document.getElementById("labelPuntiFedeltàNoleggio").style.display =
          "block";
        document.getElementById("rentObjConfirmBtn").style.display = "inline";
      }
      let prezzoaggiornato = quotePreventivo();
      document.getElementById("preventivoNoleggio").value = prezzoaggiornato;
      let puntiFedeltà = document.getElementById("puntiFedUtente").value;
      let punti = Math.min(puntiFedeltà, prezzoaggiornato);
      if (punti < 0) {
        punti = 0;
      }
      document
        .getElementById("puntiFedeltàNoleggio")
        .setAttribute("max", punti);
      document.getElementById("labelPuntiFedeltàNoleggio").textContent =
        "Punti Fedeltà da utilizzare (max. " + punti + ")";
      document.getElementById("puntiFedeltàNoleggio").value = 0;
    },

    beforeShowDay: function (date) {
      for (var i = 0; i < cnt; i++) {
        if (date >= dateArray[i].start && date <= dateArray[i].end)
          return [false, ""];
      }
      return [true, ""];
    },
  });

  $("#endDate").datepicker({
    onSelect: function (date) {
      document.getElementById("puntiFedeltàNoleggio").value = 0;
      let splitEnd = document.getElementById("endDate").value.split("/");
      let end = new Date(
        parseInt(splitEnd[2]) +
          "-" +
          parseInt(splitEnd[1]) +
          "-" +
          parseInt(splitEnd[0])
      ).setHours(00, 00, 00);
      let splitStart = document.getElementById("startDate").value.split("/");
      let start = new Date(
        parseInt(splitStart[2]) +
          "-" +
          parseInt(splitStart[1]) +
          "-" +
          parseInt(splitStart[0])
      ).setHours(00, 00, 00);
      for (let i = 0; i < dateArray.length; i++) {
        if (start == "") {
          console.log("Inserisci una data di inizio");
        } else {
          if (
            (start < dateArray[i].start && end > dateArray[i].start) ||
            (start > dateArray[i].end && end < dateArray[i].end)
          ) {
            document.getElementById("alertContent").textContent =
              "Date non valide!";
            $("#alertModal").modal("show");
            document.getElementById("startDate").value = "";
            document.getElementById("endDate").value = "";
            break;
          }
        }
      }
      if (
        document.getElementById("startDate").value != "" &&
        document.getElementById("puntiFedUtente").value != ""
      ) {
        document.getElementById("preventivoNoleggio").style.display = "block";
        document.getElementById("labelPreventivoNoleggio").style.display =
          "block";
        document.getElementById("puntiFedeltàNoleggio").style.display = "block";
        document.getElementById("labelPuntiFedeltàNoleggio").style.display =
          "block";
        document.getElementById("rentObjConfirmBtn").style.display = "inline";
      }
      let prezzoaggiornato = quotePreventivo();
      document.getElementById("preventivoNoleggio").value = prezzoaggiornato;
      let puntiFedeltà = document.getElementById("puntiFedUtente").value;
      let punti = Math.min(puntiFedeltà, prezzoaggiornato);
      if (punti < 0) {
        punti = 0;
      }
      document
        .getElementById("puntiFedeltàNoleggio")
        .setAttribute("max", punti);
      document.getElementById("labelPuntiFedeltàNoleggio").textContent =
        "Punti Fedeltà da utilizzare (max. " + punti + ")";
      document.getElementById("puntiFedeltàNoleggio").value = 0;
    },

    beforeShowDay: function (date) {
      for (var i = 0; i < cnt; i++) {
        if (date >= dateArray[i].start && date <= dateArray[i].end)
          return [false, ""];
      }
      return [true, ""];
    },
  });

  document.getElementById("selUser").style.display = "none";
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
  document.getElementById("preventivoNoleggio").style.display = "none";
  document.getElementById("puntiFedeltàNoleggio").style.display = "none";
  document.getElementById("labelPuntiFedeltàNoleggio").style.display = "none";
  document.getElementById("labelPreventivoNoleggio").style.display = "none";
  document.getElementById("rentObjConfirmBtn").style.display = "none";
  document.getElementById("preventivoNoleggio").value = prezzo;
  document.getElementById("idOggetto").value = idRentObj;
  document.getElementById("categoria").value = categoria;
  prezzoObj = prezzo.substr(0, prezzo.length - 1);
}

function quotePreventivo() {
  if (
    stringToDate(
      document.getElementById("startDate").value,
      "dd/mm/yyyy",
      "/"
    ).getTime() <=
      stringToDate(
        document.getElementById("endDate").value,
        "dd/mm/yyyy",
        "/"
      ).getTime() ||
    document.getElementById("endDate").value == "" ||
    document.getElementById("startDate").value == ""
  ) {
    let time =
      stringToDate(
        document.getElementById("endDate").value,
        "dd/mm/yyyy",
        "/"
      ).getTime() -
      stringToDate(
        document.getElementById("startDate").value,
        "dd/mm/yyyy",
        "/"
      ).getTime();
    let punti = document.getElementById("puntiFedeltàNoleggio").value;
    let days = Math.trunc(time / (24 * 1000 * 3600));
    let prezzoFinale = 0;
    if (days >= 7 && days < 30) {
      prezzoFinale =
        ((parseInt(prezzoObj) + parseInt(prezzoObj * days) - (punti / 10) * 5) /
          100) *
        95;
    } else if (days >= 30) {
      prezzoFinale =
        ((parseInt(prezzoObj) + parseInt(prezzoObj * days) - (punti / 10) * 5) /
          100) *
        90;
    } else {
      prezzoFinale =
        parseInt(prezzoObj) + parseInt(prezzoObj * days) - (punti / 10) * 5;
    }
    if (Number.isNaN(prezzoFinale)) {
      prezzoFinale = 0;
    }
    if (condizioniGlobal == "usurato") {
      prezzoFinale = (prezzoFinale / 100) * 95;
    }
    console.log(prezzoFinale);
    return prezzoFinale.toFixed(2);
  } else {
    document.getElementById("preventivoNoleggio").style.display = "none";
    document.getElementById("labelPreventivoNoleggio").style.display = "none";
    document.getElementById("alertContent").textContent =
      "Inserire una data di fine noleggio corretta";
    $("#alertModal").modal("show");
    document.getElementById("endDate").value = "";
    return 0;
  }
}

function quotePrezzoNoleggio(prezzoNoleggio, oldEndDate, prezzoIniziale) {
  if (
    (stringToDate(
      document.getElementById("noleggioEndDate").value,
      "dd/mm/yyyy",
      "/"
    ).getTime() >= stringToDate(oldEndDate, "dd/mm/yyyy", "/").getTime() &&
      stringToDate(
        document.getElementById("noleggioStartDate").value,
        "dd/mm/yyyy",
        "/"
      ).getTime() <=
        stringToDate(
          document.getElementById("noleggioEndDate").value,
          "dd/mm/yyyy",
          "/"
        ).getTime()) ||
    document.getElementById("noleggioEndDate").value == "" ||
    document.getElementById("noleggioStartDate").value == ""
  ) {
    let time =
      stringToDate(
        document.getElementById("noleggioEndDate").value,
        "dd/mm/yyyy",
        "/"
      ).getTime() -
      stringToDate(
        document.getElementById("noleggioStartDate").value,
        "dd/mm/yyyy",
        "/"
      ).getTime();
    let punti = document.getElementById("noleggioPuntiFedeltàUtilizzati").value;
    let days = Math.trunc(time / (24 * 1000 * 3600));
    let prezzoFinale = 0;
    if (days >= 7 && days < 30) {
      prezzoFinale =
        ((parseInt(prezzoNoleggio) +
          parseInt(prezzoNoleggio * days) -
          (punti / 10) * 5) /
          100) *
        95;
    } else if (days >= 30) {
      prezzoFinale =
        ((parseInt(prezzoNoleggio) +
          parseInt(prezzoNoleggio * days) -
          (punti / 10) * 5) /
          100) *
        90;
    } else {
      prezzoFinale =
        parseInt(prezzoNoleggio) +
        parseInt(prezzoNoleggio * days) -
        (punti / 10) * 5;
    }
    if (Number.isNaN(prezzoFinale)) {
      prezzoFinale = 0;
    }
    if (condizioniGlobal == "usurato") {
      prezzoFinale = (prezzoFinale / 100) * 95;
    }
    return prezzoFinale.toFixed(2);
  } else {
    document.getElementById("prezzoNoleggio").style.display = "none";
    document.getElementById("labelPrezzoNoleggio").style.display = "none";
    document.getElementById("alertContent").textContent =
      "Inserire una data di fine noleggio corretta";
    $("#alertModal").modal("show");
    document.getElementById("noleggioEndDate").value = oldEndDate;
    return prezzoIniziale;
  }
}

function quotePrezzoNoleggioStart(
  prezzoNoleggio,
  oldStartDate,
  prezzoIniziale
) {
  if (
    (stringToDate(
      document.getElementById("noleggioStartDate").value,
      "dd/mm/yyyy",
      "/"
    ).getTime() <=
      stringToDate(
        document.getElementById("noleggioEndDate").value,
        "dd/mm/yyyy",
        "/"
      ).getTime() &&
      stringToDate(
        document.getElementById("noleggioStartDate").value,
        "dd/mm/yyyy",
        "/"
      ).getTime() <= stringToDate(oldStartDate, "dd/mm/yyyy", "/").getTime()) ||
    document.getElementById("noleggioEndDate").value == "" ||
    document.getElementById("noleggioStartDate").value == ""
  ) {
    let time =
      stringToDate(
        document.getElementById("noleggioEndDate").value,
        "dd/mm/yyyy",
        "/"
      ).getTime() -
      stringToDate(
        document.getElementById("noleggioStartDate").value,
        "dd/mm/yyyy",
        "/"
      ).getTime();
    let punti = document.getElementById("noleggioPuntiFedeltàUtilizzati").value;
    let days = Math.trunc(time / (24 * 1000 * 3600));
    let prezzoFinale = 0;
    if (days >= 7 && days < 30) {
      prezzoFinale =
        ((parseInt(prezzoNoleggio) +
          parseInt(prezzoNoleggio * days) -
          (punti / 10) * 5) /
          100) *
        95;
    } else if (days >= 30) {
      prezzoFinale =
        ((parseInt(prezzoNoleggio) +
          parseInt(prezzoNoleggio * days) -
          (punti / 10) * 5) /
          100) *
        90;
    } else {
      prezzoFinale =
        parseInt(prezzoNoleggio) +
        parseInt(prezzoNoleggio * days) -
        (punti / 10) * 5;
    }
    if (Number.isNaN(prezzoFinale)) {
      prezzoFinale = 0;
    }
    if (condizioniGlobal == "usurato") {
      prezzoFinale = (prezzoFinale / 100) * 95;
    }
    return prezzoFinale;
  } else {
    document.getElementById("prezzoNoleggio").style.display = "none";
    document.getElementById("labelPrezzoNoleggio").style.display = "none";
    document.getElementById("alertContent").textContent =
      "Inserire una data di inizio noleggio corretta";
    $("#alertModal").modal("show");
    document.getElementById("noleggioStartDate").value = oldStartDate;
    return prezzoIniziale;
  }
}

function stringToDate(_date, _format, _delimiter) {
  var formatLowerCase = _format.toLowerCase();
  var formatItems = formatLowerCase.split(_delimiter);
  var dateItems = _date.split(_delimiter);
  var monthIndex = formatItems.indexOf("mm");
  var dayIndex = formatItems.indexOf("dd");
  var yearIndex = formatItems.indexOf("yyyy");
  var month = parseInt(dateItems[monthIndex]);
  month -= 1;
  var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
  return formatedDate;
}

function rentObjConfirm() {
  let marca = document
    .getElementById("spanMarcaRentObjModal")
    .textContent.toLowerCase();
  let modello = document
    .getElementById("spanModelloRentObjModal")
    .textContent.toLowerCase();
  let username = document.getElementById("selUser").value;
  let startDate = document.getElementById("startDate").value;
  let endDate = document.getElementById("endDate").value;
  let prezzo = document.getElementById("preventivoNoleggio").value;
  let idObj = document.getElementById("idOggetto").value;
  let punti = document.getElementById("puntiFedeltàNoleggio").value;
  let categoria = document.getElementById("categoria").value;

  let stato = "prenotato";
  let cookie = getCookie("SessionCookie");
  let formData = [];
  formData[0] = { name: "marca", value: marca };
  formData[1] = { name: "modello", value: modello };
  formData[2] = { name: "username", value: username };
  formData[3] = { name: "startDate", value: startDate };
  formData[4] = { name: "endDate", value: endDate };
  formData[5] = { name: "prezzo", value: prezzo };
  formData[6] = { name: "prezzoGiornaliero", value: prezzoObj };
  formData[7] = { name: "stato", value: stato };
  formData[8] = { name: "idOggetto", value: idObj };
  formData[9] = { name: "punti", value: punti };
  formData[10] = { name: "img", value: imgRent };
  formData[11] = { name: "condizioni", value: condizioniGlobal };
  formData[12] = { name: "categoria", value: categoria };
  formData[13] = { name: "cookie", value: cookie };
  if (
    formData[0].value != "" &&
    formData[1].value != "" &&
    formData[2].value != "" &&
    formData[3].value != "" &&
    formData[4].value != "" &&
    formData[5].value != "" &&
    formData[6].value != "" &&
    formData[7].value != "" &&
    formData[8].value != "" &&
    formData[9].value != "" &&
    formData[10].value != "" &&
    formData[11].value != "" &&
    formData[12].value != ""
  ) {
    $.ajax({
      url: "/db/rentObj/",
      type: "POST",
      data: formData,
      dataType: "json",
      contentType: "application/x-www-form-urlencoded",
      success: function (data) {
        if (data == false) {
          notLogged();
        } else {
          if (punti == 0) {
            $.ajax({
              url: "/db/puntiFed/",
              type: "POST",
              data: formData,
              dataType: "json",
              contentType: "application/x-www-form-urlencoded",
              success: function (d) {},
            });
          } else {
            $.ajax({
              url: "/db/updatePuntiFed/",
              type: "POST",
              data: formData,
              dataType: "json",
              contentType: "application/x-www-form-urlencoded",
              success: function (d) {},
            });
          }
          document.getElementById("alertContent").textContent =
            "Oggetto noleggiato!";
          $("#alertModal").modal("show");
        }
      },
    });
    $("#rentObjModal").modal("hide");
  } else {
    document.getElementById("alertContent").textContent =
      "Compilare tutti i campi";
    $("#alertModal").modal("show");
  }
}

//funzioni relative agli Utenti
function addUser() {
  var formData = $("#addUserForm").serializeArray();

  if (
    formData[0].value != "" &&
    formData[1].value != "" &&
    formData[2].value != "" &&
    formData[3].value != "" &&
    formData[4].value != "" &&
    formData[5].value != "" &&
    formData[6].value != "" &&
    formData[7].value != "" &&
    formData[8].value != ""
  ) {
    $.ajax({
      url: "/db/createUser/",
      type: "POST",
      data: formData,
      dataType: "json",
      contentType: "application/x-www-form-urlencoded",
      success: function (data) {
        console.log(data);
        if (!data) {
          document.getElementById("alertContent").textContent =
            "Utente aggiunto!";
          $("#alertModal").modal("show");
          $("#addUserForm").trigger("reset");
          $("#addUserModal").modal("hide");
          console.log("Utente aggiunto");
          clientiLOG(); // ogni volta che aggiungo un utente, aggiorno il catalogo
        } else {
          document.getElementById("alertContent").textContent =
            "Username già esistente";
          $("#alertModal").modal("show");
        }
      },
    });
  } else {
    document.getElementById("alertContent").textContent =
      "Compilare tutti i campi";
    $("#alertModal").modal("show");
  }
}

function getUser(e) {
  let current = e.parentNode.parentNode;
  let username = current.getElementsByClassName("tdCustomer")[0].textContent;
  let string =
    current.getElementsByClassName("titleRowCustomer")[0].textContent;
  let nomeCognome = string.split(" ");
  let nome = nomeCognome[0];
  let cognome = nomeCognome[1];
  let mail = current.getElementsByClassName("tdCustomer")[1].textContent;
  let tel = current.getElementsByClassName("tdCustomer")[2].textContent;
  let stringIndirizzo = current
    .getElementsByClassName("tdCustomer")[3]
    .textContent.split(", ");
  let indirizzo = stringIndirizzo[0];
  let provincia = stringIndirizzo[1];
  let cap = stringIndirizzo[2];
  let punti = current.getElementsByClassName("tdCustomer")[4].textContent;
  let modal = document.getElementById("modUserModal");
  let data = modal.getElementsByClassName("form-control");
  data[0].value = username;
  data[1].value = nome;
  data[2].value = cognome;
  data[3].value = mail;
  data[4].value = tel;
  data[5].value = indirizzo;
  data[6].value = provincia;
  data[7].value = cap;
  idOldUser = current.getElementsByClassName("tdCustomer")[5].textContent;
}

function modUser() {
  var formData = $("#modUserForm").serializeArray();

  // var imgObj = {
  //     name: "immagine",
  //     value: document.getElementById("imgObj").files[0].name
  // }
  // formData[4] = imgObj;
  if (
    formData[0].value != "" &&
    formData[1].value != "" &&
    formData[2].value != "" &&
    formData[3].value != "" &&
    formData[4].value != "" &&
    formData[5].value != "" &&
    formData[6].value != ""
  ) {
    $.ajax({
      url: "/db/updateUser/",
      type: "POST",
      data: { idOldUser, formData },
      dataType: "json",
      contentType: "application/x-www-form-urlencoded",
      success: function (data) {
        if (data) {
          document.getElementById("alertContent").textContent =
            "Utente modificato!";
          $("#alertModal").modal("show");
          $("#modUserForm").trigger("reset");
          $("#modUserModal").modal("hide");
          console.log("Utente modificato");
          clientiLOG(); // ogni volta che aggiungo un utente, aggiorno il catalogo
        } else {
          document.getElementById("alertContent").textContent =
            "Errore durante la modifica!";
          $("#alertModal").modal("show");
        }
      },
    });
  } else {
    document.getElementById("alertContent").textContent =
      "Compilare tutti i campi";
    $("#alertModal").modal("show");
  }
}

function delUser() {
  let user = document.getElementById("usernameModUser").value;
  let formData = { type: "username", rent: [user] };
  let countPrenotati = 0;
  $.ajax({
    url: "/db/searchRent/",
    type: "POST",
    data: formData,
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (data) {
      for (let i = 0; i < data.result.length; i++) {
        if (
          data.result[i].stato == "prenotato" ||
          data.result[i].stato == "in corso" ||
          data.result[i].stato == "in ritardo" ||
          data.result[i].stato == "da sostituire"
        ) {
          countPrenotati++;
        }
      }
      console.log(countPrenotati);
      if (countPrenotati == 0) {
        $.ajax({
          url: "/db/deleteUser/",
          type: "DELETE",
          data: { idOldUser },
          dataType: "json",
          contentType: "application/x-www-form-urlencoded",
          success: function (data) {},
        });
        document.getElementById("alertContent").textContent = "Utente rimosso!";
        $("#alertModal").modal("show");
        $("#modUserForm").trigger("reset");
        $("#modUserModal").modal("hide");
        console.log("Utente rimosso");
      } else {
        document.getElementById("alertContent").textContent =
          "Non è possibile rimuovere un utente con noleggi attivi o prenotati.";
        $("#alertModal").modal("show");
        $("#modUserForm").trigger("reset");
        $("#modUserModal").modal("hide");
      }
      clientiLOG(); // ogni volta che aggiungo un utente, aggiorno il catalogo
    },
  });
}

function getAdmin(e) {
  let current = e.parentNode.parentNode;
  let username =
    current.getElementsByClassName("titleRowEmployee")[0].textContent;
  let nome = current.getElementsByClassName("tdEmployee")[0].textContent;
  let cognome = current.getElementsByClassName("tdEmployee")[1].textContent;
  let mail = current.getElementsByClassName("tdEmployee")[2].textContent;
  let tel = current.getElementsByClassName("tdEmployee")[3].textContent;
  let ruolo = current.getElementsByClassName("tdEmployee")[4].textContent;
  let modal = document.getElementById("modAdminModal");
  let data = modal.getElementsByClassName("form-control");
  data[0].value = username;
  data[1].value = nome;
  data[2].value = cognome;
  data[3].value = mail;
  data[4].value = tel;
  data[5].value = ruolo;
  idOldAdmin = current.getElementsByClassName("tdAdmin")[5].textContent;
}

function modAdmin() {
  var formData = $("#modAdminForm").serializeArray();

  // var imgObj = {
  //     name: "immagine",
  //     value: document.getElementById("imgObj").files[0].name
  // }
  // formData[4] = imgObj;
  if (
    formData[0].value != "" &&
    formData[1].value != "" &&
    formData[2].value != "" &&
    formData[3].value != "" &&
    formData[4].value != "" &&
    formData[5].value != "" /* && formData[6].value != "" */
  ) {
    $.ajax({
      url: "/db/updateAdmin/",
      type: "POST",
      data: { idOldAdmin, formData },
      dataType: "json",
      contentType: "application/x-www-form-urlencoded",
      success: function (data) {},
    });
    document.getElementById("alertContent").textContent = "Admin modificato!";
    $("#alertModal").modal("show");
    $("#modAdminForm").trigger("reset");
    $("#modAdminModal").modal("hide");
    cookie;
    console.log("Admin modificato");
    dipendentiLOG(); // ogni volta che aggiungo un admin, aggiorno il catalogo
  } else {
    document.getElementById("alertContent").textContent =
      "Compilare tutti i campi";
    $("#alertModal").modal("show");
  }
}

function delAdmin() {
  $.ajax({
    url: "/db/deleteAdmin/",
    type: "DELETE",
    data: { idOldAdmin },
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (data) {},
  });
  document.getElementById("alertContent").textContent = "Admin rimosso!";
  $("#alertModal").modal("show");
  $("#modAdminForm").trigger("reset");
  $("#modAdminModal").modal("hide");
  console.log("Admin rimosso");
  dipendentiLOG(); // ogni volta che aggiungo un Admin, aggiorno il catalogo
}

function cataLOG() {
  filters = {};
  document.getElementById("brandFilter").textContent = "Marca";
  document.getElementById("categoryFilter").textContent = "Categoria";
  $.ajax({
    url: "/db/cataLOG",
    type: "get",
    success: function (d) {
      cards(d);
      //riempimento array categorie
      for (let item of categorySet) {
        categoryArray.push(item);
      }
      categoryArray.sort();
      let dropdownCategoryFilter = document.getElementById(
        "dropdownCategoryFilter"
      );
      dropdownCategoryFilter.innerHTML = "";
      for (const element of categoryArray) {
        const li = document.createElement("li");
        li.innerHTML =
          `
                <a class = "dropdown-item category" href = "#" onclick="filtersCataLOG(this)">` +
          element +
          `</a>
                `;
        dropdownCategoryFilter.appendChild(li);
      }

      //riempimento array marche
      for (let item of brandSet) {
        brandArray.push(item);
      }
      brandArray.sort();
      let dropdownBrandFilter = document.getElementById("dropdownBrandFilter");
      dropdownBrandFilter.innerHTML = "";
      for (const element of brandArray) {
        const li = document.createElement("li");
        li.innerHTML =
          `
                <a class = "dropdown-item brand" href = "#" onclick="filtersCataLOG(this)">` +
          element +
          `</a>
                `;
        dropdownBrandFilter.appendChild(li);
      }
      let cardsArray = document.getElementsByClassName("ulCard");
      for (let item = 0; item < cardsArray.length; item++) {
        let condizioni = cardsArray[item]
          .querySelector(".ulCard li:nth-child(2)")
          .textContent.toLowerCase();
        if (condizioni == "manutenzione") {
          let y =
            cardsArray[item].parentNode.getElementsByClassName(
              "rentBtnCard"
            )[0];
          y.removeAttribute("data-bs-toggle");
          y.removeAttribute("data-bs-target");
          y.setAttribute("readonly", "readonly");
          let z =
            cardsArray[item].parentNode.getElementsByClassName(
              "updateBtnCard"
            )[0];
          z.removeAttribute("data-bs-toggle");
          z.removeAttribute("data-bs-target");
          z.setAttribute("readonly", "readonly");
        } else {
          let y =
            cardsArray[item].parentNode.getElementsByClassName(
              "rentBtnCard"
            )[0];
          y.setAttribute("data-bs-toggle", "modal");
          y.setAttribute("data-bs-target", "#rentObjModal");
          y.removeAttribute("readonly");
          let z =
            cardsArray[item].parentNode.getElementsByClassName(
              "updateBtnCard"
            )[0];
          z.setAttribute("data-bs-toggle", "modal");
          z.setAttribute("data-bs-target", "#modObjModal");
          z.removeAttribute("readonly");
        }
      }
    },
  });
  //document.getElementById("prova").focus()
}

function clientiLOG() {
  let cookie = getCookie("SessionCookie");
  let data = { cookie: cookie };
  $.ajax({
    url: "/db/clientiLOG",
    type: "POST",
    data: data,
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (d) {
      tableCustomer(d);
    },
  });
}

function dipendentiLOG() {
  let cookie = getCookie("SessionCookie");
  let data = { cookie: cookie };
  if (ruoloEmployee != "manager") {
  } else {
    $.ajax({
      url: "/db/dipendentiLOG",
      type: "POST",
      data: data,
      dataType: "json",
      contentType: "application/x-www-form-urlencoded",
      success: function (d) {
        document.getElementById("anagraficaDipendentiBody").innerHTML = "";
        for (let i in d.result) {
          let idDipendente = d.result[i]._id;
          let username = d.result[i].username;
          let nome = d.result[i].nome.toLowerCase();
          let cognome = d.result[i].cognome.toLowerCase();
          let mail = d.result[i].mail;
          let telefono = d.result[i].telefono;
          let ruolo = d.result[i].ruolo.toLowerCase();
          let tbody = document.getElementById("anagraficaDipendentiBody");
          const tr = document.createElement("tr");
          tr.innerHTML =
            `
              <th scope="row" class="titleRowEmployee">` +
            username +
            `</th>
              <td class="tdEmployee" style="text-transform: capitalize">` +
            nome +
            `</td>
              <td class="tdEmployee" style="text-transform: capitalize">` +
            cognome +
            `</td>
              <td class="tdEmployee">` +
            mail +
            `</td> 
              <td class="tdEmployee">` +
            telefono +
            `</td>
            <td class="tdEmployee" style="text-transform: capitalize">` +
            ruolo +
            `</td>
              <td class="tdEmployee" style="display:none">` +
            idDipendente +
            `</td>`;
          tbody.appendChild(tr);
        }
      },
    });
  }
}

function noleggiLOG() {
  let cookie = getCookie("SessionCookie");
  let data = { cookie: cookie };
  $.ajax({
    url: "/db/noleggiLOG",
    type: "POST",
    data: data,
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (d) {
      tableRent(d);
    },
  });
}

function getFattura(e) {
  let current = e.parentNode.parentNode;
  var strumento = current.getElementsByClassName("titleRowRent")[0].textContent;

  var dataInizio = current.getElementsByClassName("tdRent")[1].textContent;
  let splitStartData = dataInizio.split("/");
  var dateStart = new Date(
    parseInt(splitStartData[2]) +
      "/" +
      parseInt(splitStartData[1]) +
      "/" +
      parseInt(splitStartData[0])
  );
  var dataFine = current.getElementsByClassName("tdRent")[2].textContent;
  let splitEndData = dataFine.split("/");
  var dateEnd = new Date(
    parseInt(splitEndData[2]) +
      "/" +
      parseInt(splitEndData[1]) +
      "/" +
      parseInt(splitEndData[0])
  );

  var prezzoGiornaliero =
    current.getElementsByClassName("tdRent")[5].textContent;
  var puntiUtilizzati = current.getElementsByClassName("tdRent")[9].textContent;

  let id = current.getElementsByClassName("tdRent")[6].textContent;
  var formData = { type: "idRent", rent: id };

  $.ajax({
    url: "/db/searchRent/",
    type: "POST",
    data: formData,
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (d) {
      let cognome = d.result[0].fattura.cognome;
      let nome = d.result[0].fattura.nome;
      let indirizzoFatturazione = d.result[0].fattura.indirizzoFatturazione;
      let telefono = d.result[0].fattura.telefono;
      let dataFatturazione = d.result[0].fattura.dataFatturazione;
      let condizioni = d.result[0].condizioni;
      let splitInvoiceData = dataFatturazione.split("/");
      var dateInvoice = new Date(
        parseInt(splitInvoiceData[2]) +
          "/" +
          parseInt(splitInvoiceData[1]) +
          "/" +
          parseInt(splitInvoiceData[0])
      );

      var durataEffettiva = Math.trunc(
        parseInt(
          (dateInvoice.getTime() - dateStart.getTime()) / (1000 * 3600 * 24) + 1
        )
      );
      var durataPrevista = Math.trunc(
        (dateEnd.getTime() - dateStart.getTime()) / (1000 * 3600 * 24) + 1
      );
      let subTotale =
        prezzoGiornaliero * durataPrevista -
        ((prezzoGiornaliero * durataPrevista) / 100) * 22; //esclusi sconti e penali
      let iva = ((prezzoGiornaliero * durataPrevista) / 100) * 22;
      var penale = (durataEffettiva - durataPrevista) * prezzoGiornaliero;
      if (penale < 0) {
        penale = 0;
      }
      var sconto = 0;

      document.getElementById("invoiceUser").textContent = cognome + " " + nome;
      document.getElementById("invoiceIndirizzo").textContent =
        indirizzoFatturazione;
      document.getElementById("invoiceTel").textContent = telefono;
      document.getElementById("invoiceData").textContent = dataFatturazione;
      document.getElementById("invoiceOggetto").textContent = strumento;
      if (durataEffettiva < durataPrevista) {
        document.getElementById("invoiceGiorni").textContent =
          durataPrevista + " gg";
      } else {
        document.getElementById("invoiceGiorni").textContent =
          durataEffettiva + " gg";
      }
      document.getElementById("invoicePrezzoUnitario").textContent =
        prezzoGiornaliero + "€";
      document.getElementById("invoicePrezzoTotale").textContent =
        subTotale + iva + "€";
      document.getElementById("invoiceSubtotale").textContent =
        subTotale.toFixed(2) + "€";

      sconto = (puntiUtilizzati / 10) * 5;
      document.getElementById("invoiceScontoFedeltà").textContent =
        sconto + "€";

      let scontoDurata = 1;
      if (durataPrevista >= 7 && durataPrevista < 30) {
        scontoDurata = 95 / 100;
        document.getElementById("invoiceScontoDurata").textContent = "5.00%";
      } else if (durataPrevista >= 30) {
        scontoDurata = 90 / 100;
        document.getElementById("invoiceScontoDurata").textContent = "10.00%";
      } else {
        scontoDurata = 1;
        document.getElementById("invoiceScontoDurata").textContent = "0.00%";
      }
      document.getElementById("invoicePenaleRitardo").textContent =
        penale + "€";
      console.log(subTotale * scontoDurata, penale, iva, sconto);

      let scontoUsurato = 0;
      let subTotaleIva = subTotale + iva;
      if (condizioni == "usurato") {
        document.getElementById("invoiceScontoUsurato").textContent = "5.00%";
        scontoUsurato = (subTotaleIva / 100) * 5;
      } else {
        document.getElementById("invoiceScontoUsurato").textContent = "0.00%";
      }
      document.getElementById("invoiceTotale").textContent =
        (subTotaleIva * scontoDurata + penale - sconto - scontoUsurato).toFixed(
          2
        ) + "€";
    },
  });

  /*
  switch (statoNoleggio) {
    case "PRENOTATO":
      break;
    case "IN CORSO":
      break;
    case "IN RITARDO":
      break;
    default:
      console.log("Stato non riconosciuto")
      break;
  }
  */
}

function login() {
  let cookie = getCookie("SessionCookie");
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  let credentials = {
    username: username,
    password: password,
    cookie: cookie,
  };
  $.ajax({
    url: "/db/login",
    type: "POST",
    data: credentials,
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
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

function logout() {
  let cookie = getCookie("SessionCookie");
  console.log("sto sloggando");
  let dataLogout = { cookie: cookie };
  $.ajax({
    url: "/logout",
    type: "POST",
    data: dataLogout,
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (d) {},
  });
  console.log("ho sloggato");
  location.reload();
  console.log("ho sloggato");
}

function notLogged() {
  document.getElementById("alertContent").textContent =
    "Fare il login per accedere a questa funzionalità";
  $("#alertModal").modal("show");
}

function notManager() {
  document.getElementById("alertContent").textContent =
    "Per accedere a questa funzionalità è necessario essere manager";
  $("#alertModal").modal("show");
}

function filtersCataLOG(e) {
  if (e.classList.contains("brand")) {
    filters["marca"] = e.innerText.toLowerCase();
    document.getElementById("brandFilter").textContent =
      e.innerText.capitalize();
  } else if (e.classList.contains("category")) {
    filters["categoria"] = e.innerText.toLowerCase();
    document.getElementById("categoryFilter").textContent =
      e.innerText.capitalize();
  }

  $.ajax({
    url: "/db/filtersCataLOG",
    type: "POST",
    data: { filters, filterValues },
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    success: function (d) {
      cards(d);
    },
  });
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

/* <div class="card" style="width: 18rem;">
                                    <img id="card-image" src="/media/lespaul1.jpg" class="card-img-top" alt="...">
                                    <div class="card-body">
                                          <h5 class="card-title">Oggetto</h5>
                                          <p class="card-text">Descrizione oggetto</p>
                                    </div>
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item">`+ modello +`</li>
                                        <li class="list-group-item">`+ marca +`</li>
                                        <li class="list-group-item">`+ anno +`</li>
                                        <li class="list-group-item">`+ prezzo +`</li>
                                    </ul>
                                    </div> */

/*{ <div class="card-body">
                                    <h5 class="card-title">Card title</h5>
                                    <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                                </div> }*/
