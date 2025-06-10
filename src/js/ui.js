import { movies } from '../data/movies.js';
import { series } from '../data/series.js';
import { getCurrentUser, saveWatchedItems, getWatchedItems } from '../data/users.js';

let lastSelectedFilmId = null;

// Helper functie om bekeken status te laden
async function loadWatchedStatus() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        try {
            const watchedItems = await getWatchedItems(currentUser.username);
            const allItems = [...movies, ...series];
            if (Array.isArray(watchedItems)) {
                watchedItems.forEach(itemId => {
                    const item = allItems.find(f => f.id === itemId);
                    if (item) {
                        item.watched = true;
                    }
                });
            }
        } catch (error) {
            console.error('Error loading watched status:', error);
        }
    }
}

export async function initializeUI() {
    const filmSelector = document.getElementById('filmSelector');
    const generateWatchlistBtn = document.getElementById('generateWatchlistBtn');
    const clearWatchlistBtn = document.getElementById('clearWatchlistBtn');
    const outputArea = document.getElementById('outputArea');
    const outputTitle = document.getElementById('outputTitle');

    // Load watched status from localStorage
    await loadWatchedStatus();

    populateDropdown();

    generateWatchlistBtn.addEventListener('click', () => {
        outputTitle.textContent = 'Chronologische Kijklijst (opbouw naar geselecteerde item):';
        const selectedItemId = filmSelector.value.includes('_') || isNaN(parseInt(filmSelector.value)) ? filmSelector.value : parseInt(filmSelector.value);
        lastSelectedFilmId = selectedItemId;
        if (!selectedItemId) {
            outputArea.innerHTML = '<p class="text-center">Selecteer alstublieft een item.</p>';
            return;
        }
        
        const allItems = [...movies, ...series];
        outputArea.innerHTML = generateChronologicalWatchlistHtml(selectedItemId, allItems);
    });

    clearWatchlistBtn.addEventListener('click', () => {
        outputArea.innerHTML = '';
        outputTitle.textContent = 'Selecteer een film of serie om een kijklijst te genereren';
        lastSelectedFilmId = null;
        filmSelector.value = '';
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
            
            const currentUser = getCurrentUser();
            if (currentUser) {
                try {
                    const watchedItems = await getWatchedItems(currentUser.username);
                    if (isWatched) {
                        if (!watchedItems.includes(itemId)) {
                            watchedItems.push(itemId);
                        }
                    } else {
                        const index = watchedItems.indexOf(itemId);
                        if (index > -1) {
                            watchedItems.splice(index, 1);
                        }
                    }
                    await saveWatchedItems(currentUser.username, watchedItems);
                } catch (error) {
                    console.error('Error updating watched status:', error);
                }
            }

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
    const mandatoryItems = new Set();
    const optionalItems = new Set();
    
    // Helper functie om prerequisites toe te voegen
    function addPrerequisites(itemId, isOptional = false) {
        const item = getFilmById(itemId, filmData);
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

    // Verzamel eerst alle benodigde items
    addPrerequisites(selectedItemId, false);
    mandatoryItems.add(selectedItemId);

    // Controleer of er items zijn die verplicht zijn voor andere items in de lijst
    filmData.forEach(item => {
        if (item.prerequisites) {
            item.prerequisites.forEach(prereqId => {
                if (optionalItems.has(prereqId)) {
                    // Als een optioneel item een verplichte prerequisite is, maak het verplicht
                    optionalItems.delete(prereqId);
                    mandatoryItems.add(prereqId);
                }
            });
        }
    });

    let itemsToDisplay = [...mandatoryItems, ...optionalItems]
        .map(id => getFilmById(id, filmData))
        .filter(item => item != null);

    // Sorteer de items
    itemsToDisplay.sort((a, b) => {
        const yearA = getSortableYear(a.story_year);
        const yearB = getSortableYear(b.story_year);

        if (yearA !== yearB) return yearA - yearB;
        return a.title.localeCompare(b.title);
    });

    // Bereken totale en resterende speelduur
    const totalRuntime = itemsToDisplay.reduce((sum, item) => sum + (item.runtime || 0), 0);
    const remainingRuntime = itemsToDisplay
        .filter(item => !item.watched)
        .reduce((sum, item) => sum + (item.runtime || 0), 0);

    // Update runtime displays
    document.getElementById('totalRuntime').textContent = formatRuntime(totalRuntime);
    document.getElementById('remainingRuntime').textContent = formatRuntime(remainingRuntime);

    let html = '<div class="watchlist">';
    
    itemsToDisplay.forEach(item => {
        const isOptional = optionalItems.has(item.id);
        const isSelected = item.id === selectedItemId;
        
        html += `
            <div class="watchlist-item ${isOptional ? 'optional' : ''} ${isSelected ? 'selected' : ''}">
                <input type="checkbox" 
                       class="film-watched-checkbox" 
                       data-film-id="${item.id}" 
                       ${item.watched ? 'checked' : ''}>
                ${isOptional ? '<div class="optional-badge">Optioneel</div>' : ''}
                ${isSelected ? '<div class="selected-badge">Geselecteerd</div>' : ''}
                <div class="item-content">
                    <div class="item-title">${item.title}</div>
                    ${item.notes ? `<div class="item-note">${item.notes}</div>` : ''}
                </div>
                <div class="item-icons">
                    ${item.icons ? item.icons.map(icon => `
                        <img src="src/assets/${icon}" 
                             alt="${icon.replace('.ico', '')}" 
                             title="${icon.replace('.ico', '')}" 
                             class="item-icon">
                    `).join('') : ''}
                </div>
                <div class="item-year">${item.story_year}</div>
                <div class="item-runtime">${formatRuntime(item.runtime)}</div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

// Helper functie om runtime te formatteren
function formatRuntime(minutes) {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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