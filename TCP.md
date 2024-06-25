# Progetto Sistemi Distribuiti 2023-2024 - TCP

Il protocollo di comunicazione tra i web server e database si basa su scambi di stringhe formattate che rappresentano vari comandi e dati. Ecco una spiegazione dettagliata del nostro protocollo esposto dal database:

### Avvio del Database
- Il database ascolta le connessioni in entrata sulla porta `3030`.
- Quando un client si connette, il server accetta la connessione e crea un nuovo thread `Handler` per gestire la comunicazione con quel client.

### Protocollo di Comunicazione
Il web server invia al database stringhe che rappresentano comandi e dati. Ogni comando è seguito dai dati necessari, separati da punti e virgola (`;`). Il database risponde con il risultato dell'operazione richiesta. La connessione viene mantenuta finché il web server non invia il comando di terminazione (`0`).

### Comandi Supportati
Ecco i comandi che il database può ricevere e come vengono gestiti:

1. **Creazione di una prenotazione**
    - **Comando**: `"1;<dati_prenotazione>"`
    - **Descrizione**: Crea una nuova prenotazione.
    - **Risposta**: Il database invia la conferma della creazione o un messaggio di errore.

2. **Visualizzazione di una prenotazione dall'ID**
    - **Comando**: `"2;<id_prenotazione>"`
    - **Descrizione**: Restituisce i dettagli della prenotazione specificata dall'ID.
    - **Risposta**: I dettagli della prenotazione o un messaggio di errore.

3. **Modifica di una prenotazione**
    - **Comando**: `"3;<dati_modificati_prenotazione>"`
    - **Descrizione**: Modifica una prenotazione esistente con i nuovi dati forniti.
    - **Risposta**: Il database invia la conferma della modifica o un messaggio di errore.

4. **Visualizzazione di tutte le prenotazioni di un utente dalla mail**
    - **Comando**: `"4;<email_utente>"`
    - **Descrizione**: Restituisce tutte le prenotazioni associate a un utente specificato dall'email.
    - **Risposta**: Una lista delle prenotazioni o un messaggio di errore.

5. **Verifica disponibilità di un dominio**
    - **Comando**: `"5;<dominio>"`
    - **Descrizione**: Verifica se un dominio è disponibile.
    - **Risposta**: La disponibilità del dominio o un messaggio di errore.

6. **Visualizzazione degli ordini**
    - **Comando**: `"6;<email_utente>"`
    - **Descrizione**: Restituisce tutti gli ordini associati a un utente specificato dall'email.
    - **Risposta**: La lista degli ordini o un messaggio di errore.

### Esempio di Comunicazione
1. **Client invia**: `1;nome_prenotazione;data;...`
    - **Server risponde**: `Prenotazione creata con successo`

2. **Client invia**: `2;123`
    - **Server risponde**: `Dettagli della prenotazione con ID 123`

3. **Client invia**: `0`
    - **Server risponde**: Chiude la connessione.

### Gestione della Connessione
- Il database legge le righe di input dal web server in un ciclo fino a che non riceve il comando `0`, che segnala la chiusura della connessione.
- I dati ricevuti vengono concatenati e processati una volta che la lettura è completa.
- La risposta viene inviata al web server attraverso la socket di output.
- Alla fine della comunicazione, gli stream di input/output e la socket del web server vengono chiusi.

Questo protocollo permette una semplice interazione tra il web server e database, dove il web server invia comandi specifici con i relativi dati e riceve risposte testuali che indicano il risultato dell'operazione.