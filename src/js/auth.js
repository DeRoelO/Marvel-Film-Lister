import { createUser, loginUser, getCurrentUser, setCurrentUser, logoutUser } from '../data/users.js';
import { initializeUI } from './ui.js';

export function initializeAuth() {
    const authContainer = document.getElementById('authContainer');
    const mainContent = document.getElementById('mainContent');
    const userInfo = document.getElementById('userInfo');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    const authButtons = document.getElementById('authButtons');

    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        showMainContent(currentUser.username);
    } else {
        // Show main content without login
        showMainContent();
    }

    // Event listeners for auth buttons
    document.getElementById('showLoginBtn').addEventListener('click', showLoginForm);
    document.getElementById('showRegisterBtn').addEventListener('click', showRegisterForm);
    logoutBtn.addEventListener('click', handleLogout);
}

function showLoginForm() {
    const authContainer = document.getElementById('authContainer');
    const mainContent = document.getElementById('mainContent');
    
    authContainer.innerHTML = `
        <div class="auth-form">
            <h2>Inloggen</h2>
            <form id="loginForm">
                <div class="form-group">
                    <label for="loginUsername">Gebruikersnaam:</label>
                    <input type="text" id="loginUsername" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Wachtwoord:</label>
                    <input type="password" id="loginPassword" required>
                </div>
                <button type="submit">Inloggen</button>
            </form>
            <p>Nog geen account? <a href="#" id="showRegisterBtn">Registreren</a></p>
            <p><a href="#" id="continueWithoutLogin">Doorgaan zonder inloggen</a></p>
        </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('showRegisterBtn').addEventListener('click', showRegisterForm);
    document.getElementById('continueWithoutLogin').addEventListener('click', () => showMainContent());
    
    authContainer.style.display = 'flex';
    mainContent.style.display = 'none';
}

function showRegisterForm() {
    const authContainer = document.getElementById('authContainer');
    const mainContent = document.getElementById('mainContent');
    
    authContainer.innerHTML = `
        <div class="auth-form">
            <h2>Registreren</h2>
            <form id="registerForm">
                <div class="form-group">
                    <label for="registerUsername">Gebruikersnaam:</label>
                    <input type="text" id="registerUsername" required>
                </div>
                <div class="form-group">
                    <label for="registerPassword">Wachtwoord:</label>
                    <input type="password" id="registerPassword" required>
                </div>
                <button type="submit">Registreren</button>
            </form>
            <p>Al een account? <a href="#" id="showLoginBtn">Inloggen</a></p>
            <p><a href="#" id="continueWithoutLogin">Doorgaan zonder inloggen</a></p>
        </div>
    `;

    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('showLoginBtn').addEventListener('click', showLoginForm);
    document.getElementById('continueWithoutLogin').addEventListener('click', () => showMainContent());
    
    authContainer.style.display = 'flex';
    mainContent.style.display = 'none';
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const user = loginUser(username, password);
        setCurrentUser(user);
        showMainContent(username);
    } catch (error) {
        alert(error.message);
    }
}

function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    try {
        createUser(username, password);
        const user = loginUser(username, password);
        setCurrentUser(user);
        showMainContent(username);
    } catch (error) {
        alert(error.message);
    }
}

function handleLogout() {
    logoutUser();
    showMainContent();
}

async function showMainContent(username = null) {
    const authContainer = document.getElementById('authContainer');
    const mainContent = document.getElementById('mainContent');
    const userInfo = document.getElementById('userInfo');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const authButtons = document.getElementById('authButtons');
    
    authContainer.style.display = 'none';
    mainContent.style.display = 'block';
    
    if (username) {
        userInfo.style.display = 'flex';
        usernameDisplay.textContent = username;
        authButtons.style.display = 'none';
    } else {
        userInfo.style.display = 'none';
        authButtons.style.display = 'flex';
    }

    // Reinitialize UI to load watched status
    await initializeUI();
} 