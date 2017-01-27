const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    time: {
        type: Number,
        default: 0
    },
    ingredients: {
        type: [String],
        required: true
    },
    liquid: {
        type: Boolean, // liquid or no
        default: false
    },
    mealcategory_id: {
        type: Schema.Types.ObjectId, // predefined in mealCategory
        ref: 'MealCategory'
    },
    weight: {
        type: Number, // if it's a liquid => ml else gr
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    restaurant_id: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

const Item = mongoose.model('Item', ItemSchema);