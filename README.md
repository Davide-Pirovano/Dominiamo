# Progetto Sistemi Distribuiti 2023-2024

Il progetto d’esame del corso di “Sistemi Distribuiti” dell’anno 2023-2024 consiste nella progettazione e sviluppo di un’applicazione distribuita per per l’acquisto
e gestione di domini Internet.

## Componenti del gruppo

* Davide Pirovano (894632) <d.pirovano16@campus.unimib.it>
* Luca Bonfanti (894394) <l.bonfanti19@campus.unimib.it>
* Matteo Fumagalli (894468) <m.fumagalli139@campus.unimib.it>

## Compilazione ed esecuzione

Sia il server Web sia il database sono applicazioni Java gestite con Maven. All'interno delle rispettive cartelle si può trovare il file `pom.xml` in cui è presente la configurazione di Maven per il progetto. Nel `pom.xml` è specificato l'uso di Java 21.

Il server Web e il database sono dei progetti Java che utilizano Maven per gestire le dipendenze, la compilazione e l'esecuzione.

### Client Web

Per avviare il client Web è necessario utilizzare l'estensione "Live Preview" su Visual Studio Code, come mostrato durante il laboratorio. Tale estensione espone un server locale con i file contenuti nella cartella `client-web`.

**Attenzione**: è necessario configurare CORS in Google Chrome come mostrato nel laboratorio. Avendo riscontrato diversi problemi con l'estensione suggerita in laboratorio consigliamo di installare l'estensione "CROSS DOMAIN - Cors" presente sul Chrome Web Store.

**Attenzione**: è fortemente consigliato l'utilizzo del browser `Google Chrome` siccome con altri browser quali `Microsoft Edge` per esempio si possono riscontrare errori dovuti al formato di gestione delle date del browser.

### Server Web

Il server Web utilizza Jetty e Jersey. Si può avviare eseguendo `mvn jetty:run` all'interno della cartella `server-web`. Espone le API REST all'indirizzo `localhost` alla porta `8080`.

### Database

Il database è una semplice applicazione Java. Si possono utilizzare i seguenti comandi Maven:

* `mvn clean`: per ripulire la cartella dai file temporanei,
* `mvn compile`: per compilare l'applicazione,
* `mvn exec:java`: per avviare l'applicazione (presuppone che la classe principale sia `Main.java`). Si pone in ascolto all'indirizzo `localhost` alla porta `3030`.