# Progetto Sistemi Distribuiti 2023-2024 - API REST

Documentazione dell'API REST progettata.

**Attenzione**: l'unica rappresentazione ammessa è in formato JSON.

## `/domini`

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

* ### POST

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