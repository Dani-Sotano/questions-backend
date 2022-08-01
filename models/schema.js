const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: String,
    goals: [{
        name: String,
        questions: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Questions"
            }]
        }]
});

const questionSchema = new mongoose.Schema({
    id: Number,
    question: {
        type: String,
        required: true
    }
})
const Question = mongoose.model('Questions', questionSchema);
const Category = mongoose.model('Category', categorySchema);
module.exports = {Question, Category}
