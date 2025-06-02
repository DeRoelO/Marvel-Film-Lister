import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getUserId } from './auth.js';
import { movies } from '../data/movies.js';
import { series } from '../data/series.js';

let db = null;
let appId = 'default-app-id-marvel-viewer';

export function initializeDatabase(app) {
    if (!app) {
        console.error("Firebase app is not available. Database operations will not work.");
        return;
    }
    db = getFirestore(app);
    
    // Load initial data
    const allItems = [...movies, ...series];
    loadWatchedStatusesFromFirestore(allItems);
    
    return db;
}

export async function loadWatchedStatusesFromFirestore(filmDatabase) {
    const userId = getUserId();
    if (!userId || !db) {
        filmDatabase.forEach(film => film.watched = film.initialWatchedStatus !== undefined ? film.initialWatchedStatus : false);
        return;
    }

    try {
        const watchedFilmsCol = collection(db, "artifacts", appId, "users", userId, "watchedFilms");
        const snapshot = await getDocs(watchedFilmsCol);
        
        const firestoreWatched = {};
        snapshot.forEach(doc => {
            firestoreWatched[doc.id] = doc.data().watched;
        });

        filmDatabase.forEach(film => {
            const filmKey = film.id.toString();
            if (firestoreWatched[filmKey] !== undefined) {
                film.watched = firestoreWatched[filmKey];
            } else {
                film.watched = film.initialWatchedStatus !== undefined ? film.initialWatchedStatus : false;
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Error loading watched statuses:", error);
        return { error: "Fout bij laden 'bekeken' status." };
    }
}

export async function saveWatchedStatusToFirestore(filmId, isWatched) {
    const userId = getUserId();
    if (!userId || !db) return { error: "Database niet beschikbaar" };
    
    try {
        const filmDocRef = doc(db, "artifacts", appId, "users", userId, "watchedFilms", filmId.toString());
        await setDoc(filmDocRef, { watched: isWatched });
        return { success: true };
    } catch (error) {
        console.error("Error saving watched status for film " + filmId + ":", error);
        return { error: "Fout bij opslaan 'bekeken' status" };
    }
} 