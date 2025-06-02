# Marvel Viewing Lister

Een webapplicatie om een chronologische kijklijst te genereren voor Marvel films en series, inclusief One-Shots en crossovers.

## Functionaliteiten

- Chronologische kijklijst genereren op basis van een geselecteerde film of serie
- Automatische inclusie van alle benodigde prequels en One-Shots
- Sortering op basis van verhaaljaar en release volgorde
- Markeren van bekeken content
- Ondersteuning voor verschillende universums (MCU, Fox X-Men, Sony, etc.)
- Gedetailleerde notities over de relaties tussen films/series

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

3. Start de development server:
```bash
npm start
```

4. Open de applicatie in je browser op `http://localhost:8080`

## Gebruik

1. Selecteer een film of serie uit de dropdown lijst
2. Klik op "Genereer Kijklijst" om een chronologische kijklijst te genereren
3. De lijst toont alle benodigde films en series in chronologische volgorde
4. Gebruik de checkboxes om bij te houden welke items je al hebt bekeken

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
- Database: Firebase Firestore voor het opslaan van bekeken status
- Development Server: http-server

## Toekomstige Verbeteringen

- [ ] Toevoegen van meer One-Shots en specials
- [ ] Verbeterde visuele weergave van universe relaties
- [ ] Mogelijkheid om meerdere kijklijsten te maken
- [ ] Export functionaliteit voor kijklijsten 