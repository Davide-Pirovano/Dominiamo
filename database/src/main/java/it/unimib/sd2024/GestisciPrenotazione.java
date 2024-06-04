package it.unimib.sd2024;

public class GestisciPrenotazione {
    Database db = new Database();

    public synchronized boolean creaPrenotazione(String[] dati) {
        System.out.println("Creazione prenotazione");
        // Creazione di una prenotazione
        return db.inserisciDati(dati);
    }

    public synchronized String leggiPrenotazioni(String email) {
        System.out.println("Lettura prenotazioni");
        // Lettura delle prenotazioni
        return db.leggiDati(email);
    }
}
