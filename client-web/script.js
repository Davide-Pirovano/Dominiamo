const API_URI = "http://localhost:8080/domini";

window.onload = init();

// Variabile globale per memorizzare l'ID della prenotazione corrente
var currentIdPrenotazione = null;
var currentCheckedDomain = null;
var timeoutNotifica;
var notifica = document.getElementById('notifica');

async function init() {
    // Controllo se i cookie sono presenti altrimenti l'utente deve registrarsi
    var cookie = getCookie();

    initializeRinnovoPopup();   // inizializzo il popUp rinnovo
    initializeDetailStatePopup();    // inizializzo il popUp dettagli

    if (!cookie) {
        registerUserDOM();
    } else {
        loadInterfaceDOM();
    }

}

function initializeDetailStatePopup() {
    document.getElementById('info-occupato').addEventListener('click', async function () {
        document.getElementById('detailStatePopup').style.display = 'block';
        // Disattivo tutto il resto della pagina tranne il popUp dettagli
        document.getElementById('container').style.opacity = 0.5;
        document.getElementById('container').style.pointerEvents = 'none';

        // eseguo richiesta dettaglia sul dominio
        try {
            const response = await fetch(`${API_URI}/check?dominio=${currentCheckedDomain}`);
            const jsonResponse = await response.json();
            document.getElementById('detailStatePopupContentP').textContent = 'Il dominio' + currentCheckedDomain + ' è occupato da:';
            document.getElementById('nome-detailStatePopupContentP').textContent = 'Nome: ' + jsonResponse.nome;
            document.getElementById('cognome-detailStatePopupContentP').textContent = 'Cognome: ' + jsonResponse.cognome;
            document.getElementById('email-detailStatePopupContentP').textContent = 'Email: ' + jsonResponse.email;
            document.getElementById('dataScadenza-detailStatePopupContentP').textContent = 'Data di scadenza: ' + jsonResponse.dataScadenza;

        }
        catch (error) {
            console.error('Error checking domain availability:', error);
        }
    }
    );
}

function getCookie() {
    const cookie = document.cookie;
    const cookieArray = cookie.split(";").map(c => c.trim());
    const email = cookieArray.find(c => c.startsWith("email="));
    const nome = cookieArray.find(c => c.startsWith("nome="));
    const cognome = cookieArray.find(c => c.startsWith("cognome="));

    if (email && nome && cognome) {
        return {
            email: email.split("=")[1],
            nome: nome.split("=")[1],
            cognome: cognome.split("=")[1]
        };
    } else {
        return null;
    }
}

async function registerUser(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const jsonData = JSON.stringify(data);

    // set cookie considerando il campo email univoco
    document.cookie = `email = ${data.email} `;
    document.cookie = `nome = ${data.nome} `;
    document.cookie = `cognome = ${data.cognome} `;

    // rimuovo form registrazione
    const registerForm = document.getElementById("register-form-wrapper");
    registerForm.style.display = "none";
    loadInterfaceDOM();
}

async function registerUserDOM() {
    // aggiorno la pagina con il form di registrazione
    const registerForm = document.getElementById("register-form-wrapper");
    registerForm.style.display = "block";
}

function loadInterfaceDOM() {
    const createDomainForm = document.getElementById("container");
    createDomainForm.style.display = "block";

    const cookie = getCookie();

    const nome = document.getElementById("name-create-domain");
    nome.value = cookie.nome;

    const cognome = document.getElementById("surname-create-domain");
    cognome.value = cookie.cognome;

    const email = document.getElementById("email-create-domain");
    email.value = cookie.email;
}

async function handleCreateDomain() {
    const form = document.getElementById("create-domain-form");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // svuoto i campi del form
    form.reset();
    // ripongo le informazioni dei cookie nel form
    const cookie = getCookie();
    const nome = document.getElementById("name-create-domain");
    nome.value = cookie.nome;

    const cognome = document.getElementById("surname-create-domain");
    cognome.value = cookie.cognome;

    const email = document.getElementById("email-create-domain");
    email.value = cookie.email;

    // mostro sucessPopup
    const successPopup = document.getElementById("successPopup");
    successPopup.style.display = "block";

    // disattivo tutto il resto della pagina tranne il popUp success
    document.getElementById('container').style.opacity = 0.5;
    document.getElementById('container').style.pointerEvents = 'none';

    // aggingo a jsonData la dataOdierna per il controllo della durata e il giorno di scadenza calcolato
    const dataPrenotazione = new Date();
    const dataScadenza = new Date(dataPrenotazione);

    // calcolo la durata in anni
    dataScadenza.setFullYear(dataScadenza.getFullYear() + parseInt(data.durata));
    data.dataPrenotazione = dataPrenotazione.toLocaleDateString();
    data.dataScadenza = dataScadenza.toLocaleDateString();

    //aggiungo a jsonData i dati del pagamento
    data.cvv = document.getElementById('cvv-create-domain').value;
    data.numeroCarta = document.getElementById('creditCardNumber-create-domain').value;
    data.scadenzaCarta = document.getElementById('expirationDate-create-domain').value;
    data.nomeCognomeIntestatario = document.getElementById('cardHolderName-create-domain').value;

    //resetto il form
    document.getElementById('payment-form').reset();

    const jsonData = JSON.stringify(data);

    const response = await fetch(API_URI, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: jsonData
    });

    const jsonResponse = await response.json();


    const statusView = document.getElementById('disp-dominio');
    statusView.textContent = 'verifica disponibilità...';
    statusView.style.color = '#424649';
    document.getElementById('info-occupato').style.display = 'none';

}

async function loadYourDomains() {
    // ottengo email dai cookie
    const cookie = getCookie();
    const email = cookie.email;

    // chiamata get per ottenere i domini registrati dall'utente
    const response = await fetch(`${API_URI}?email=${email}`);
    const jsonResponse = await response.json();

    // aggiorno la tabella con i domini

    // Ottiene il tbody della tabella
    const tbody = document.getElementById('your-domain-tbody');

    // Pulisce la tabella
    tbody.innerHTML = '';

    // Genera le righe della tabella ed aggiungi solo gli elementi che ci interessano

    // controllo se ho domini registrati
    if (jsonResponse.length === 0) {    // nessun dominio registrato
        const row = document.createElement('tr');
        const cell = document.createElement('td');  //aggiungo colspan di 5
        cell.setAttribute('colspan', '5');
        cell.textContent = 'Nessun dominio registrato';
        row.appendChild(cell);
        tbody.appendChild(row);

    } else { // ho domini registrati
        jsonResponse.forEach(item => {  // interpreto la risposta

            const headers = ['dominio', 'durata', 'dataPrenotazione', 'dataScadenza', 'stato']; // headers tabella

            const row = document.createElement('tr'); // creo riga tabella

            // Crea un array di celle td vuote per popolare la riga creata
            const cells = headers.map(() => document.createElement('td'));

            Object.keys(item).forEach(key => {  // per ogni chiave dell'oggetto in questione

                if (key === 'dominio' || key === 'durata' || key === 'dataPrenotazione' || key === 'dataScadenza' || key === 'stato') { // seleziono le chiavi che mi interessano

                    const cellIndex = headers.indexOf(key); // seleziono l'indice della cella corrispondente alla chiave
                    const cell = cells[cellIndex];  // seleziono la cella corrispondente alla chiave

                    if (key === 'durata') { // se la chiave è durata concateno "anno" o "anni"
                        if (item[key] === '1') {
                            cell.textContent = item[key] + ' anno';
                        }
                        else {
                            cell.textContent = item[key] + ' anni';
                        }
                    } else if (key === 'dataScadenza') { // se status è "scaduto" al posto bottone rinnova scrivo "scaduto"

                        const dataScadenza = new Date(item[key]);
                        const dataOdierna = new Date();
                        processaDataScadenza(item, dataScadenza, dataOdierna, cell, cells, headers);
                        cell.textContent = item[key];

                    } else {    // altrimenti scrivo il valore della chiave
                        cell.textContent = item[key];
                    }
                }
            });

            // Appendi tutte le celle alla riga
            cells.forEach(cell => row.appendChild(cell));

            tbody.appendChild(row);
        });
    }


}

function initializeRinnovoPopup() {
    document.getElementById('rinnovoPopupYesButton').addEventListener('click', async function () {
        // Chiudo popUp
        document.getElementById('rinnovoPopup').style.display = 'none';
        // Ripristino attività container
        document.getElementById('container').style.opacity = 1;
        document.getElementById('container').style.pointerEvents = 'auto';

        const durata = document.getElementById("durata-rinnovo-dominio").value;

        // ottengo la durata precedente
        const response = await fetch(`${API_URI}/${currentIdPrenotazione}`);
        const jsonResponse = await response.json();
        const durataPrecedente = jsonResponse["durata"];
        const stato = jsonResponse["status"];

        if (stato === 'rinnovare') {
            rinnovaDominio(durata, currentIdPrenotazione);
        } else if (stato === "attivo") {
            // calcolo durata totale
            const durataTotale = parseInt(durata) + parseInt(durataPrecedente);
            prolungaDominio(durataTotale, jsonResponse["dataPrenotazione"], currentIdPrenotazione);
        }
        document.getElementById("durata-rinnovo-dominio").value = 1;
    });

    document.getElementById('rinnovoPopupNoButton').addEventListener('click', function () {
        // Chiudo popUp
        document.getElementById('rinnovoPopup').style.display = 'none';
        // Ripristino attività container
        document.getElementById('container').style.opacity = 1;
        document.getElementById('container').style.pointerEvents = 'auto';
    });
}

function openRinnovoPopup(item) {
    currentIdPrenotazione = item["idPrenotazione"];
    const durataPrecedente = item["durata"];

    // Mostro popUp
    const rinnovaPopup = document.getElementById("rinnovoPopup");
    rinnovaPopup.style.display = "block";

    // Disattivo tutto il resto della pagina tranne il popUp rinnovo
    document.getElementById('container').style.opacity = 0.5;
    document.getElementById('container').style.pointerEvents = 'none';

    const select = document.getElementById('durata-rinnovo-dominio');
    select.innerHTML = '';

    // h2
    if (item["status"] === 'rinnovare') {
        document.getElementById('h2-rinnovo-popup').textContent = 'Vuoi rinnovare ' + item["dominio"] + '?';
        // Select
        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i === 1 ? i + ' anno' : i + ' anni';
            select.appendChild(option);
        }
    } else if (item["status"] === 'attivo') {
        document.getElementById('h2-rinnovo-popup').textContent = 'Vuoi prolungare la durata di ' + item["dominio"] + '?';
        // Select
        for (let i = 1; i <= 10 - durataPrecedente; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i === 1 ? i + ' anno' : i + ' anni';
            select.appendChild(option);
        }
    }


}

function processaDataScadenza(item, dataScadenza, dataOdierna, cell, cells, headers) {
    const actionCell = document.createElement('td');

    if (item["status"] === 'scaduto') {
        cell.classList.add('scaduto'); // Aggiunge una classe per il colore rosso alla dataScadenza
        const actionCell = document.createElement('td');
        actionCell.textContent = 'Scaduto';
        actionCell.classList.add('scaduto'); // Aggiunge una classe per il colore rosso allo stato
        cells[headers.indexOf('stato')] = actionCell;

    } else if (item["status"] === 'rinnovare') {

        cell.classList.add('rinnovare'); // Aggiunge una classe per il colore rosso
        const button = document.createElement('button');
        button.textContent = 'Rinnova';
        button.classList.add('btn-rinnova');

        button.addEventListener('click', function () {
            openRinnovoPopup(item);
        });

        const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#ffffff" d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z" /></svg>';
        button.innerHTML = button.textContent + svg;

        actionCell.appendChild(button);
        cells[headers.indexOf('stato')] = actionCell;

    } else if (item["status"] === 'attivo') {
        const durata = item["durata"];

        if (durata === "10") {
            actionCell.textContent = 'Attivo';
        } else {
            const button = document.createElement('button');
            button.textContent = 'Attivo';
            const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#ffffff" d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z" /></svg>';
            button.innerHTML = button.textContent + svg;
            button.classList.add('btn-attivo');

            button.addEventListener('click', function () {
                openRinnovoPopup(item);
            });

            actionCell.appendChild(button);
        }

        cells[headers.indexOf('stato')] = actionCell;
    }
}

function parseDate(input) {
    // Split the input string by '/'
    const parts = input.split('/');
    // Rearrange the parts into 'yyyy-mm-dd' format
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    return new Date(formattedDate);
}

async function prolungaDominio(durata, dataPrenotazione, idPrenotazione) {
    dataPrenotazione = parseDate(dataPrenotazione);
    const dataScadenza = new Date(dataPrenotazione);
    // calcolo la durata in anni 
    dataScadenza.setFullYear(dataScadenza.getFullYear() + parseInt(durata));
    const jsonData = JSON.stringify({ durata: durata, dataScadenza: dataScadenza.toLocaleDateString(), status: 'attivo' });
    // console.log(jsonData + idPrenotazione);
    const response = await fetch(`${API_URI}/${idPrenotazione}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: jsonData
    });
    const jsonResponse = await response.json();

    loadYourDomains();
}

async function rinnovaDominio(durata, idPrenotazione) {

    // aggingo a jsonData i dati per aggiornare la data di scadenza    
    const dataPrenotazione = new Date();
    const dataScadenza = new Date(dataPrenotazione);
    // calcolo la durata in anni 
    dataScadenza.setFullYear(dataScadenza.getFullYear() + parseInt(durata));
    const jsonData = JSON.stringify({ durata: durata, dataPrenotazione: dataPrenotazione.toLocaleDateString(), dataScadenza: dataScadenza.toLocaleDateString(), status: 'attivo' });

    // console.log(jsonData + idPrenotazione);

    const response = await fetch(`${API_URI}/${idPrenotazione}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: jsonData
    });
    const jsonResponse = await response.json();

    loadYourDomains();
}

async function annullaRinnovo(idPrenotazione) {
    const response = await fetch(`${API_URI}/${idPrenotazione}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: 'scaduto' })
    });
    loadYourDomains();
}

document.getElementById("register-form-wrapper").addEventListener("submit", registerUser);

document.getElementById("cancel-create-domain").addEventListener("click", function (event) {
    event.preventDefault();

    document.getElementById("create-domain-form").reset();

    // reimposto i valori dei cookie nel form
    const cookie = getCookie();
    const nome = document.getElementById("name-create-domain");
    nome.value = cookie.nome;

    const cognome = document.getElementById("surname-create-domain");
    cognome.value = cookie.cognome;

    const email = document.getElementById("email-create-domain");
    email.value = cookie.email;

    const statusView = document.getElementById('disp-dominio');
    statusView.textContent = 'verifica disponibilità...';
    statusView.style.color = '#424649';
    document.getElementById('info-occupato').style.display = 'none';
});

document.getElementById('create-domain-switch').addEventListener('click', function () {
    document.getElementById('create-domain-wrapper').style.display = 'block';
    document.getElementById('your-domains-wrapper').style.display = 'none';
    document.getElementById('create-domain-switch').classList.add('active');
    document.getElementById('your-domains-switch').classList.remove('active');
});

document.getElementById('your-domains-switch').addEventListener('click', function () {
    document.getElementById('create-domain-wrapper').style.display = 'none';
    document.getElementById('your-domains-wrapper').style.display = 'block';
    document.getElementById('create-domain-switch').classList.remove('active');
    document.getElementById('your-domains-switch').classList.add('active');
    loadYourDomains();
});

document.getElementById('logout-button').addEventListener('click', function () {
    document.cookie = 'email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'nome=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'cognome=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.reload();
});

document.getElementById('successPopup').addEventListener('click', function () {
    document.getElementById('successPopup').style.display = 'none';
    // ripristino attività container
    document.getElementById('container').style.opacity = 1;
    document.getElementById('container').style.pointerEvents = 'auto';
});

document.addEventListener('DOMContentLoaded', (event) => {
    const dominioInput = document.getElementById('domain-create-domain');
    const statusView = document.getElementById('disp-dominio');

    function debounce(func, delay) {    // funzione per evitare chiamate multiple, aspetta delay ms prima di chiamare la funzione
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    const checkDomainAvailability = async function () {
        const dominio = dominioInput.value;

        if (dominio.length === 0) {
            statusView.textContent = 'verifica disponibilità...';
            statusView.style.color = '#424649';
            document.getElementById('info-occupato').style.display = 'none';
        } else {
            try {
                const response = await fetch(`${API_URI}/check?dominio=${dominio}`);
                const jsonResponse = await response.json();

                if (jsonResponse.available === true && jsonResponse.email === "null") {
                    statusView.textContent = 'Disponibile';
                    statusView.style.color = '#247e54';
                    document.getElementById('info-occupato').style.display = 'none';
                } else if (jsonResponse.available === true && jsonResponse.email !== "null") {
                    statusView.textContent = 'Bloccato da ' + jsonResponse.email;
                    statusView.style.color = '#ff9770';
                    document.getElementById('info-occupato').style.display = 'none';
                } else {
                    document.getElementById('info-occupato').style.display = 'flex';
                    currentCheckedDomain = dominio;
                    const userEmail = getCookie().email;
                    if (jsonResponse.email === userEmail) {
                        statusView.textContent = 'Già in possesso';
                        statusView.style.color = '#f33f3f';
                    } else {
                        statusView.textContent = 'Non disponibile, occupato da: ' + jsonResponse.email;
                        statusView.style.color = '#f33f3f';
                    }
                }
            } catch (error) {
                statusView.textContent = 'Errore nella verifica della disponibilità';
                statusView.style.color = '#f33f3f';
                console.error('Error checking domain availability:', error);
            }
        }
    };

    dominioInput.addEventListener('input', debounce(checkDomainAvailability, 500));
});

document.getElementById('cancelPayment').addEventListener('click', function () {
    //resetto il form
    document.getElementById('payment-form').reset();
    // faccio una delete a /reserved
    fetch(`${API_URI}/reserved`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ dominio: document.getElementById('domain-create-domain').value })
    });

    document.getElementById('paymentPopup').style.display = 'none';
    document.getElementById('container').style.opacity = 1;
    document.getElementById('container').style.pointerEvents = 'auto';
});

document.getElementById('submit-create-domain').addEventListener('click', async function (event) {

    event.preventDefault();

    // controllo che i campi inserti siano validi
    const dominio = document.getElementById('domain-create-domain').value;
    const durata = document.getElementById('duration-create-domain').value;
    const nome = document.getElementById('name-create-domain').value;
    const cognome = document.getElementById('surname-create-domain').value;
    const email = document.getElementById('email-create-domain').value;
    // controllo che l'email sia valida ovvero che contenga una chiocciola
    const emailValid = email.includes('@');



    if (dominio != '' && durata != '' && nome != '' && cognome != '' && email != '' && emailValid) {
        // controllo che il dominio sia disponibile
        const response = await fetch(`${API_URI}/check?dominio=${dominio}`);
        const jsonResponse = await response.json();

        if (jsonResponse.available == true && jsonResponse.email === "null") {
            // invio post al server
            const response = await fetch(`${API_URI}/reserved`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ dominio: dominio, email: email })
            });

            //genero prezzo random
            document.getElementById('payment-value').textContent = "Totale: " + Math.floor(Math.random() * 100) + "€";

            // mostro popUp pagamento
            document.getElementById('paymentPopup').style.display = 'block';
            document.getElementById('container').style.opacity = 0.5;
            document.getElementById('container').style.pointerEvents = 'none';
        } else if (jsonResponse.available == true && jsonResponse.email !== "null") {
            document.getElementById('notifica-p').textContent = 'Dominio bloccato da un altro utente';
            notifica.classList.add('show');
            notificaClass = true;
            timeoutNotifica = setTimeout(function () {
                notifica.classList.remove('show');
            }, 3000);
            const statusView = document.getElementById('disp-dominio');
            statusView.textContent = 'Bloccato da ' + jsonResponse.email;
            statusView.style.color = '#ff9770';
        } else {
            document.getElementById('notifica-p').textContent = 'Dominio già in possesso';
            notifica.classList.add('show');
            notificaClass = true;
            timeoutNotifica = setTimeout(function () {
                notifica.classList.remove('show');
            }, 3000);
        }
    } else {
        document.getElementById('notifica-p').textContent = 'Compila tutti i campi correttamente';
        notifica.classList.add('show');
        notificaClass = true;
        timeoutNotifica = setTimeout(function () {
            notifica.classList.remove('show');
        }, 3000);
    }
});

document.getElementById('notifica-X').addEventListener('click', function () {
    notifica.classList.remove('show');
    // Cancella il timeout se è stato impostato
    if (typeof timeoutNotifica !== 'undefined') {
        clearTimeout(timeoutNotifica);
    }
});

document.getElementById('submit-payment').addEventListener('click', function (event) {
    event.preventDefault();
    // controllo che i campi non siano vuoti
    const cvv = document.getElementById('cvv-create-domain').value;
    const creditCardNumber = document.getElementById('creditCardNumber-create-domain').value;
    const expirationDate = document.getElementById('expirationDate-create-domain').value;
    const cardHolderName = document.getElementById('cardHolderName-create-domain').value;

    if (cvv === '' || creditCardNumber === '' || expirationDate === '' || cardHolderName === '') {
        document.getElementById('notifica-p').textContent = 'Compila tutti i campi correttamente';
        notifica.classList.add('show');
        notificaClass = true;
        timeoutNotifica = setTimeout(function () {
            notifica.classList.remove('show');
        }, 3000);
    } else {

        // faccio una delete a /reserved
        fetch(`${API_URI}/reserved`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ dominio: document.getElementById('domain-create-domain').value })
        });

        document.getElementById('paymentPopup').style.display = 'none';
        document.getElementById('container').style.opacity = 1;
        document.getElementById('container').style.pointerEvents = 'auto';
        handleCreateDomain();
    }
});

document.getElementById('detailStatePopupCloseButton').addEventListener('click', function () {
    document.getElementById('detailStatePopup').style.display = 'none';
    document.getElementById('container').style.opacity = 1;
    document.getElementById('container').style.pointerEvents = 'auto';
});