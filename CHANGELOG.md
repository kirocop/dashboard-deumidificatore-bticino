# Changelog

Tutti i cambiamenti significativi a questo progetto saranno documentati in questo file.
Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/) e questo progetto segue il [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
