import { movies } from '../data/movies.js';
import { series } from '../data/series.js';
import { saveWatchedStatusToFirestore } from './database.js';

let lastSelectedFilmId = null;

export function initializeUI() {
    const filmSelector = document.getElementById('filmSelector');
    const generateWatchlistBtn = document.getElementById('generateWatchlistBtn');
    const outputArea = document.getElementById('outputArea');
    const outputTitle = document.getElementById('outputTitle');

    populateDropdown();

    generateWatchlistBtn.addEventListener('click', () => {
        outputTitle.textContent = 'Chronologische Kijklijst (opbouw naar geselecteerde item):';
        const selectedItemId = filmSelector.value.includes('_') || isNaN(parseInt(filmSelector.value)) ? filmSelector.value : parseInt(filmSelector.value);
        lastSelectedFilmId = selectedItemId;
        if (!selectedItemId) {
            outputArea.innerHTML = '<p class="text-center">Selecteer alstublieft een item.</p>';
            return;
        }
        
        // Debug output
        const allItems = [...movies, ...series];
        debugWatchlistGeneration(selectedItemId, allItems);
        
        outputArea.innerHTML = generateChronologicalWatchlistHtml(selectedItemId, allItems);
    });

    outputArea.addEventListener('change', async (event) => {
        if (event.target.classList.contains('film-watched-checkbox')) {
            const itemIdValue = event.target.dataset.filmId;
            const itemId = itemIdValue.includes('_') || isNaN(parseInt(itemIdValue)) ? itemIdValue : parseInt(itemIdValue);
            const isWatched = event.target.checked;

            const allItems = [...movies, ...series];
            const itemInDb = allItems.find(f => f.id === itemId);
            if (itemInDb) {
                itemInDb.watched = isWatched;
            }
            
            await saveWatchedStatusToFirestore(itemId, isWatched);

            if (lastSelectedFilmId) {
                outputArea.innerHTML = generateChronologicalWatchlistHtml(lastSelectedFilmId, allItems);
            }
        }
    });
}

function populateDropdown() {
    const filmSelector = document.getElementById('filmSelector');
    filmSelector.innerHTML = ''; 
    const allEntries = [...movies, ...series].sort((a, b) => {
        const idA = typeof a.id === 'number' ? a.id : parseFloat(a.id.toString().replace('S_', ''));
        const idB = typeof b.id === 'number' ? b.id : parseFloat(b.id.toString().replace('S_', ''));
        if (idA < 100 && idB >=100) return -1; // Films voor series
        if (idA >= 100 && idB < 100) return 1; // Series na films
        if (idA !== idB) return idA - idB;
        return a.title.localeCompare(b.title);
    });

    allEntries.forEach(film => {
        if (film.id === 39 && allEntries.some(f => f.id === 28)) return; 
        
        const option = document.createElement('option');
        option.value = film.id; 
        option.textContent = `${film.id}. ${film.title} (${film.story_year})`;
        filmSelector.appendChild(option);
    });

    if (allEntries.length > 0 && !lastSelectedFilmId) {
        lastSelectedFilmId = allEntries[0].id; 
    }
    if(lastSelectedFilmId) filmSelector.value = lastSelectedFilmId;
}

function getFilmById(id, filmData) {
    return filmData.find(film => film.id === id);
}

function collectAllFilmsForWatchlist(itemId, filmData, collectedItemsSet) {
    const item = getFilmById(itemId, filmData);
    if (!item) {
        return;
    }

    // Voeg het item toe aan de set als het nog niet erin zit
    if (!collectedItemsSet.has(item.id)) {
        collectedItemsSet.add(item.id);
    }

    // Verwerk de prerequisites
    if (item.prerequisites && item.prerequisites.length > 0) {
        item.prerequisites.forEach(prereqId => {
            collectAllFilmsForWatchlist(prereqId, filmData, collectedItemsSet);
        });
    }
}

function getSortableYear(storyYear) {
    if (!storyYear || typeof storyYear !== 'string') return 99999; 
    if (storyYear.includes('Nog niet bekend')) return 99998; 
    
    const yearMatch = storyYear.match(/(\d{4}(\.\d+)?)/);
    if (yearMatch) {
        return parseFloat(yearMatch[1]);
    }
    if (storyYear.toLowerCase().includes('serie')) return 99997; 
    return 99999; 
}

function generateChronologicalWatchlistHtml(selectedItemId, filmData) {
    const collectedItemIdsSet = new Set();
    const optionalItemsMap = new Map(); // Maps prerequisite ID to optional items
    
    // Verzamel eerst alle benodigde items
    collectAllFilmsForWatchlist(selectedItemId, filmData, collectedItemIdsSet);
    collectedItemIdsSet.add(selectedItemId);

    // Verzamel optionele items en koppel ze aan hun prerequisites
    filmData.forEach(item => {
        if (item.optional_prerequisites && item.optional_prerequisites.length > 0) {
            item.optional_prerequisites.forEach(prereqId => {
                if (!optionalItemsMap.has(prereqId)) {
                    optionalItemsMap.set(prereqId, []);
                }
                optionalItemsMap.get(prereqId).push(item);
            });
        }
    });

    let itemsToDisplay = Array.from(collectedItemIdsSet).map(id => getFilmById(id, filmData)).filter(item => item != null);

    // Sorteer de items
    itemsToDisplay.sort((a, b) => {
        const yearA = getSortableYear(a.story_year);
        const yearB = getSortableYear(b.story_year);

        if (yearA !== yearB) return yearA - yearB;
        
        const idA = typeof a.id === 'number' ? a.id : parseFloat(a.id.toString().replace('S_', ''));
        const idB = typeof b.id === 'number' ? b.id : parseFloat(b.id.toString().replace('S_', ''));
        if (idA < 100 && idB >= 100) return -1; 
        if (idA >= 100 && idB < 100) return 1; 
        if (idA !== idB) return idA - idB;
        return a.title.localeCompare(b.title);
    });

    if (itemsToDisplay.length === 0) return '<p class="text-center">Geen items gevonden voor de kijklijst.</p>';

    // Calculate total runtime
    const totalRuntime = itemsToDisplay.reduce((total, item) => {
        return total + (item.runtime || 0);
    }, 0);

    const hours = Math.floor(totalRuntime / 60);
    const minutes = totalRuntime % 60;
    const runtimeText = `${hours} uur en ${minutes} minuten`;

    // Generate HTML for the watchlist
    let html = '<div class="watchlist">';
    
    // Add mandatory items
    html += '<div class="mandatory-items">';
    itemsToDisplay.forEach(item => {
        const isOptional = optionalItemsMap.has(item.id);
        html += `
            <div class="watchlist-item ${isOptional ? 'optional' : ''}">
                <div class="item-title">${isOptional ? '(Optioneel) ' : ''}${item.title}</div>
                <div class="item-year">${item.story_year}</div>
                <div class="item-platform">${item.platform}</div>
                <div class="item-runtime">${item.runtime} min</div>
            </div>
        `;
    });
    html += '</div>';

    // Add total runtime
    html += `<div class="total-runtime">Totale speelduur: ${runtimeText}</div>`;
    html += '</div>';

    return html;
}

function debugWatchlistGeneration(selectedItemId, filmData) {
    const collectedItemIdsSet = new Set();
    collectAllFilmsForWatchlist(selectedItemId, filmData, collectedItemIdsSet);
    collectedItemIdsSet.add(selectedItemId);

    // Voeg alle One-Shots toe aan de set, ongeacht prerequisites
    filmData.forEach(item => {
        if (item.title.includes('One-Shot')) {
            collectedItemIdsSet.add(item.id);
        }
    });

    let itemsToDisplay = Array.from(collectedItemIdsSet).map(id => getFilmById(id, filmData)).filter(item => item != null);

    itemsToDisplay.sort((a, b) => {
        const yearA = getSortableYear(a.story_year);
        const yearB = getSortableYear(b.story_year);

        if (yearA !== yearB) return yearA - yearB;
        
        const idA = typeof a.id === 'number' ? a.id : parseFloat(a.id.toString().replace('S_', ''));
        const idB = typeof b.id === 'number' ? b.id : parseFloat(b.id.toString().replace('S_', ''));
        if (idA < 100 && idB >= 100) return -1; 
        if (idA >= 100 && idB < 100) return 1; 
        if (idA !== idB) return idA - idB;
        return a.title.localeCompare(b.title);
    });

    console.log('Debug: Chronologische kijklijst voor item ID', selectedItemId);
    itemsToDisplay.forEach(item => {
        console.log(`${item.story_year}: ${item.title} (ID: ${item.id})`);
    });
    return itemsToDisplay;
}

// Helper functie om prerequisites toe te voegen
function addPrerequisites(itemId, isOptional = false) {
    const item = movies.find(m => m.id === itemId);
    if (!item) return;

    // Als het item al als verplicht is gemarkeerd, negeer dan de optionele markering
    if (mandatoryItems.has(itemId)) {
        return;
    }

    if (isOptional) {
        optionalItems.add(itemId);
    } else {
        mandatoryItems.add(itemId);
        // Verwijder het item uit optionele items als het nu verplicht is
        optionalItems.delete(itemId);
    }

    // Voeg verplichte prerequisites toe
    if (item.prerequisites) {
        item.prerequisites.forEach(prereqId => {
            addPrerequisites(prereqId, false);
        });
    }

    // Voeg optionele prerequisites toe
    if (item.optional_prerequisites) {
        item.optional_prerequisites.forEach(prereqId => {
            // Alleen toevoegen als het nog niet verplicht is
            if (!mandatoryItems.has(prereqId)) {
                addPrerequisites(prereqId, true);
            }
        });
    }
} 