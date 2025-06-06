# Marvel Viewing Lister

Een webapplicatie om een chronologische kijklijst te genereren voor Marvel films en series, inclusief One-Shots en crossovers.

## Functionaliteiten

- Chronologische kijklijst genereren op basis van een geselecteerde film of serie
- Automatische inclusie van alle benodigde prequels en One-Shots
- Sortering op basis van verhaaljaar en release volgorde
- Markeren van bekeken content (met server-side persistentie)
- Ondersteuning voor verschillende universums (MCU, Fox X-Men, Sony, etc.)
- Gedetailleerde notities over de relaties tussen films/series
- Gebruikersauthenticatie en persoonlijke kijklijsten
- Totaal en resterende kijktijd berekening

## Installatie

1. Clone de repository:
```bash
git clone [repository-url]
cd marvel-viewing-lister
```

2. Installeer de dependencies:
```bash
npm install
```

3. Start de server:
```bash
npm start
```

4. Open de applicatie in je browser op `http://localhost:3000`

## Gebruik

1. Log in of registreer een account
2. Selecteer een film of serie uit de dropdown lijst
3. Klik op "Genereer Kijklijst" om een chronologische kijklijst te genereren
4. De lijst toont alle benodigde films en series in chronologische volgorde
5. Gebruik de checkboxes om bij te houden welke items je al hebt bekeken
6. Je kijklijst wordt automatisch opgeslagen en blijft behouden na uitloggen

## Data Structuur

Elke film/serie in de database bevat:
- ID: Unieke identifier
- Titel: Naam van de film/serie
- Story Year: Het jaar waarin het verhaal zich afspeelt
- Platform: Waar de content te bekijken is
- Universe Tags: Bijbehorende universums (MCU, Fox X-Men, etc.)
- Prerequisites: IDs van films/series die nodig zijn voor context
- Notes: Extra informatie over de relatie met andere content

## Technische Details

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js met Express
- Data Persistence: Server-side JSON bestanden
- Authenticatie: Server-side sessie management
- Development Server: Node.js Express server

## Toekomstige Verbeteringen

- [ ] Toevoegen van meer One-Shots en specials
- [ ] Verbeterde visuele weergave van universe relaties
- [ ] Mogelijkheid om meerdere kijklijsten te maken
- [ ] Export functionaliteit voor kijklijsten
- [ ] Verbeterde gebruikersinterface en responsive design 