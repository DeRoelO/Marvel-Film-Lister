const API_URL = 'http://localhost:3000/api';
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

export async function createUser(username, password) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registratie mislukt');
        }

        const user = await response.json();
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    } catch (error) {
        throw error;
    }
}

export async function loginUser(username, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Inloggen mislukt');
        }

        const user = await response.json();
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    } catch (error) {
        throw error;
    }
}

export async function saveWatchedItems(username, watchedItems) {
    try {
        const response = await fetch(`${API_URL}/watched/${username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ watchedItems })
        });

        if (!response.ok) {
            throw new Error('Opslaan mislukt');
        }
    } catch (error) {
        console.error('Error saving watched items:', error);
        throw error;
    }
}

export async function getWatchedItems(username) {
    try {
        const response = await fetch(`${API_URL}/watched/${username}`);
        
        if (!response.ok) {
            throw new Error('Ophalen mislukt');
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting watched items:', error);
        return [];
    }
}

export function getCurrentUser() {
    return currentUser;
}

export function setCurrentUser(user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
}

export function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
} 