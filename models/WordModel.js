import mongoose from 'mongoose';

const wordSchema = new mongoose.Schema({
    masterWord: { type: String, required: true },
    validSubWords: [{ type: String }] 
});

const WordModel = mongoose.model("Word", wordSchema);
export default WordModel;