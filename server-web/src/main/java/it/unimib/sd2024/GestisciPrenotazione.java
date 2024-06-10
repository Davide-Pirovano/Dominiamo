package it.unimib.sd2024;

// avvio --> mvn jetty:run

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.net.Socket;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

// import jakarta.json.JsonException;
import jakarta.json.bind.JsonbBuilder;
import jakarta.json.bind.JsonbException;
import jakarta.ws.rs.DELETE;
// import jakarta.ws.rs.Consumes;
// import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
// import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
// import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

@Path("domini")
public class GestisciPrenotazione {
    // Attributi privati statici...
    private static int latestId = 0;
    private static Socket socket;
    private static PrintStream out;
    private static BufferedReader in;

    // lista di domini in registrazione concorrente
    private static Map<String, String> registrazioneConccorrente = new HashMap<>(); // dominio, email

    private void startSocket() {
        try {
            socket = new Socket("localhost", 3030);
            out = new PrintStream(socket.getOutputStream(), true);
            in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        } catch (IOException e) {
            System.out.println(e);
        }
    }

    private void closeSocket() {
        try {
            out.close();
            in.close();
            socket.close();
        } catch (IOException e) {
            System.out.println(e);
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getDomains(@QueryParam("email") String email) {

        try {
            startSocket();
            String op = "4"; // read operation
            String request = op + ";" + email;
            out.println(request);
            out.println("0");

            String dato = "";
            String inputLine = "";
            while ((inputLine = in.readLine()) != null) {
                if ("0".equals(inputLine)) {
                    break;
                }
                dato += inputLine;
            }

            // invio response con dato al client
            if (dato.equals("")) {
                closeSocket();
                return Response.status(Response.Status.NOT_FOUND).build();
            }

            closeSocket();
            return Response.ok(dato).build();
        } catch (IOException e) {
            System.out.println(e);
            return Response.serverError().build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/{idPrenotazione}")
    public Response getDomain(@PathParam("idPrenotazione") int idPrenotazione) {
        try {
            startSocket();
            String op = "2"; // read operation
            String request = op + ";" + idPrenotazione;
            out.println(request);
            out.println("0");

            String dato = "";
            String inputLine = "";
            while ((inputLine = in.readLine()) != null) {
                if ("0".equals(inputLine)) {
                    break;
                }
                dato += inputLine;
            }

            if (dato.equals("")) {
                closeSocket();
                return Response.status(Response.Status.NOT_FOUND).build();
            }

            closeSocket();
            return Response.ok(dato).build();
        } catch (IOException e) {
            System.out.println(e);
            return Response.serverError().build();
        }
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public synchronized Response crateDomain(String body) {
        try {
            // generazione prenotazione creando un id univoco da assegnarli e passando i
            // valori del body
            Prenotazione prenotazione = JsonbBuilder.create().fromJson(body, Prenotazione.class);
            prenotazione.setIdPrenotazione(++latestId);
            prenotazione.setStatus("attivo");
            // salvataggio prenotazione nel database

            startSocket();

            String op = "1"; // create operation
            int idPrenotazione = prenotazione.getIdPrenotazione();
            String dominio = prenotazione.getDominio();
            int durata = prenotazione.getDurata();
            String nome = prenotazione.getNome();
            String cognome = prenotazione.getCognome();
            String email = prenotazione.getEmail();
            String numeroCarta = prenotazione.getNumeroCarta();
            String scadenzaCarta = prenotazione.getScadenzaCarta();
            String nomeCognomeIntestatario = prenotazione.getNomeCognomeIntestatario();
            String cvv = prenotazione.getCvv();
            String dataPrenotazione = prenotazione.getDataPrenotazione().toString();
            String dataScadenza = prenotazione.getDataScadenza().toString();
            String status = prenotazione.getStatus();

            String request = op + ";" + idPrenotazione + ";" + dominio + ";" + durata + ";" + nome + ";" + cognome + ";"
                    + email + ";" + cvv + ";"
                    + numeroCarta + ";" + scadenzaCarta + ";" + nomeCognomeIntestatario + ";" + dataPrenotazione + ";"
                    + dataScadenza + ";" + status;

            out.println(request);
            out.println("0");

            String dato = "";
            String inputLine = "";

            while ((inputLine = in.readLine()) != null) {
                if ("0".equals(inputLine)) {
                    break;
                }
                dato += inputLine;
            }

            if (dato.equals("false")) {
                closeSocket();
                return Response.status(Response.Status.CONFLICT).build();
            }

            closeSocket();

            return Response.created(new URI("http://localhost:8080/domini/" + prenotazione.getIdPrenotazione()))
                    .entity(JsonbBuilder.create().toJson(prenotazione)).build();
        } catch (JsonbException | URISyntaxException e) {
            return Response.status(Status.BAD_REQUEST).build();
        } catch (IOException e) {
            System.out.println(e);
            return Response.serverError().build();
        }
    }

    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/{idPrenotazione}")
    public synchronized Response updateDomain(@PathParam("idPrenotazione") int idPrenotazione, String body) {
        try {
            // aggiornamento prenotazione passando i valori del body
            Prenotazione prenotazione = JsonbBuilder.create().fromJson(body, Prenotazione.class);
            prenotazione.setIdPrenotazione(idPrenotazione);

            startSocket();

            String op = "3"; // rinnovo prenotazione scaduta
            String dominio = prenotazione.getDominio();
            String durata;
            // System.out.println(prenotazione.getDurata());
            if (Integer.toString(prenotazione.getDurata()).equals("0")) {
                durata = null;
            } else {
                durata = Integer.toString(prenotazione.getDurata());
            }
            String nome = prenotazione.getNome();
            String cognome = prenotazione.getCognome();
            String email = prenotazione.getEmail();
            String numeroCarta = prenotazione.getNumeroCarta();
            String scadenzaCarta = prenotazione.getScadenzaCarta();
            String nomeCognomeIntestatario = prenotazione.getNomeCognomeIntestatario();
            String cvv = prenotazione.getCvv();
            String dataPrenotazione;
            if (prenotazione.getDataPrenotazione() != null) {
                dataPrenotazione = prenotazione.getDataPrenotazione().toString();
            } else {
                dataPrenotazione = null;
            }
            String dataScadenza;
            if (prenotazione.getDataScadenza() != null) {
                dataScadenza = prenotazione.getDataScadenza().toString();
            } else {
                dataScadenza = null;
            }

            String status = prenotazione.getStatus();

            String request = op + ";" + idPrenotazione + ";" + dominio + ";" + durata + ";" + nome + ";" + cognome + ";"
                    + email + ";" + cvv + ";" + numeroCarta + ";" + scadenzaCarta + ";" + nomeCognomeIntestatario + ";"
                    + dataPrenotazione + ";" + dataScadenza + ";" + status;

            out.println(request);
            out.println("0");

            String dato = "";
            String inputLine = "";

            while ((inputLine = in.readLine()) != null) {
                if ("0".equals(inputLine)) {
                    break;
                }
                dato += inputLine;
            }

            if (dato.equals("false")) {
                closeSocket();
                return Response.status(Response.Status.CONFLICT).build();
            }

            closeSocket();

            return Response.ok().entity(JsonbBuilder.create().toJson(prenotazione)).build();
        } catch (JsonbException e) {
            return Response.status(Status.BAD_REQUEST).build();
        } catch (IOException e) {
            System.out.println(e);
            return Response.serverError().build();
        }
    }

    @GET
    @Path("/check")
    @Produces(MediaType.APPLICATION_JSON)
    public synchronized Response checkAvailable(@QueryParam("dominio") String dominio) {

        if (registrazioneConccorrente.containsKey(dominio)) {
            return Response.ok("{\"available\":true, \"email\": \"" + registrazioneConccorrente.get(dominio) + "\"}")
                    .build();
        }

        try {

            // controllo se il dominio è in registrazione concorrente

            startSocket();

            String op = "5"; // check availability operation
            String request = op + ";" + dominio;
            out.println(request);
            out.println("0");

            String dato = "";
            String inputLine = "";
            while ((inputLine = in.readLine()) != null) {
                if ("0".equals(inputLine)) {
                    break;
                }
                dato += inputLine;
            }
            String[] dati = dato.split(";");

            closeSocket();
            return Response.ok("{\"available\":" + dati[0] + ", \"email\": \"" + dati[1] + "\"}").build();
        } catch (IOException e) {
            System.out.println(e);
            return Response.serverError().build();
        }
    }

    @POST
    @Path("/reserved")
    @Produces(MediaType.APPLICATION_JSON)
    public synchronized Response reserveDomain(String body) {
        try {
            // cast body in json
            Prenotazione p = JsonbBuilder.create().fromJson(body, Prenotazione.class);
            String dominio = p.getDominio();
            String email = p.getEmail();
            registrazioneConccorrente.put(dominio, email);
            return Response.ok().build();
        } catch (JsonbException e) {
            return Response.status(Status.BAD_REQUEST).build();
        }
    }

    @DELETE
    @Path("/reserved")
    @Produces(MediaType.APPLICATION_JSON)
    public synchronized Response deleteReservedDomain(String body) {
        try {
            // cast body in json
            Prenotazione p = JsonbBuilder.create().fromJson(body, Prenotazione.class);
            String dominio = p.getDominio();
            registrazioneConccorrente.remove(dominio);
            return Response.ok().build();
        } catch (JsonbException e) {
            return Response.status(Status.BAD_REQUEST).build();
        }
    }
}