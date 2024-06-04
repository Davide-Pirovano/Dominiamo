package it.unimib.sd2024;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.net.Socket;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

import jakarta.json.JsonException;
import jakarta.json.bind.JsonbBuilder;
import jakarta.json.bind.JsonbException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

/**
 * Rappresenta la risorsa "example" in "http://localhost:8080/example".
 */
@Path("domini")
public class GestisciPrenotazione {
    // Attributi privati statici...
    private static int latestId = 0;

    // Inizializzazione statica.
    static {
        // ...
    }

    /**
     * Implementazione di GET "/example".
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Integer getDomini() {
        // Aprire qui una socket verso il database, fare il comando per ottenere la
        // risposta.
        // ...
        return 42;
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public synchronized Response crateDomain(String body) {
        try {
            // generazione prenotazione creando un id univoco da assegnarli e passando i
            // valori del body
            Prenotazione prenotazione = JsonbBuilder.create().fromJson(body, Prenotazione.class);
            prenotazione.setIdPrenotazione(latestId++);
            // salvataggio prenotazione nel database

            Socket socket = new Socket("localhost", 3030);
            PrintStream out = new PrintStream(socket.getOutputStream(), true);
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));

            String op = "1"; // create operation
            String dominio = prenotazione.getDominio();
            int durata = prenotazione.getDurata();
            String nome = prenotazione.getNome();
            String cognome = prenotazione.getCognome();
            String email = prenotazione.getEmail();
            String numeroCarta = prenotazione.getNumeroCarta();
            String scadenzaCarta = prenotazione.getScadenzaCarta();
            String nomeCognomeIntestatario = prenotazione.getNomeCognomeIntestatario();

            String request = op + ";" + dominio + ";" + durata + ";" + nome + ";" + cognome + ";" + email + ";"
                    + numeroCarta + ";" + scadenzaCarta + ";" + nomeCognomeIntestatario + ";0";
            out.println(request);

            String dato = "";
            String inputLine = "";

            while ((inputLine = in.readLine()) != null) {
                if ("0".equals(inputLine)) {
                    break;
                }
                dato += inputLine;
            }

            System.out.println(dato);

            if (dato.equals("false")) {
                socket.close();
                return Response.status(Response.Status.CONFLICT).build();
            }

            socket.close();

            return Response.created(new URI("http://localhost:8080/domini/" + prenotazione.getIdPrenotazione()))
                    .entity(JsonbBuilder.create().toJson(prenotazione)).build();
        } catch (JsonbException | URISyntaxException e) {
            return Response.status(Status.BAD_REQUEST).build();
        } catch (IOException e) {
            System.out.println(e);
            return Response.serverError().build();
        }
    }
}