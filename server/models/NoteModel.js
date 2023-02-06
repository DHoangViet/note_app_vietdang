import mongoose from "mongoose";

const noteSchema = mongoose.Schema({
    content: {
        type: String,
    },
    folderId: {
        type: String,
        required: true,
    }
}, { timestamps: true } );

const NoteModel = mongoose.model('Note', noteSchema);
export default NoteModel;