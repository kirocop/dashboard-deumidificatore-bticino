# Dashboard Deumidificatore Bticino 🌡️💧⚡

Una splendida dashboard desktop nativa (Glassmorphism dark mode), leggera e offline-first per il monitoraggio e la gestione del clima, del deumidificatore centralizzato e dei consumi elettrici per gli impianti domotici **Bticino MyHOME** e **Legrand Home + Control**.

L'applicazione è sviluppata in **React + Vite** per il frontend ed **Electron** per l'esecuzione desktop nativa (con un server proxy **Express/Node.js** locale per dialogare direttamente con il bus OpenWebNet).

---

## 🍏 Come installare l'App su macOS (DMG)

Dato che l'applicazione è open-source ed è distribuita gratuitamente al di fuori dell'Apple App Store, macOS potrebbe bloccare il primo avvio mostrando l'avviso *"Dashboard Deumidificatore Bticino è danneggiato e non può essere aperto"*. Si tratta di una misura di sicurezza standard (Gatekeeper) per le applicazioni non firmate digitalmente.

Segui questi passaggi per installare e sbloccare l'applicazione in pochi secondi:

1. **Scarica l'installer DMG** dall'area [Releases](https://github.com/kirocop/dashboard-deumidificatore-bticino/releases) dell'applicazione.
2. Apri il file `.dmg` scaricato e **trascina** l'applicazione `Dashboard Deumidificatore Bticino` dentro la tua cartella **Applicazioni** (Applications).
3. Apri il **Terminale** del tuo Mac ed esegui questo comando premendo Invio:
   ```bash
   xattr -cr "/Applications/Dashboard Deumidificatore Bticino.app"
   ```
4. Apri l'applicazione facendo doppio click. Ora si avvierà all'istante senza mostrare alcun errore!

---

## ✨ Funzionalità principali

1. **Gestione Climatizzazione multizona:**
   - Visualizzazione temperatura attuale e umidità per ciascuna zona.
   - Regolazione fine del setpoint di temperatura in Raffrescamento tramite interfaccia circolare ad arco.
   - Accensione e spegnimento del Raffrescamento per singola zona (tramite comandi nativi OpenWebNet `211` e `203`).
   - Calcolo automatico in tempo reale del gradiente di variazione termica (**Drift Termico** in `°C/h`) per misurare l'efficienza termica di ogni stanza.
   - Grafico storico dettagliato della variazione termica di ogni stanza nelle ultime 24 ore, espandibile al click.

2. **Monitoraggio Consumi Energetici (Tab dedicato):**
   - Rilevamento in tempo reale dell'assorbimento elettrico totale istantaneo (in **Watt**) e storico dei kWh consumati nella giornata.
   - Storico ed andamento grafico dei consumi elettrici delle ultime **24 ore reali**.
   - Integrazione con i moduli di energia Bticino (come F521) o il gateway locale **Legrand Home + Control (IP 192.168.1.44)**.

3. **UTA & Deumidificatore Centralizzato:**
   - Attivazione e spegnimento del deumidificatore sul bus domotico locale.

4. **Scenari & Prese Connesse (Pannelli collassabili):**
   - Pannelli richiudibili per non occupare spazio visivo.
   - Attivazione degli scenari domotici Bticino (es: *Buonanotte*, *Tutto Spento*).
   - Controllo ON/OFF e monitoraggio del consumo in tempo reale per le singole prese smart connesse.

---

## 🛡️ Sicurezza & Privacy

L'applicazione è **totalmente sicura, locale e privata**:
- **Zero Cloud:** Funziona interamente nella tua rete LAN domestica interrogando direttamente i tuoi gateway Bticino (`192.168.1.45`) e Legrand (`192.168.1.44`).
- **Nessun invio dati:** Nessun dato su consumi, password o stato dispositivi viene caricato all'esterno.
- **Configurazione isolata:** Le credenziali locali e gli indirizzi IP risiedono solo nel file locale `.env` (escluso dal versionamento Git).

---

## 🚀 Come installarlo a casa tua

### 1. Prerequisiti
Assicurati di avere installato sul tuo computer:
- [Node.js](https://nodejs.org/) (versione 18 o superiore)

### 2. Installazione
Clona la repository ed installa le dipendenze:
```bash
git clone https://github.com/tuo-username/dashboard-deumidificatore-bticino.git
cd dashboard-deumidificatore-bticino
npm install
```

### 3. Configurazione
Crea il tuo file di configurazione locale partendo dal template d'esempio:
```bash
cp .env.example .env
```
Apri il file `.env` appena generato e inserisci i parametri del tuo impianto:
- `BTICINO_IP`: L'indirizzo IP del tuo MyHOMEServer1 / F459.
- `BTICINO_PASSWORD`: La password OpenWebNet (OWN) configurata sul gateway (es. `12345`).
- `HOUSE_ZONES`: L'elenco dei nomi delle tue stanze separate da virgola (es. `Salotto, Cucina, Camera, Studio`). Il sistema creerà dinamicamente le card ed i grafici per ciascuna stanza indicata!

### 4. Avvio in modalità Sviluppo
Per testare e avviare l'applicazione in locale:
```bash
npm run app
```

### 5. Compilazione pacchetto macOS nativo (DMG/Zip)
Per generare un pacchetto installabile nativo macOS (eseguibile DMG nella cartella `dist-mac/`):
```bash
npm run dist
```

---

## 🛠️ Tecnologie utilizzate
- **Frontend:** React, Vite, CSS Vanilla (Glassmorphism & Neon Shadows), SVG per i grafici dinamici.
- **Backend Proxy:** Express, Node.js (connessione TCP Socket nativa su porta 20000).
- **Desktop Wrapper:** Electron & Electron Builder.

---

## 📄 Licenza
Rilasciato sotto licenza MIT. Libero per utilizzi personali ed open source.
