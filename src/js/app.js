import { initializeUI } from './ui.js';
import { initializeAuth } from './auth.js';

function initializeApp() {
    initializeUI();
    initializeAuth();
}

initializeApp(); 