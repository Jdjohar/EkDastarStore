const mongoose = require('mongoose')
const { Schema } = mongoose;

const productSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description: {
        type: String,
        required: true,
    },
    CategoryName: {
        type: String,
        required: true,
    },
    img: {
        type: String,
        required: true,
    },
    options: []

})
module.exports = mongoose.model('food_item', productSchema)