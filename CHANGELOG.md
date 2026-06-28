# Changelog

Tutti i cambiamenti significativi a questo progetto saranno documentati in questo file.
Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/) e questo progetto segue il [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.7] - 2026-06-28
### Corretto
- **Supporto Gateway Senza Password:** Aggiornato l'handshake OpenWebNet del server locale per consentire la comunicazione immediata se il gateway risponde direttamente con `*#*1##` senza richiedere la password crittografata (comportamento tipico del MyHOMEServer1 con autenticazione locale disabilitata o IP autorizzati).

---

## [1.0.6] - 2026-06-28
### Modificato
- **Riprogettazione Termostato (Display Circolare Nest/Netatmo style):** Sostituito il vecchio semicerchio SVG con un display circolare digitale completo, pulito ed elegante. Allineati al centro del cerchio la temperatura misurata (in alto), la temperatura target/stato OFF (grande e in evidenza al centro), e l'umidità (con icona goccia d'acqua in basso). I pulsanti `＋` e `－` sono stati integrati all'interno di una capsula scura galleggiante sul bordo inferiore del display, eliminando le distorsioni grafiche e migliorando l'usabilità.

---

## [1.0.5] - 2026-06-28
### Modificato
- **Miglioramento Visibilità Clima:** Riallineato e sollevato l'arco del termostato verso l'alto (da `top: 0px` a `top: -10px`) e aumentato il contrasto e la dimensione dei font interni (Misurata e Umidità ingranditi, setpoint/OFF aumentato a `2.6rem`) per dare un look molto più definito e leggibile a distanza.

---

## [1.0.4] - 2026-06-28
### Modificato
- **Restyling Termostato (Stile Home + Control):** Ridisegnata completamente l'interfaccia termostato. Rimossa la sovrapposizione assoluta problematica tra scritte, pulsanti e semicerchio SVG. I pulsanti `＋` e `－` sono stati riposizionati lateralmente a sinistra e a destra dell'arco, e le informazioni testuali (temperatura misurata, livello di umidità e temperatura target) sono state inserite in modo pulito e spazioso all'interno della curvatura.

---

## [1.0.3] - 2026-06-28
### Aggiunto
- **Monitoraggio Energetico Reale:** Implementata la lettura reale della potenza istantanea assorbita (in Watt) interrogando direttamente il modulo di controllo carichi/sensore energia F521 sul bus MyHome tramite il comando OpenWebNet `*#18*51*113##` (WHO 18, Dimension 113).
- **Stato Connessione Dinamico:** Il badge di connessione Legrand si accende dinamicamente solo se il gateway associato all'IP in `.env` risponde correttamente.

---

## [1.0.2] - 2026-06-28
### Corretto
- Centrato e ridimensionato il display centrale dei termostati per evitare sovrapposizioni e allineare perfettamente il valore di temperatura misurata, l'umidità e lo stato OFF/Temperatura target all'interno dell'arco SVG.

---

## [1.0.1] - 2026-06-28
### Aggiunto
- Generata e integrata l'icona applicazione desktop nativa macOS (`icon.icns` in formato 3D con design goccia d'acqua e fulmine per Clima ed Energia).

### Corretto
- **Risolto problema Subnet:** Rimossi gli IP di fallback cablati su `192.168.1.X` in `server.js` per supportare qualsiasi configurazione di rete/router (es. `192.168.0.0/24`) definita nel file `.env`.
- Aggiunta una guardia di controllo per prevenire tentativi di connessione socket TCP a vuoto e relativi timeout se l'IP non è presente nel file `.env`.
- Ripristinata la visualizzazione del livello di umidità (%) all'interno dell'arco centrale delle card dei termostati in `App.jsx`.
- Rimossa la stringa statica residua "Casa Barbato" nel titolo della finestra del wrapper Electron in `main.js`.

---

## [1.0.0] - 2026-06-28
### Aggiunto
- Rilascio iniziale della repository open-source pubblica **Dashboard Deumidificatore Bticino**.
- De-polarizzazione completa del codice (rimozione di riferimenti personali "Casa Barbato") per renderlo distribuibile.
- Strutturato il caricamento dinamico della configurazione generale dell'app e dei nomi delle zone tramite file `.env` (con file template `.env.example`).
- Predisposta la pipeline di packaging nativo macOS tramite `electron-builder` (compilazione DMG e ZIP).
- Implementata la logica di campionamento e tracciamento orario reale sulle 24 ore per i consumi elettrici ed il termostato di ciascuna stanza.
