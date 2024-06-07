package it.unimib.sd2024;

import java.io.FileWriter;
import java.io.File;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.json.*;

public class Database {
    private String dbPath = "src\\main\\java\\it\\unimib\\sd2024\\Database.json";
    String[] chiavi = { "idPrenotazione", "dominio", "durata", "nome", "cognome", "email", "cvv", "numeroCarta",
            "scadenzaCarta", "nomeCognomeIntestatario", "dataPrenotazione", "dataScadenza", "status" };

    public Database() {
        // Creazione del file json se non esiste
        try {
            File file = new File(dbPath);
            if (file.createNewFile()) {
                System.out.println("File creato: " + file.getName());
                // inizializzo {"Prenotazione" : []}
                FileWriter fileWriter = new FileWriter(dbPath);
                BufferedWriter writer = new BufferedWriter(fileWriter);
                writer.write("{\"Prenotazioni\" : []}");
                writer.close();
            } else {
                System.out.println("File esistente");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    // inserimento dati nel file json
    public synchronized boolean inserisciDati(String[] dati) {
        System.out.println("Inserimento dati nel database");
        try {
            // Leggi il contenuto del file JSON come stringa
            String content = new String(Files.readAllBytes(Paths.get(dbPath)), StandardCharsets.UTF_8);
            // Converti il contenuto in un oggetto JSON
            JSONObject jsonObject = new JSONObject(content);

            // Ottieni l'array JSON "Prenotazione"
            JSONArray jsonArray = jsonObject.getJSONArray("Prenotazioni");

            // Creo un JSONObject per il nuovo oggetto JSON
            JSONObject newJsonObject = new JSONObject();

            // Associa valori alle chiavi
            for (int i = 0; i < dati.length; i++) {
                newJsonObject.put(chiavi[i], dati[i]);
            }

            // Aggiungi il nuovo oggetto JSON all'array JSON
            jsonArray.put(newJsonObject);

            // Scrivi il nuovo oggetto JSON nel file
            Files.write(Paths.get(dbPath), jsonObject.toString(4).getBytes(StandardCharsets.UTF_8));

            return true;
        } catch (JSONException | IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    // lettura dati dal file json
    public synchronized String leggiDati(String email) {
        System.out.println("Lettura dati dal database");
        try {
            // Leggi il contenuto del file JSON come stringa
            String content = new String(Files.readAllBytes(Paths.get(dbPath)), StandardCharsets.UTF_8);
            // Converti il contenuto in un oggetto JSON
            JSONObject jsonObject = new JSONObject(content);

            // Ottieni l'array JSON "Prenotazione"
            JSONArray jsonArray = jsonObject.getJSONArray("Prenotazioni");

            JSONArray result = new JSONArray();

            // Cerca l'oggetto JSON con l'email specificata
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject obj = jsonArray.getJSONObject(i);
                if (obj.getString("email").equals(email)) {
                    result.put(obj);
                }
            }

            return result.toString(4);
        } catch (JSONException | IOException e) {
            e.printStackTrace();
            return "";
        }
    }

    // controllo scadenze e se scaduto aggiorno lo status in "rinnovare"
    public synchronized void checkScadenze() {
        System.out.println("Controllo scadenze");
        try {
            // Leggi il contenuto del file JSON come stringa
            String content = new String(Files.readAllBytes(Paths.get(dbPath)), StandardCharsets.UTF_8);
            // Converti il contenuto in un oggetto JSON
            JSONObject jsonObject = new JSONObject(content);

            // Ottieni l'array JSON "Prenotazioni"
            JSONArray jsonArray = jsonObject.getJSONArray("Prenotazioni");

            // Ottieni la data odierna
            String today = java.time.LocalDate.now().toString();

            // itero sugli oggetti del json e controllo dove ho lo stato attivo se la data
            // di scadenza è scaduta aggiorno lo status in rinnovare
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject obj = jsonArray.getJSONObject(i);

                // fromatto data dell'oggetto in yyyy-mm-dd
                String[] dataScadenza = obj.getString("dataScadenza").split("/");
                // e lo salvo in una variabile
                String dataScadenzaFormatted = dataScadenza[2] + "-" + dataScadenza[1] + "-" + dataScadenza[0];

                // System.out.println("-----------------");
                // System.out.println(obj.getString("status"));
                // System.out.println(today);
                // System.out.println(dataScadenzaFormatted);
                // System.out.println(dataScadenzaFormatted.compareTo(today));
                // System.out.println(
                // obj.getString("status").equals("attivo") &&
                // dataScadenzaFormatted.compareTo(today) < 0);
                // System.out.println("-----------------");

                if (obj.getString("status").equals("attivo") && dataScadenzaFormatted.compareTo(today) < 0) {
                    System.out.println("Rinnovare");
                    obj.put("status", "rinnovare");
                }
            }

            // Scrivi il nuovo oggetto JSON nel file
            Files.write(Paths.get(dbPath), jsonObject.toString(4).getBytes(StandardCharsets.UTF_8));
        } catch (JSONException | IOException e) {
            e.printStackTrace();
        }
    }

    // modifica dati nel file json
    public synchronized boolean modificaDati(String[] dati) {
        System.out.println("Modifica dati nel database");
        try {
            // stampo array dati
            // for (int i = 0; i < dati.length; i++) {
            //     System.out.println(dati[i] == "null");
            // }
            // Leggi il contenuto del file JSON come stringa
            String content = new String(Files.readAllBytes(Paths.get(dbPath)),
                    StandardCharsets.UTF_8);
            // Converti il contenuto in un oggetto JSON
            JSONObject jsonObject = new JSONObject(content);

            // Ottieni l'array JSON "Prenotazione"
            JSONArray jsonArray = jsonObject.getJSONArray("Prenotazioni");

            // Cerca l'oggetto JSON con l'id specificato e aggiorno i valori solamente se
            // diversi da null e quando incorntra l'id non lo modificare
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject obj = jsonArray.getJSONObject(i);
                if (obj.getString("idPrenotazione").equals(dati[0])) {
                    for (int j = 1; j < dati.length; j++) {
                        if (!dati[j].equals("null")) {
                            obj.put(chiavi[j], dati[j]);
                        }
                    }
                }
            }

            // Scrivi il nuovo oggetto JSON nel file
            Files.write(Paths.get(dbPath),
                    jsonObject.toString(4).getBytes(StandardCharsets.UTF_8));

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
