const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // Required for WebSockets
const { Server } = require('socket.io'); // Import Socket.io
const summarizeText = require("./Controller/Summarizer");
const NoteModel = require("./Models/NotesModel");
const collabModel = require('./Models/CollabModel');

const app = express();
const server = http.createServer(app); // Create an HTTP server

const io = require('socket.io')(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb+srv://fareedshaik:22K61A05F4@cluster0.qgzmn.mongodb.net/Users')
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

app.post('/posting', async (req, res) => {
    try {
        const { name, email, password, confirmpassword } = req.body;

        if (password !== confirmpassword) {
            return res.status(400).json({ error: "Passwords do not match!" });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/save-note", async (req, res) => {
    try {
        const { title, email, detail } = req.body;

        if (!title || !email || !detail) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        const newNote = new NoteModel({ title, email, detail });
        await newNote.save();

        res.status(201).json({ message: "Note saved successfully", note: newNote });
    } catch (error) {
        console.error("Error Saving Note:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

app.get("/get-notes", async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: "Email is required to fetch notes!" });
    }

    try {
        const notes = await NoteModel.find({ email });
        res.status(200).json(notes);
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/summarize', async (req, res) => {
    const text = req.body.text_to_summarize;

    try {
        const response = await summarizeText(text);
        res.send(response);
    } catch (error) {
        console.log(error.message);
    }
});

app.post('/collab-create', async (req, res) => {
    try {
        const { noteId, passCode, title, detail, adminEmail } = req.body;

        if (!noteId || !passCode || !title || !detail || !adminEmail) {
            return res.status(400).json({ error: 'All fields are required, including admin email.' });
        }

        const existingNote = await collabModel.findOne({ noteId });
        if (existingNote) {
            return res.status(400).json({ error: 'Note ID already exists. Choose a different ID.' });
        }

        const newNote = new collabModel({
            noteId,
            passCode,
            title,
            detail,
            admins: [adminEmail]
        });

        await newNote.save();
        res.status(201).json({ message: 'Note created successfully!', note: newNote });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post("/check-user", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "User not found. Please register." });
        }

        res.status(200).json({ message: "Login successful!" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post('/collab-join', async (req, res) => {
    try {
        const { noteId, passCode } = req.body;

        if (!noteId || !passCode) {
            return res.status(400).json({ error: "Both Note ID and Passcode are required." });
        }

        const existingNote = await collabModel.findOne({ noteId, passCode });

        if (!existingNote) {
            return res.status(404).json({ error: "Invalid Note ID or Passcode." });
        }

        res.status(200).json({ message: "Valid Note ID and Passcode!" });
    } catch (error) {
        console.error("Error validating collab note:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

  io.on('connection', (socket) => {
    console.log("User connected:", socket.id);
  
    socket.on('joinNote', (noteId) => {
        socket.join(noteId);
        console.log(`User joined note ${noteId}`);
        socket.emit('joinedRoom', noteId);
      });
      
  
    socket.on('updateNote', ({ noteId, content }) => {
      socket.to(noteId).emit('noteUpdate', content);
    });
  
    socket.on('disconnect', () => {
      console.log("User disconnected:", socket.id);
    });
  });
  

const PORT = 3001;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
