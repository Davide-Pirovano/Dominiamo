package it.unimib.sd2024;

import java.io.FileWriter;
import java.io.File;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

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

    // modifica dati nel file json
    public synchronized boolean modificaDati(String[] dati) {
        System.out.println("Modifica dati nel database");
        try {
            // stampo array dati
            // for (int i = 0; i < dati.length; i++) {
            // System.out.println(dati[i] == "null");
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

    // lettura prenotazione dal file json
    public synchronized String leggiPrenotazione(String id) {
        System.out.println("Lettura prenotazione dal database");
        try {
            // Leggi il contenuto del file JSON come stringa
            String content = new String(Files.readAllBytes(Paths.get(dbPath)), StandardCharsets.UTF_8);
            // Converti il contenuto in un oggetto JSON
            JSONObject jsonObject = new JSONObject(content);

            // Ottieni l'array JSON "Prenotazione"
            JSONArray jsonArray = jsonObject.getJSONArray("Prenotazioni");

            // Cerca l'oggetto JSON con l'id specificato
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject obj = jsonArray.getJSONObject(i);
                if (obj.getString("idPrenotazione").equals(id)) {
                    return obj.toString(4);
                }
            }

            return "";
        } catch (JSONException | IOException e) {
            e.printStackTrace();
            return "";
        }
    }

    // verifica disponibilità dominio
    public synchronized boolean verificaDisponibilita(String dominio) {
        System.out.println("Verifica disponibilità dominio");
        // true disponibile, false non disponibile
        try {
            // Leggi il contenuto del file JSON come stringa
            String content = new String(Files.readAllBytes(Paths.get(dbPath)), StandardCharsets.UTF_8);
            // Converti il contenuto in un oggetto JSON
            JSONObject jsonObject = new JSONObject(content);

            // Ottieni l'array JSON "Prenotazione"
            JSONArray jsonArray = jsonObject.getJSONArray("Prenotazioni");

            // Cerca l'oggetto JSON con il dominio specificato
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject obj = jsonArray.getJSONObject(i);
                if (obj.getString("dominio").equals(dominio)) {
                    return false;
                }
            }

            return true;
        } catch (JSONException | IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    // controllo scadenze e se scaduto aggiorno lo status in "rinnovare"
    public synchronized void checkScadenze() {
        final String ATTIVO = "attivo";
        final String SCADUTO = "scaduto";
        final String RINNOVARE = "rinnovare";
        final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        System.out.println("Controllo scadenze");

        try {
            // Leggi il contenuto del file JSON come stringa
            String content = new String(Files.readAllBytes(Paths.get(dbPath)), StandardCharsets.UTF_8);

            // Converti il contenuto in un oggetto JSON
            JSONObject jsonObject = new JSONObject(content);

            // Ottieni l'array JSON "Prenotazioni"
            JSONArray jsonArray = jsonObject.getJSONArray("Prenotazioni");

            // Ottieni la data odierna
            LocalDate today = LocalDate.now();

            // Itera sugli oggetti del JSON e controlla le scadenze
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject obj = jsonArray.getJSONObject(i);
                String status = obj.getString("status");
                String dataScadenza = obj.getString("dataScadenza");

                try {
                    // Converte la data di scadenza in formato LocalDate
                    LocalDate scadenzaDate = LocalDate.parse(dataScadenza, formatter);

                    if (status.equals(ATTIVO) && scadenzaDate.isBefore(today)) {
                        if (obj.getInt("durata") == 10) {
                            System.out.println("Scaduto");
                            obj.put("status", SCADUTO);
                        } else {
                            System.out.println("Rinnovare");
                            obj.put("status", RINNOVARE);
                        }
                    }
                } catch (DateTimeParseException e) {
                    System.err.println("Errore nel parsing della data per l'oggetto: " + obj);
                    e.printStackTrace();
                }
            }

            // Scrivi il nuovo oggetto JSON nel file
            Files.write(Paths.get(dbPath), jsonObject.toString(4).getBytes(StandardCharsets.UTF_8));

        } catch (IOException e) {
            System.err.println("Errore nella lettura o scrittura del file JSON");
            e.printStackTrace();
        } catch (JSONException e) {
            System.err.println("Errore nella manipolazione del JSON");
            e.printStackTrace();
        }
    }
}
