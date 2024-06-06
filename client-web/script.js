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
    }

    jsonResponse.forEach(item => {
        const row = document.createElement('tr');

        Object.keys(item).forEach(key => {
            // popolo la tabella secondo la seguente intestazione <th>idPrenotazione</th> <th>Dominio</th> <th>Durata</th> <th>Scadenza</th> <th>Stato</th>

            if (key === 'idPrenotazione' || key === 'dominio' || key === 'durata' || key === 'dataScadenza') {
                const cell = document.createElement('td');
                cell.textContent = item[key];
                row.appendChild(cell);
                if (key === 'dataScadenza') {
                    const dataScadenza = new Date(item[key]);
                    const dataOdierna = new Date();
                    if (dataScadenza < dataOdierna) {
                        // al posto della scritta scaduto metto un bottone con scritto scaduto
                        const cell = document.createElement('td');
                        const button = document.createElement('button');
                        button.textContent = 'Rinnova/Elimina';
                        // aggiungo classe al button
                        button.classList.add('btn-rinnova-elimina');
                        cell.appendChild(button);
                        row.appendChild(cell);
                    }
                    else {

                        const cell = document.createElement('td');
                        cell.textContent = 'Attivo';
                        row.appendChild(cell);
                    }
                }
            }
        });

        tbody.appendChild(row);
    });

}

const form = document.getElementById("register-form-wrapper");
form.addEventListener("submit", registerUser);

const form_create_domain = document.getElementById("container");
form_create_domain.addEventListener("submit", handleCreateDomain);

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

document.getElementById('your-domain-tbody').addEventListener('click', async function (event) {
    if (event.target.classList.contains('btn-rinnova-elimina')) {
        // todo
    }
});