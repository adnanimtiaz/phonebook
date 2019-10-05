const express = require("express");
const jwt = require("jsonwebtoken");
const Joi = require("@hapi/joi");
const util = require("../../utility/util");
const Phonebook = require("../../models/phonebook");
const router = express.Router();

// ** @GET API: Fetch all contacts
// ** @Params: page_number
// ** @Response: Contacts Array list
router.get("/:page", verifyAccessToken,  (req, res) =>{
    jwt.verify(req.token, process.env.SECRET_KEY, (err, data) => {
        if(data){
            try{
                const resultPerPage = 4; 
                const currentPage = req.params.page || 1; 

                Phonebook.findOne({_id: data.id}, {contacts:{$slice:[((resultPerPage * currentPage) - resultPerPage), resultPerPage]}})
                    .then(phonebook => {
                        if(phonebook){
                            util.sendResponse(true, util.getResStatus(phonebook.contacts), res, util.getResMessage(phonebook.contacts));
                        }
                    });
            } catch (err){
                util.sendExceptionResponse(res, err);
                return;
            }
        }else{
            util.sendExceptionResponse(res, "Invalid access token!");
            return;
        }
    });
});


// *** POST API: Add new contact
// ** @Params: user_id, contact name, phone_numbers[@array of obj contact number]
// ** @Response: message (success/fail)
router.post("/", verifyAccessToken, (req, res) => {
    jwt.verify(req.token, process.env.SECRET_KEY, (err, data) => {
        if(data){
            if(validateContact(req, res)){
                Phonebook.findOne({_id:data.id})
                .then(phonebook => {
                    phonebook.contacts.push({
                        name:req.body.name,
                        number:req.body.number
                    });

                    try{
                        phonebook.save().then(phonebook => {
                            util.sendResponse(true, util.getResStatus(phonebook.contacts), res, "Contact has been added against your account!");
                            return;
                        });
                    } catch (err){
                        util.sendExceptionResponse(res, err);
                        return;
                    }
                });
            }
        }else{
            util.sendExceptionResponse(res, "Invalid access token!");
            return;
        }
    });
});


// ** @DELETE API: Delete contact by contact id
// ** @Params: contact_id
// ** @Response: message (success/fail)
router.delete("/:id", verifyAccessToken, (req, res) =>{
    jwt.verify(req.token, process.env.SECRET_KEY, (err, data) => {
        if(data){
            try{
                Phonebook.updateOne({_id:data.id}, {$pull: {contacts: {_id: req.params.id}}}, (err, raw) =>{
                    if(raw.nModified == 1){
                        util.sendResponse(true, 200, res, "Contact has been delete sucessfully!");
                    }else{
                        util.sendResponse(false, 404, res, "Contact not found");
                    }
                    return;
                });
            } catch (err){
                util.sendExceptionResponse(res, err);
                return;
            }
        }else{
            util.sendExceptionResponse(res, "Invalid access token!");
            return;
        }
    });
});

// ** @PUT API: update contact
// ** @Params: user_id, contact name, phone_numbers[@array of obj contact number]
// ** @Response: message (success/fail)
router.put("/:id", verifyAccessToken,  (req, res) => {
    jwt.verify(req.token, process.env.SECRET_KEY, (err, data) => {
        if(data){
            try{
                if(req.body.name || req.body.number){
                    if(validateContact(req, res, req.body.name, req.body.number)){
                        Phonebook.findOne({_id : data.id}).then(phonebook => {
                            if(phonebook){
                                let contact = phonebook.contacts.find(con => String(con._id) === req.params.id);
        
                                if(contact){
                                    let updateContact = contact;
                                    if(req.body.name)
                                        updateContact.name = req.body.name;
            
                                    if(req.body.number)    
                                        updateContact.number = req.body.number;
            
                                    phonebook.contacts.splice(phonebook.contacts.indexOf(contact), 1);
                                    phonebook.contacts.push(updateContact);
                                    phonebook.save();
            
                                    util.sendResponse(true, util.getResStatus(phonebook.contacts), res, "Contact has been updated!");
                                    return;
                                }else{
                                    util.sendResponse(false, util.getResStatus(phonebook.contacts), res, "Contact not found!");
                                    return;
                                }
                            }else{
                                util.sendResponse(false, 400, res, "Contact not found!");
                                return;
                            }
                        });
                    }
                }else{
                    util.sendResponse(false, 400, res, "Contact params are required!");
                    return;
                }
            } catch (err){
                util.sendExceptionResponse(res, err);
                return;
            }
        }else{
            util.sendExceptionResponse(res, "Invalid access token!");
            return;
        }
    });
});


// *** @Supporting Methods ***
// ***
function verifyAccessToken(req, res, next){
    const bearerHeader = req.headers["authorization"];

    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];

        req.token = bearerToken;
        next();
    }else{
        util.sendResponse(false, 403, res, "Access token param missing!");
        return false;
    }
}

function validateContact(req, res, name, number){
    let validationSchema;

    if(name || number){
        let processSchema = {};

        if(name)
            processSchema.name = Joi.string().min(4).max(30).required();

        if(number)
            processSchema.number = Joi.string().min(8).max(15).required();

        validationSchema = Joi.object(processSchema);
    }else{
        validationSchema = Joi.object({
            name: Joi.string().min(4).max(30).required(),
            number: Joi.string().min(8).max(15).required()
        });
    }

    const { error } = validationSchema.validate(req.body);
    
    if(error){
        util.sendResponse(false, 400, res, error.details[0].message.replace(new RegExp('\"', 'g'), "").toUpperCase());
        return false;
    }else
        return true;
}

module.exports = router;