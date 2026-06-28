#!/bin/bash

# Script per installare, sbloccare e firmare localmente la Dashboard Deumidificatore Bticino
# per evitare l'errore "è danneggiato e non può essere aperto" dovuto a Gatekeeper.

APP_NAME="Dashboard Deumidificatore Bticino"
APP_DIR="/Applications/${APP_NAME}.app"
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
DMG_PATH="${REPO_DIR}/dist-mac/${APP_NAME}-1.0.4-arm64.dmg"

echo "🍏 Sblocco e Installazione rapida di: ${APP_NAME}"
echo "--------------------------------------------------------"

# 1. Trova il DMG compilato se presente
if [ -f "$DMG_PATH" ]; then
    echo "📦 Trovato installer DMG locale: $(basename "$DMG_PATH")"
    echo "📂 Montaggio del volume temporaneo..."
    MOUNT_POINT=$(hdiutil attach "$DMG_PATH" -nobrowse | grep "/Volumes/" | awk -F '\t' '{print $NF}')
    
    if [ -d "$MOUNT_POINT" ]; then
        echo "⬇️ Copia dell'applicazione in /Applications..."
        cp -R "${MOUNT_POINT}/${APP_NAME}.app" /Applications/
        
        echo "📤 Smontaggio del volume..."
        hdiutil detach "$MOUNT_POINT" -quiet
    fi
else
    echo "⚠️ Nessun DMG locale trovato in dist-mac/. Verrà sbloccata l'app già presente in /Applications."
fi

# 2. Verifica se l'app è in Applicazioni
if [ -d "$APP_DIR" ]; then
    echo "🧹 Rimozione tag di quarantena Gatekeeper..."
    xattr -cr "$APP_DIR"
    
    echo "🔐 Firma locale ad-hoc dell'eseguibile..."
    codesign --force --deep --sign - "$APP_DIR"
    
    echo "--------------------------------------------------------"
    echo "✅ Installazione e sblocco completati con successo!"
    echo "🚀 Ora puoi aprire l'applicazione dal Launchpad o da /Applications."
else
    echo "❌ Errore: L'applicazione non è presente in /Applications e non è stato possibile estrarla."
    exit 1
fi
