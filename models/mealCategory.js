const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MealCategorySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    restaurant_ids: [{
        type: Schema.Types.ObjectId,
        required: true
    }]
});

const MealCategory = mongoose.model('MealCategory', MealCategorySchema);