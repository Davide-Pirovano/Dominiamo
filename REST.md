# Progetto Sistemi Distribuiti 2023-2024 - API REST

Documentazione dell'API REST progettata.

**Attenzione**: l'unica rappresentazione ammessa è in formato JSON. Pertanto vengono assunti gli header `Content-Type: application/json` e `Accept: application/json`.

## `/domini?email={email}`

* ### GET

    - **Descrizione**: Questa API REST è progettata per recuperare domini associati a un indirizzo email specificato.
    
    - **Parametri**: `email`: Questo parametro della query è utilizzato per specificare l'indirizzo email per il quale si desiderano ottenere i domini.

    - **Header**: solo gli header importanti. In questo caso nessuno oltre a quelli già impostati automaticamente dal client. Si può evitare di specificare gli header riguardanti la rappresentazione dei dati (JSON).
    
    - **Body richiesta**: none

    - **Risposta**: viene restituita una lista JSON di tutti i domini registrati relativi all'email, nel formato

          [
              {
                "cvv": "123",
                "cognome": "Cognome",
                "idPrenotazione": "1",
                "dominio": "test.it",
                "durata": "1",
                "nome": "Nome",
                "dataScadenza": "25/06/2025",
                "nomeCognomeIntestatario": "Nome Cognome",
                "dataPrenotazione": "25/06/2024",
                "numeroCarta": "1234 1234 1234 1234",
                "scadenzaCarta": "12/33",
                "email": "email@gmail.com",
                "status": "attivo"
              },
              ...
          ]

    - **Codici di stato restituiti**:
      * `200 OK`


## `/domini`

* ### POST

    - **Descrizione**: Questa API REST è progettata per creare una nuova prenotazione di un dominio.
    
    - **Parametri**: none

    - **Header**: solo gli header importanti. In questo caso nessuno oltre a quelli già impostati automaticamente dal client. Si può evitare di specificare gli header riguardanti la rappresentazione dei dati (JSON).
    
    - **Body richiesta**:
            {
                "dominio":"test.it",
                "durata":"1",
                "nome":"Nome",
                "cognome":"Cognome",
                "email":"email@gmail.com",
                "dataPrenotazione":"25/06/2024",
                "dataScadenza":"25/06/2025",
                "cvv":"123",
                "numeroCarta":"1234 1234 1234 1234",
                "scadenzaCarta":"11/26",
                "nomeCognomeIntestatario":"Nome Cognome",
                "prezzo":"63"
            }

    - **Risposta**: La risposta conterrà l'oggetto prenotazione in formato JSON insieme all'URI della nuova prenotazione.
                    {
                        "cvv": "123",
                        "cognome": "Cognome",
                        "idPrenotazione": "1",
                        "dominio": "test.it",
                        "durata": "1",
                        "nome": "Nome",
                        "dataScadenza": "25/06/2025",
                        "nomeCognomeIntestatario": "Nome Cognome",
                        "dataPrenotazione": "25/06/2024",
                        "numeroCarta": "1234 1234 1234 1234",
                        "scadenzaCarta": "11/26",
                        "email": "email@gmail.com",
                        "status": "attivo",
                        "prezzo":"63"
                    }


    - **Codici di stato restituiti**:
      * `201 Created`,
      * `400 Bad Request`: c'è un errore del client, il formato JSON errato, c'è un campo errato o mancante
      * `404 Not Found`: utilizzato per gestire specificamente le eccezioni JsonbException e URISyntaxException, come errori di parsing del JSON o URI malformati
      * `409 Conflict`: si è verificata un'eccezione lato database


## `/domini/{idPrenotazione}`

* ### GET

    - **Descrizione**: Questa API REST è progettata per ottenere i dati relativi ad una specifica prenotazione.
    
    - **Parametri**: `idPrenotazione`: Questo parametro del percorso è utilizzato per specificare la prenotazione per la quale si desiderano ottenere i dati.

    - **Header**: solo gli header importanti. In questo caso nessuno oltre a quelli già impostati automaticamente dal client. Si può evitare di specificare gli header riguardanti la rappresentazione dei dati (JSON).
    
    - **Body richiesta**: none

    - **Risposta**: viene restituito un oggetto JSON della prenotazione specificata, nel formato
          {
            "cvv": "123",
            "cognome": "Cognome",
            "idPrenotazione": "1",
            "dominio": "test.it",
            "durata": "1",
            "nome": "Nome",
            "dataScadenza": "25/06/2025",
            "nomeCognomeIntestatario": "Nome Cognome",
            "dataPrenotazione": "25/06/2024",
            "numeroCarta": "1234 1234 1234 1234",
            "scadenzaCarta": "12/33",
            "email": "email@gmail.com",
            "status": "attivo"
          }


    - **Codici di stato restituiti**:
      * `200 OK`,
      * `404 Not Found`: utilizzato per gestire specificamente le eccezioni JsonbException e URISyntaxException, come errori di parsing del JSON o URI malformati

* ### PUT

    - **Descrizione**: Questa API REST è progettata per aggiornare una prenotazione passando i dettagli della prenotazione
    
    - **Parametri**: `idPrenotazione`: Questo parametro del percorso rappresenta l'identificativo univoco della prenotazione da aggiornare

    - **Header**: solo gli header importanti. In questo caso nessuno oltre a quelli già impostati automaticamente dal client. Si può evitare di specificare gli header riguardanti la rappresentazione dei dati (JSON).
    
    - **Body richiesta**: viene passato un oggetto JSON con i dettagli della prenotazione
            {
                "durata":3,
                "dataScadenza":"25/06/2027",
                "status":"attivo",
                "prezzo":"88"
            }

    - **Risposta**: La risposta conterrà conterrà l'oggetto prenotazione aggiornato in formato JSON.
            {
                dataScadenza: '25/06/2027',
                durata: 3,
                idPrenotazione: 2,
                prezzo: '88',
                status: 'attivo
            }


    - **Codici di stato restituiti**:
      * `200 OK`,
      * `400 Bad Request`: c'è un errore del client, il formato JSON errato, c'è un campo errato o mancante
      * `404 Not Found`: utilizzato per gestire specificamente le eccezioni JsonbException e URISyntaxException, come errori di parsing del JSON o URI malformati
      * `409 Conflict`: si è verificata un'eccezione lato database




## `/domini/check`

* ### GET

    - **Descrizione**: Questa API REST è progettata per controllare la disponibilità di un dominio
    
    - **Parametri**: `dominio`: Questo parametro del percorso è utilizzato per specificare il dominio di cui si vuole verificare la disponibilità e la prenotazione concorrente.

    - **Header**: solo gli header importanti. In questo caso nessuno oltre a quelli già impostati automaticamente dal client. Si può evitare di specificare gli header riguardanti la rappresentazione dei dati (JSON).
    
    - **Body richiesta**: none

    - **Risposta**:
        - Se l'oggetto non sta venendo prenotato contemporaneamente da un'altro utente ed è libero, viene restituito un oggetto JSON nel formato:
                {
                    "available": true,
                    "email": "null"
                }
        - Se l'oggetto sta venendo prenotato contemporaneamente da un'altro utente ed è libero, viene restituito un oggetto JSON nel formato:
                {
                    "available": true,
                    "email": "email"
                }
        - Se l'oggetto non sta venendo prenotato contemporaneamente da un'altro utente ed è prenotato, viene restituito un oggetto JSON nel formato:
                {
                    "available": false,
                    "nome": "Nome",
                    "cognome": "Cognome",
                    "dataScadenza": "25/06/2024",
                    "email": "Email"
                }


    - **Codici di stato restituiti**:
      * `200 OK`


## `/domini/reserved`

* ### POST

    - **Descrizione**: Questa API REST è progettata per riservare una prenotazione nei confronti di altre richieste di prenotazione concorrenti.
    
    - **Parametri**: none

    - **Header**: solo gli header importanti. In questo caso nessuno oltre a quelli già impostati automaticamente dal client. Si può evitare di specificare gli header riguardanti la rappresentazione dei dati (JSON).
    
    - **Body richiesta**: {
                            "dominio": "test.it",
                            "email": "Email"
                            }

    - **Risposta**: viene restituito "OK" tramite codice di stato per dare conferma dell'inserimento del dominio nella lista delle prenotazioni concorrenti

    - **Codici di stato restituiti**:
      * `200 OK`

* ### DELETE

    - **Descrizione**: Questa API REST è progettata per rimuovere una prenotazione dalla lista di prenotazioni concorrenti quando si annulla o si effettua la prenotazione del dominio.
    
    - **Parametri**: none

    - **Header**: solo gli header importanti. In questo caso nessuno oltre a quelli già impostati automaticamente dal client. Si può evitare di specificare gli header riguardanti la rappresentazione dei dati (JSON).
    
    - **Body richiesta**: { "dominio": "test.it" }

    - **Risposta**: viene restituito "OK" tramite codice di stato per dare conferma della cancellazione del dominio nella lista delle prenotazioni concorrenti

    - **Codici di stato restituiti**:
      * `200 OK`

## `/domini/orders`

* ### GET

    - **Descrizione**: Questa API REST è progettata per recuperare ordini associati a un indirizzo email specificato.
    
    - **Parametri**: `email`: Questo parametro della query è utilizzato per specificare l'indirizzo email per il quale si desiderano ottenere i domini.

    - **Header**: solo gli header importanti. In questo caso nessuno oltre a quelli già impostati automaticamente dal client. Si può evitare di specificare gli header riguardanti la rappresentazione dei dati (JSON).
    
    - **Body richiesta**: none

    - **Risposta**: viene restituita una lista JSON di tutti i domini registrati relativi all'email, nel formato
        [
            {
                dataOrdine: "25/06/2024",
                dominio: "test.it",
                email: "email@gmail.com",
                idOrdine: 8,
                oggetto: "Operazione",
                prezzo: "46"
            },
            ...
        ]

    - **Codici di stato restituiti**:
      * `200 OK`
      * `404 Not Found`: si è verificata un'eccezione lato database