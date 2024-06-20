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
import java.util.HashMap;

import org.json.*;

public class Database {
    private String dbPath = "src\\main\\java\\it\\unimib\\sd2024\\Database.json";
    String[] chiavi = { "idPrenotazione", "dominio", "durata", "nome", "cognome", "email", "cvv", "numeroCarta",
            "scadenzaCarta", "nomeCognomeIntestatario", "dataPrenotazione", "dataScadenza", "status"};

    String[] chiaviOrdini = {"idOrdine", "email", "dominio", "dataOrdine", "oggetto", "prezzo" };

    private static int idOrdine = 0;

    public Database() {
        // Creazione del file json se non esiste
        try {
            File file = new File(dbPath);
            if (file.createNewFile()) {
                System.out.println("File creato: " + file.getName());
                
                FileWriter fileWriter = new FileWriter(dbPath);
                BufferedWriter writer = new BufferedWriter(fileWriter);
                writer.write("{\"Prenotazioni\" : [], \"Ordini\" : []}");
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

        // converto i dati in un hashmap <String, String> splittando per :
        HashMap<String, String> datiMap = new HashMap<String, String>();
        for (int i = 0; i < dati.length; i++) {
            String[] keyValue = dati[i].split(":");
            datiMap.put(keyValue[0], keyValue[1]);
        }
        
        try {
            // Leggi il contenuto del file JSON come stringa
            String content = new String(Files.readAllBytes(Paths.get(dbPath)), StandardCharsets.UTF_8);
            // Converti il contenuto in un oggetto JSON
            JSONObject jsonObject = new JSONObject(content);

            // Ottieni l'array JSON "Prenotazione"
            JSONArray jsonArray = jsonObject.getJSONArray("Prenotazioni");

            // Creo un JSONObject per il nuovo oggetto JSON
            JSONObject newJsonObject = new JSONObject();

            // Associa valori alle chiavi controllando datiMap
            for (int i = 0; i < chiavi.length; i++) {
                newJsonObject.put(chiavi[i], datiMap.get(chiavi[i]));
            }
            

            // Aggiungi il nuovo oggetto JSON all'array JSON
            jsonArray.put(newJsonObject);

            // Scrivi il nuovo oggetto JSON nel file
            Files.write(Paths.get(dbPath), jsonObject.toString(4).getBytes(StandardCharsets.UTF_8));

            // aggiungo ordine
            JSONArray ordini = jsonObject.getJSONArray("Ordini");

            // Creo un JSONObject per il nuovo oggetto JSON
            JSONObject newJsonObjectOrdini = new JSONObject();

            // Associa valori alle chiavi
            for (int i = 0; i < chiaviOrdini.length; i++) {
                if (datiMap.containsKey(chiaviOrdini[i])) {
                    newJsonObjectOrdini.put(chiaviOrdini[i], datiMap.get(chiaviOrdini[i]));
                }else{
                    if(chiaviOrdini[i].equals("idOrdine")){
                        newJsonObjectOrdini.put(chiaviOrdini[i], ++idOrdine);
                    }else if(chiaviOrdini[i].equals("oggetto")){
                        newJsonObjectOrdini.put(chiaviOrdini[i], "Registrazione");
                    }else if(chiaviOrdini[i].equals("dataOrdine")){
                        // aggiungo la data nel formato dd/mm/yyyy
                        LocalDate today = LocalDate.now();
                        newJsonObjectOrdini.put(chiaviOrdini[i], today.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                    }
                }
            }

            // Aggiungi il nuovo oggetto JSON all'array JSON
            ordini.put(newJsonObjectOrdini);

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
        HashMap<String, String> datiMap = new HashMap<String, String>();
        for (int i = 0; i < dati.length; i++) {
            String[] keyValue = dati[i].split(":");
            datiMap.put(keyValue[0], keyValue[1]);
        }

        try {
            
            // Leggi il contenuto del file JSON come stringa
            String content = new String(Files.readAllBytes(Paths.get(dbPath)),
                    StandardCharsets.UTF_8);
            // Converti il contenuto in un oggetto JSON
            JSONObject jsonObject = new JSONObject(content);

            // Ottieni l'array JSON "Prenotazione"
            JSONArray jsonArray = jsonObject.getJSONArray("Prenotazioni");

            // Cerca l'oggetto JSON con l'id specificato e aggiorno i valori solamente se
            // diversi da null e quando incorntra l'id non lo modificare
            String idPrenotazione = "";
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject obj = jsonArray.getJSONObject(i);
                if (obj.getString("idPrenotazione").equals(datiMap.get("idPrenotazione"))) {
                    idPrenotazione = obj.getString("idPrenotazione");
                    for (int j = 0; j < chiavi.length; j++) {
                        if (datiMap.containsKey(chiavi[j]) && !datiMap.get(chiavi[j]).equals("null")) {
                            obj.put(chiavi[j], datiMap.get(chiavi[j]));
                        }
                    }
                }
            }

            // ottengo la prenotazione
            JSONObject prenotazione = null;
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject obj = jsonArray.getJSONObject(i);
                if (obj.getString("idPrenotazione").equals(idPrenotazione)) {
                    prenotazione = obj;
                }
            }

            // // Scrivi il nuovo oggetto JSON nel file
            Files.write(Paths.get(dbPath), jsonObject.toString(4).getBytes(StandardCharsets.UTF_8));

            // aggiungo operazione agli ordini
            JSONArray ordini = jsonObject.getJSONArray("Ordini");

            // Creo un JSONObject per il nuovo oggetto JSON
            JSONObject newJsonObjectOrdini = new JSONObject();

            // Associa valori alle chiavi
            for (int i = 0; i < chiaviOrdini.length; i++) {
                if (datiMap.containsKey(chiaviOrdini[i]) && !datiMap.get(chiaviOrdini[i]).equals("null")) {
                    newJsonObjectOrdini.put(chiaviOrdini[i], datiMap.get(chiaviOrdini[i]));
                }else if(datiMap.containsKey(chiaviOrdini[i])){

                    if(chiaviOrdini[i].equals("email")){
                        newJsonObjectOrdini.put(chiaviOrdini[i], prenotazione.getString("email"));
                    }else if(chiaviOrdini[i].equals("dominio")){
                        newJsonObjectOrdini.put(chiaviOrdini[i], prenotazione.getString("dominio"));
                    }else if(chiaviOrdini[i].equals("prezzo")){
                        newJsonObjectOrdini.put(chiaviOrdini[i], prenotazione.getString("prezzo"));
                    }
                
                }else{
                    if(chiaviOrdini[i].equals("idOrdine")){
                        newJsonObjectOrdini.put(chiaviOrdini[i], ++idOrdine);
                    }else if(chiaviOrdini[i].equals("oggetto")){
                        newJsonObjectOrdini.put(chiaviOrdini[i], "Rinnovo");
                    }else if(chiaviOrdini[i].equals("dataOrdine")){
                        // aggiungo la data nel formato dd/mm/yyyy
                        LocalDate today = LocalDate.now();
                        newJsonObjectOrdini.put(chiaviOrdini[i], today.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                    } 
                }
            }

            // Aggiungi il nuovo oggetto JSON all'array JSON
            ordini.put(newJsonObjectOrdini);

            // Scrivi il nuovo oggetto JSON nel file
            Files.write(Paths.get(dbPath), jsonObject.toString(4).getBytes(StandardCharsets.UTF_8));

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

    // lettura ordini dal file json
    public synchronized String leggiOrdini(String email) {
        System.out.println("Lettura ordini dal database");
        try {
            // Leggi il contenuto del file JSON come stringa
            String content = new String(Files.readAllBytes(Paths.get(dbPath)), StandardCharsets.UTF_8);
            // Converti il contenuto in un oggetto JSON
            JSONObject jsonObject = new JSONObject(content);

            // Ottieni l'array JSON "Ordini"
            JSONArray jsonArray = jsonObject.getJSONArray("Ordini");

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

    // verifica disponibilità dominio
    public synchronized String verificaDisponibilita(String dominio) {
        System.out.println("Verifica disp dominio");
        // return "false;l'email" dell'utente che ha prenotato il dominio o "true;null"
        // se il dominio è disponibile
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
                    // false;nome;cognome;dataScadenza;email
                    return "false;" + obj.getString("nome") + ";" + obj.getString("cognome") + ";"
                            + obj.getString("dataScadenza") + ";" + obj.getString("email");
                }
            }

            return "true;null";
        } catch (JSONException | IOException e) {
            e.printStackTrace();
            return "false;null;null,null,null";
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
