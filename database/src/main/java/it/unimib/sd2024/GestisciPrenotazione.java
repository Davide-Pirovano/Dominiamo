package it.unimib.sd2024;

public class GestisciPrenotazione {
    Database db = new Database();

    public synchronized boolean creaPrenotazione(String[] dati) {
        // System.out.println("Creazione prenotazione");
        // Creazione di una prenotazione
        
        // rimuovo dati[0] che è il comando
        String[] datiPrenotazione = new String[dati.length - 1];
        for (int i = 1; i < dati.length; i++) {
            datiPrenotazione[i - 1] = dati[i];
        }
        return db.inserisciDati(datiPrenotazione);
    }

    public synchronized String leggiPrenotazioni(String email) {
        // System.out.println("Lettura prenotazioni");
        // Lettura delle prenotazioni
        return db.leggiDati(email);
    }
}
