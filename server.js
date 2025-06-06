import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Data file path
const DATA_FILE = path.join(__dirname, 'data', 'users.json');

// Ensure data file exists
async function ensureDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, JSON.stringify({ users: [] }));
    }
}

// Read data
async function readData() {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

// Write data
async function writeData(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// API Routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const data = await readData();
        
        if (data.users.some(u => u.username === username)) {
            return res.status(400).json({ error: 'Gebruikersnaam bestaat al' });
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            password, // In een echte app zou dit gehashed worden
            watchedItems: []
        };

        data.users.push(newUser);
        await writeData(data);
        
        res.json({ id: newUser.id, username: newUser.username });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const data = await readData();
        
        const user = data.users.find(u => u.username === username && u.password === password);
        if (!user) {
            return res.status(401).json({ error: 'Ongeldige gebruikersnaam of wachtwoord' });
        }

        res.json({ id: user.id, username: user.username });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/watched/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const data = await readData();
        
        const user = data.users.find(u => u.username === username);
        if (!user) {
            return res.status(404).json({ error: 'Gebruiker niet gevonden' });
        }

        res.json(user.watchedItems);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/watched/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { watchedItems } = req.body;
        const data = await readData();
        
        const userIndex = data.users.findIndex(u => u.username === username);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'Gebruiker niet gevonden' });
        }

        data.users[userIndex].watchedItems = watchedItems;
        await writeData(data);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Start server
async function startServer() {
    await ensureDataFile();
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

startServer(); 