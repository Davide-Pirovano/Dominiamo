const API_URI = "http://localhost:8080/domini";

window.onload = init();

async function init() {
    // Controllo se i cookie sono presenti altrimenti l'utente deve registrarsi
    var cookie = getCookie();
    if (!cookie) {
        registerUserDOM();
    } else {
        loadInterfaceDOM();
    }

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
    document.cookie = `email=${data.email}`;
    document.cookie = `nome=${data.nome}`;
    document.cookie = `cognome=${data.cognome}`;

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

async function handleCreateDomain(event) {
    event.preventDefault();
    const form = event.target;
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
    const jsonData = JSON.stringify(data);

    const response = await fetch(API_URI, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: jsonData
    });

    const jsonResponse = await response.json();

}

async function loadYourDomains() {
    const cookie = getCookie();
    const email = cookie.email;

    const response = await fetch(`${API_URI}?email=${email}`);
    const jsonResponse = await response.json();
    // aggiorno la tabella con i domini
    const tbody = document.getElementById('your-domain-tbody');

    // Pulisce la tabella
    tbody.innerHTML = '';

    // console.log(jsonResponse);
    // Genera le righe della tabella ed aggiungi solo gli elementi che ci interessano

    // controllo se ho domini registrati
    if (jsonResponse.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');  //aggiungo colspan di 5
        cell.setAttribute('colspan', '5');
        cell.textContent = 'Nessun dominio registrato';
        row.appendChild(cell);
        tbody.appendChild(row);
    } else {
        jsonResponse.forEach(item => {
            const headers = ['dominio', 'durata', 'dataPrenotazione', 'dataScadenza', 'stato'];
            const row = document.createElement('tr');

            // Crea un array di celle vuote
            const cells = headers.map(() => document.createElement('td'));

            Object.keys(item).forEach(key => {
                if (key === 'dominio' || key === 'durata' || key === 'dataPrenotazione' || key === 'dataScadenza' || key === 'stato') {
                    const cellIndex = headers.indexOf(key);
                    const cell = cells[cellIndex];

                    if (key === 'durata') {
                        if (item[key] === '1') {
                            cell.textContent = item[key] + ' anno';
                        }
                        else {
                            cell.textContent = item[key] + ' anni';
                        }
                    } else {
                        cell.textContent = item[key];
                    }

                    // se status è "scaduto" al posto bottone rinnova scrivo "scaduto"

                    if (key === 'dataScadenza') {
                        const dataScadenza = new Date(item[key]);
                        const dataOdierna = new Date();

                        if (item["status"] === 'scaduto') {
                            cell.classList.add('scaduto'); // Aggiunge una classe per il colore rosso alla dataScadenza
                            const actionCell = document.createElement('td');
                            actionCell.textContent = 'Non Rinnovato';
                            actionCell.classList.add('scaduto');
                            cells[headers.indexOf('stato')] = actionCell;
                        }
                        else if (item["status"] === 'rinnovare') {
                            cell.classList.add('rinnovare'); // Aggiunge una classe per il colore rosso
                            const actionCell = document.createElement('td');
                            const button = document.createElement('button');
                            button.textContent = 'Rinnova';
                            button.classList.add('btn-rinnova');
                            // aggiungo al bottone un id con lo stesso nome del dominio e gli aggiungo un listener

                            button.id = item["idPrenotazione"];
                            button.addEventListener('click', async function (event) {
                                const idPrenotazione = event.target.id;
                                // mostro popUp
                                const rinnovaPopup = document.getElementById("rinnovoPopup");
                                rinnovaPopup.style.display = "block";
                                // disattivo tutto il resto della pagina tranne il popUp rinnovo
                                document.getElementById('container').style.opacity = 0.5;
                                document.getElementById('container').style.pointerEvents = 'none';

                                // aggiungo listener al bottone di conferma e gli passo l'id del dominio per fare la put
                                document.getElementById('rinnovoPopupYesButton').addEventListener('click', async function () {
                                    // chiudo popUp
                                    document.getElementById('rinnovoPopup').style.display = 'none';
                                    // ripristino attività container
                                    document.getElementById('container').style.opacity = 1;
                                    document.getElementById('container').style.pointerEvents = 'auto';

                                    const durata = document.getElementById("durata-rinnovo-dominio").value;

                                    rinnovaDominio(durata, idPrenotazione);
                                    document.getElementById("durata-rinnovo-dominio").value = 1;
                                });

                                // aggiungo listener al bottone di annulla
                                document.getElementById('rinnovoPopupNoButton').addEventListener('click', function () {
                                    // chiudo popUp
                                    document.getElementById('rinnovoPopup').style.display = 'none';
                                    // ripristino attività container
                                    document.getElementById('container').style.opacity = 1;
                                    document.getElementById('container').style.pointerEvents = 'auto';

                                    annullaRinnovo(idPrenotazione);
                                });
                            });
                            const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#ffffff" d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z" /></svg>';
                            button.innerHTML = button.textContent + svg;
                            actionCell.appendChild(button);
                            cells[headers.indexOf('stato')] = actionCell;
                            
                        } else if (item["status"] === 'attivo') {
                            // creo bottone per prolungare il dominio
                            const actionCell = document.createElement('td');
                            const durata = item["durata"];

                            if (item["durata"] === "10") {
                                // se la durata è 10 anni non posso prolungare metto label "attivo"
                                actionCell.textContent = 'Attivo';
                            } else {
                                const button = document.createElement('button');
                                button.textContent = 'Attivo';
                                const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#ffffff" d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z" /></svg>';
                                button.innerHTML = button.textContent + svg;
                                // concateno al button text l'svg

                                button.classList.add('btn-attivo');
                                // aggiungo al bottone un id con lo stesso nome del dominio e gli aggiungo un listener
                                button.id = item["idPrenotazione"];
                                button.addEventListener('click', async function (event) {
                                    const idPrenotazione = event.target.id;
                                    const durataPrecedente = item["durata"];
                                    const dataPrenotazione = item["dataPrenotazione"];
                                    // mostro popUp
                                    const rinnovaPopup = document.getElementById("prolungaDurataPopup");
                                    rinnovaPopup.style.display = "block";
                                    // disattivo tutto il resto della pagina tranne il popUp
                                    document.getElementById('container').style.opacity = 0.5;
                                    document.getElementById('container').style.pointerEvents = 'none';
                                    // inserisco le option nel selettore
                                    const select = document.getElementById("durata-prolunga-dominio");
                                    // rimuovo le option precedenti
                                    select.innerHTML = '';
                                    // aggiungo le option
                                    for (let i = 1; i <= 10 - durataPrecedente; i++) {
                                        const option = document.createElement('option');
                                        option.value = i;
                                        // se 1 scrivo anno altrimenti anni
                                        if (i === 1) {
                                            option.textContent = i + ' anno';
                                        } else {
                                            option.textContent = i + ' anni';
                                        }
                                        select.appendChild(option);
                                    }

                                    // aggiungo listener al bottone di conferma e gli passo l'id del dominio per fare la put
                                    document.getElementById('prolungaDurataPopupYesButton').addEventListener('click', async function () {
                                        // chiudo popUp
                                        document.getElementById('prolungaDurataPopup').style.display = 'none';
                                        // ripristino attività container
                                        document.getElementById('container').style.opacity = 1;
                                        document.getElementById('container').style.pointerEvents = 'auto';
                                        const durata = document.getElementById("durata-prolunga-dominio").value;
                                        const durataTotale = parseInt(durata) + parseInt(durataPrecedente);
                                        prolungaDominio(durataTotale, dataPrenotazione, idPrenotazione);
                                    });

                                    // aggiungo listener al bottone di annulla
                                    document.getElementById('prolungaDurataPopupNoButton').addEventListener('click', function () {
                                        // chiudo popUp
                                        document.getElementById('prolungaDurataPopup').style.display = 'none';
                                        // ripristino attività container
                                        document.getElementById('container').style.opacity = 1;
                                        document.getElementById('container').style.pointerEvents = 'auto';

                                    });
                                });
                                // aggiungo bottone alla cella
                                actionCell.appendChild(button);
                            }

                            cells[headers.indexOf('stato')] = actionCell;

                        }
                    }
                }
            });

            // Appendi tutte le celle alla riga
            cells.forEach(cell => row.appendChild(cell));

            tbody.appendChild(row);
        });
    }


}

async function prolungaDominio(durata, dataPrenotazione, idPrenotazione) {
    // console.log("durata:"+ durata);    
    // console.log("dominio:"+ dominio);   
    // aggingo a jsonData i dati per aggiornare la data di scadenza    
    const dataScadenza = new Date(dataPrenotazione);
    // calcolo la durata in anni 
    dataScadenza.setFullYear(dataScadenza.getFullYear() + parseInt(durata));
    const jsonData = JSON.stringify({ durata: durata, dataScadenza: dataScadenza.toLocaleDateString(), status: 'attivo' });
    console.log(jsonData + idPrenotazione);
    const response = await fetch(`${API_URI}/${idPrenotazione}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: jsonData
    });
    const jsonResponse = await response.json();
    //mostro sucessPopup
    const successPopup = document.getElementById("successPopup");
    successPopup.style.display = "block"; // disattivo tutto il resto della pagina tranne il popUp success    
    document.getElementById('container').style.opacity = 0.5;
    document.getElementById('container').style.pointerEvents = 'none';

    loadYourDomains();
}

async function rinnovaDominio(durata, idPrenotazione) {
    // console.log("durata:"+ durata);    
    // console.log("dominio:"+ dominio);   
    // aggingo a jsonData i dati per aggiornare la data di scadenza    
    const dataPrenotazione = new Date();
    const dataScadenza = new Date(dataPrenotazione);
    // calcolo la durata in anni 
    dataScadenza.setFullYear(dataScadenza.getFullYear() + parseInt(durata));
    const jsonData = JSON.stringify({ durata: durata, dataScadenza: dataScadenza.toLocaleDateString(), status: 'attivo' });
    console.log(jsonData + idPrenotazione);
    const response = await fetch(`${API_URI}/${idPrenotazione}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: jsonData
    });
    const jsonResponse = await response.json();
    //mostro sucessPopup
    const successPopup = document.getElementById("successPopup");
    successPopup.style.display = "block"; // disattivo tutto il resto della pagina tranne il popUp success    
    document.getElementById('container').style.opacity = 0.5;
    document.getElementById('container').style.pointerEvents = 'none';

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

const register_form = document.getElementById("register-form-wrapper");
register_form.addEventListener("submit", registerUser);

const form_create_domain = document.getElementById("create-domain-form");
form_create_domain.addEventListener("submit", handleCreateDomain);

document.getElementById("cancel-create-domain").addEventListener("click", function (event) {
    event.preventDefault();

    document.getElementById("create-domain-form").reset();

    // imposto nel form i cookie
    const cookie = getCookie();
    const nome = document.getElementById("name-create-domain");
    nome.value = cookie.nome;

    const cognome = document.getElementById("surname-create-domain");
    cognome.value = cookie.cognome;

    const email = document.getElementById("email-create-domain");
    email.value = cookie.email;
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