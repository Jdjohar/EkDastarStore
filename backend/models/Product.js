const mongoose = require('mongoose')
const { Schema } = mongoose;

const productSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description: {
        type: String,
        required: false,
    },
    CategoryName: {
        type: String,
        required: true,
    },
    img: {
        type: String,
        required: true,
    },
    featured: {
        type: Boolean,
        required: false,
        default: 'false'
    },
    options: []

})
module.exports = mongoose.model('food_item', productSchema)