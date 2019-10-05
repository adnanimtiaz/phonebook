const mongoose = require("mongoose");

const PhonebookSchema = mongoose.Schema({
    full_name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    created_date:{
        type:Date,
        default:Date.now
    },
    last_login:{
        type:Date
    },
    status:{
        type:Boolean,
        default:true,
    },
    contacts:[
        {
            name: {
                type:String,
                required: true
            },
            number:{
                type:String, 
                required:true
            },
            created_date:{
                type:Date,
                default:Date.now
            }
        }
    ]
});

module.exports = mongoose.model("Phonebook", PhonebookSchema);