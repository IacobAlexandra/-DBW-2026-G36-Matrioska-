import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const userSchema = new mongoose.Schema({
    profilePic: { type: String },
    score: { type: Number, default: 0 },
    foundWords: { type: Number, default: 0 },
    wrongWords: { type: Number, default: 0 },
    playTime: { type: Number, default: 0 }
});

// Add the plugin to automatically handle encryption and authentication methods
userSchema.plugin(passportLocalMongoose.default);

export default mongoose.model("User", userSchema);