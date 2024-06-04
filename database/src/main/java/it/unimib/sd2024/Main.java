package it.unimib.sd2024;

import java.net.*;
import java.io.*;

/**
 * Classe principale in cui parte il database.
 */
public class Main {
    private static GestisciPrenotazione gp = new GestisciPrenotazione();

    /**
     * Porta di ascolto.
     */
    public static final int PORT = 3030;

    /**
     * Avvia il database e l'ascolto di nuove connessioni.
     */
    public static void startServer() throws IOException {
        var server = new ServerSocket(PORT);

        System.out.println("Database listening at localhost:" + PORT);

        try {
            while (true)
                new Handler(server.accept()).start();
        } catch (IOException e) {
            System.err.println(e);
        } finally {
            server.close();
        }
    }

    /**
     * Handler di una connessione del client.
     */
    private static class Handler extends Thread {
        private Socket client;

        public Handler(Socket client) {
            this.client = client;
        }

        public void run() {
            try {
                var out = new PrintWriter(client.getOutputStream(), true);
                var in = new BufferedReader(new InputStreamReader(client.getInputStream()));

                String dato = "";
                String inputLine = "";

                while ((inputLine = in.readLine()) != null) {
                    if ("0".equals(inputLine)) {
                        break;
                    }
                    dato += inputLine;
                }

                String[] dati = dato.split(";");
                
                switch(dati[0]) {
                	case "1": //creazione
                		out.println(gp.creaPrenotazione(dati));
                		break;
                }

                in.close();
                out.close();
                client.close();
            } catch (IOException e) {
                System.err.println(e);
            }
        }
    }

    /**
     * Metodo principale di avvio del database.
     *
     * @param args argomenti passati a riga di comando.
     *
     * @throws IOException
     */
    public static void main(String[] args) throws IOException {
        startServer();
    }
}

