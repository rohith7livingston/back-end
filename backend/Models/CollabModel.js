const mongoose = require('mongoose');

const CollabSchema = new mongoose.Schema({
    noteId: { type: String, required: true, unique: true },
    passCode: { type: Number, required: true },
    title: { type: String, required: true },
    detail: { type: String, required: true },
    admins: [{ type: String, required: true }] // Stores email IDs of admins
}, { timestamps: true });

// Create and export the model
const collabModel = mongoose.model('Collab', CollabSchema);
module.exports = collabModel;
