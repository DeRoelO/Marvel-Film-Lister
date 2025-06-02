import { initializeAuth } from './auth.js';
import { initializeDatabase } from './database.js';
import { initializeUI } from './ui.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';

// Initialize Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
    authDomain: "marvel-viewing-lister.firebaseapp.com",
    projectId: "marvel-viewing-lister",
    storageBucket: "marvel-viewing-lister.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize all components
document.addEventListener('DOMContentLoaded', () => {
    initializeAuth(app);
    initializeDatabase(app);
    initializeUI();
}); 