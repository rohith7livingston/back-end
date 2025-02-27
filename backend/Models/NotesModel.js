const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    email: { type: String, required: true },  // NOT unique
    detail: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

// Correct model name
const NoteModel = mongoose.model('Notes', NoteSchema);
module.exports = NoteModel;
