# 📱 RatePal – Feature-Dokumentation

## 🌝 Überblick

**RatePal** ist eine minimalistische Mobile-App, mit der Nutzer persönliche Bewertungslisten erstellen und verwalten können – etwa für Restaurants, Filme, Reisen oder Erlebnisse. Anders als öffentliche Bewertungsplattformen wie Google Maps oder Yelp zielt RatePal auf eine **private, strukturierte und AI-gestützte Nutzererfahrung** ab.

---

## 👤 Anmeldung & Konten

* Registrierung via **E-Mail/Passwort** oder **Social Logins (Google, Apple)**.
* **Pflicht-Login** zur Nutzung der App (keine anonyme Nutzung).
* Accountdaten und Rezensionen werden in Supabase gespeichert.

---

## ✨ Hauptfunktionen

### 1. **Rezensionslisten erstellen**

* Nutzer erstellen beliebig viele **Themenlisten** (z. B. Restaurants, Bücher, Sehenswürdigkeiten).
* **Free-Accounts:** Max. **1 Liste**
* **Premium-Accounts:** Unbegrenzt viele Listen

### 2. **Eigenschaften definieren**

* Nutzer legen bei der Erstellung einer Liste individuelle **Felder/Eigenschaften** fest.

  * Typen: Text, Zahl, Datum, Auswahl (Dropdown), Bild
  * z. B. "Preisniveau", "Service", "Datum des Besuchs"
* **Free-Accounts:** Max. **3 Eigenschaften pro Liste**
* **Premium-Accounts:** Unbegrenzt viele Eigenschaften

### 3. **Einträge hinzufügen**

* Jeder Eintrag gehört zu einer Liste.
* Pflichtfelder:

  * **Titel** (z. B. Restaurantname)
* Optionale Felder:

  * **Punktebewertung (0–100)**
  * **Beschreibung** (manuell oder AI-generiert)
* Zusätzliche optionale Eigenschaften (z. B. "Ort", "Datum") gemäß Liste
* **Fotos**:

  * **Free-Accounts:** 1 Foto pro Eintrag
  * **Premium-Accounts:** bis zu 5 Fotos

### 4. **Templates**

* Auswahl an vorgefertigten Listen-Templates (z. B. Restaurants, Tagebuch, Sehenswürdigkeiten)
* Templates beinhalten Beispiel-Felder, die der Nutzer anpassen kann

---

## 🎹 AI-Integration & Sprachmemos

### 1. **Sprachmemo-Erstellung**

* Nutzer können per Sprachmemo eine Rezension einsprechen
* Upload erfolgt nach Drücken eines + Buttons (Low-Friction)
* **Erfordert Internetverbindung**

### 2. **AI-Verarbeitung**

* Transkription via **OpenAI Whisper API**
* Zusammenfassung via **GPT-4**
* Keyword-Matching extrahiert automatisch Bewertung und Felder, wenn möglich
* Ergebnisse:

  * Automatisch generierter Beschreibungstext
  * Punktzahl-Vorschlag (vom Nutzer editierbar)
  * Vollständiges Transkript abrufbar

### 3. **Einschränkungen**

* Nur 1 AI-Aufruf kostenlos (für Testzwecke)
* Danach nur für **Premium-Nutzer** verfügbar
* AI kann **nur beim Erstellen** eines Eintrags verwendet werden (nicht für Bearbeitung bestehender Rezensionen)

---

## 💰 Monetarisierung: Freemium-Modell

### 1. Free-Version

* 1 Liste erlaubt
* 10 Einträge erlaubt
* 3 Eigenschaften pro Liste
* 1 Foto pro Eintrag
* 1 kostenloser AI-Aufruf (Sprachmemo)

### 2. Premium-Version

* Unbegrenzte Listen & Einträge
* Unbegrenzte Eigenschaften pro Liste
* Bis zu 5 Fotos pro Eintrag
* Unbegrenzte AI-Nutzung
* Listen nachträglich editierbar
* Exportfunktion (z. B. CSV)
* **Testphase:** 7 Tage kostenlos
* **Zahlung via Stripe** (monatlich oder jährlich)

---

## 📦 Technisches Fundament

* **Frontend**: React Native mit **Expo**
* **UI Framework**: **NativeWind** (Tailwind CSS für React Native) mit **Moti** für Animationen
* **Design-Stil**: Dark Mode First und individuelle Illustrationen
* **Code-Editor**: Cursor AI
* **Backend & DB**: Supabase
* **AI**: OpenAI Whisper & GPT-4 APIs
* **Zahlungssystem**: Stripe
* **Deployment**: App Stores (iOS & Android)

---

## 🌟 Onboarding mit "Stello"

* Das App-Maskottchen **Stello** (ein freundlicher Stern) führt neue Nutzer durch die wichtigsten Features
* Zeigt Tipps zur optimalen Nutzung von Sprachmemos & Bewertung

---

## 🚀 Geplante Erweiterungen (Roadmap)

* Bearbeitung bestehender Einträge per AI
* Gemeinsame Listen mit anderen Nutzern (Kollaboration)
* Erweiterter Medien-Support (z. B. Videos)
* Analyse-Features (z. B. Top 10 Restaurants automatisch)

---

## 📄 Export & Datensicherung

* Premium-Nutzer können Listen als **CSV-Dateien exportieren**
* Daten werden cloudbasiert in Supabase gespeichert
* Lokale Speicherung mit Synchronisation bei Internetverbindung

---

## 📚 Beispielhafte User Stories

### 🥘 User Story 1: Restaurantliste

**Als** Foodie, **möchte ich** nach jedem Restaurantbesuch schnell eine Sprachmemo aufnehmen können, **damit ich** mir später merken kann, wie gut das Essen, der Service und das Preis-Leistungs-Verhältnis waren.

### 🎮 User Story 2: Filmliste

**Als** Filmfan, **möchte ich** jeden Film, den ich gesehen habe, in einer Liste bewerten und kommentieren, **damit ich** meinen Freunden Empfehlungen geben kann und meine Favoriten wiederfinde.

### 📓 User Story 3: Tagebuch (Journal)

**Als** reflektierender Mensch, **möchte ich** meine Gedanken zu besonderen Tagen als kurze Sprachmemos festhalten, **damit ich** später nachvollziehen kann, wie ich mich gefühlt habe und was wichtig war.

### 🏛️ User Story 4: Sehenswürdigkeiten-Reiseführer

**Als** Reisender, **möchte ich** eine Liste von Sehenswürdigkeiten mit Bewertungen und Fotos führen, **damit ich** später meine Reise dokumentieren und anderen Tipps geben kann.

### 📖 User Story 5: Bücherliste

**Als** Leseratte, **möchte ich** jedes Buch, das ich lese, kurz rezensieren, **damit ich** später weiß, was mir gefallen hat und welche Themen mich bewegt haben.

### 🏨 User Story 6: Hotelbewertung

**Als** Vielreisende\*r, **möchte ich** eine Liste meiner Hotelaufenthalte führen, **damit ich** mich an gute (und schlechte) Unterkünfte erinnere und beim nächsten Mal gezielter buchen kann.

### 🚧 User Story 7: Handwerker-/Dienstleisterliste

**Als** Hausbesitzer\*in, **möchte ich** festhalten, welche Handwerker und Dienstleister bei mir waren, **damit ich** weiß, wen ich wieder beauftragen oder vermeiden sollte.

### 🎭 User Story 8: Veranstaltungs-/Konzertliste

**Als** Kulturfan, **möchte ich** Konzerte, Theaterstücke und Events, die ich besucht habe, bewerten, **damit ich** mich daran erinnern kann, was mich begeistert oder enttäuscht hat.

### 📸 User Story 9: Fotospot-Liste

**Als** Hobbyfotograf\*in, **möchte ich** die besten Fotospots dokumentieren, **damit ich** eine inspirierende Sammlung für spätere Touren oder andere Fotofans habe.

### 🥂 User Story 10: Weine / Getränke

**Als** Weinliebhaber\*in, **möchte ich** die Weine und Getränke, die ich probiere, bewerten, **damit ich** weiß, welche mir geschmeckt haben und welche ich erneut kaufen würde.
