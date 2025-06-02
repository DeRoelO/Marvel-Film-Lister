import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

let auth = null;
let userId = null;

export function initializeAuth(app) {
    if (!app) {
        console.error("Firebase app is not available. Authentication will not work.");
        return;
    }
    auth = getAuth(app);
    return auth;
}

export async function signInUser() {
    if (!auth) {
        return { error: "Firebase Auth niet beschikbaar." };
    }
    try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }
        return { success: true };
    } catch (error) {
        console.error("Error signing in:", error);
        return { error: "Authenticatie mislukt." };
    }
}

export function onAuthStateChange(callback) {
    if (!auth) return;
    return onAuthStateChanged(auth, (user) => {
        userId = user ? user.uid : null;
        callback(user);
    });
}

export function getUserId() {
    return userId;
} 