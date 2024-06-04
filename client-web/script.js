const API_URI = "http://localhost:8080/domini";

window.onload = init();

async function init() {
    // Controllo se i cookie sono presenti altrimenti l'utente deve registrarsi
    var cookie = getCookie();
    if (!cookie) {
        registerUserDOM();
    }else{
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
    const createDomainForm = document.getElementById("create-domain-form");
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
    const jsonData = JSON.stringify(data);

    const response = await fetch(API_URI, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: jsonData
    });

    const jsonResponse = await response.json();
    console.log(jsonResponse);

}

const form = document.getElementById("register-form-wrapper");
form.addEventListener("submit", registerUser);

const form_create_domain = document.getElementById("create-domain-form");
form_create_domain.addEventListener("submit", handleCreateDomain);