package it.unimib.sd2024;

import java.io.FileWriter;
import java.io.File;
import java.io.BufferedWriter;
import java.io.IOException;
import org.json.*;

public class Database {
    private String dbPath = "src\\main\\java\\it\\unimib\\sd2024\\Database.json";
    String[] chiavi = { "idPrenotazione", "dominio", "durata", "nome", "cognome", "email", "numeroCarta",
            "scadenzaCarta", "cvv", "nomeCognomeIntestatario" };

    public Database() {
    }

    // inserimento dati nel file json
    public synchronized boolean inserisciDati(String[] dati) {
        System.out.println("Inserimento dati nel database");
        try {
            JSONObject jsonObject = new JSONObject();

            // Associa valori alle chiavi
            for (int i = 0; i < dati.length; i++) {
                jsonObject.put(chiavi[i], dati[i]);
            }

            // Scrivi il JSONObject nel file JSON
            BufferedWriter writer = new BufferedWriter(new FileWriter(dbPath, true));
            writer.write(jsonObject.toString());
            writer.close();

            return true;
        } catch (JSONException | IOException e) {
            e.printStackTrace();
            return false;
        }
    }

}
