const express = require("express");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const util = require("../../utility/util");
const Phonebook = require("../../models/phonebook");
const router = express.Router();

// ** @POST API: Login User
// ** @Params: username, password
// ** @Response: access_token, full_name, total_contacts(Count)
router.post("/login", async (req, res) => {
    if(validateValues(req, res)){
        try {
            let userAccountExist = await Phonebook.findOne({username:req.body.username, password:req.body.password}, 
                {id:1, full_name:1, contacts:1});

            if(userAccountExist){
                jwt.sign({id:userAccountExist.id}, process.env.SECRET_KEY, (err, token) => {
                    if(err) 
                        util.sendResponse(false, 404, res, err);
                    else{
                        let finalRes = {
                            access_token: token,
                            full_name:userAccountExist.full_name,
                            total_contacts:userAccountExist.contacts.length
                        };

                        util.sendResponse(true, 200, res, finalRes);
                    }
                });
            }else
                util.sendResponse(false, 404, res, "Wrong username or password! Please try again");
        } catch (err) {
            sendExceptopnResponse(res, err);
        }
    }
});

// ** @POST API: Register User
// ** @Params: full_name, username, password
// ** @Response: message (success/fail)
router.post("/register", async (req, res) => {
    if(validateValues(req, res, true)){
        try {
            const usernameExist = await Phonebook.findOne({username:req.body.username});
           
            if(usernameExist){
                util.sendResponse(false, 400, res, "username already exist. Please choose different username.");
                return;
            }
            
            const phonebook = new Phonebook({
                full_name:req.body.full_name,
                username:req.body.username,
                password:req.body.password
            });
    
            await phonebook.save();
            util.sendResponse(true, 200, res, "User has been successfully registered!");
        } catch (err) {
            sendExceptopnResponse(res, err);
        }
    }
});

// ******************** Supporting Methods **********************

function validateValues(req, res, isReg){
    let validationSchema;

    if(isReg){
        validationSchema = Joi.object({
            full_name: Joi.string().min(3).max(30).required(),
            username: Joi.string().min(4).max(15).required(),
            password: Joi.string().min(8).max(15).required()
        });
    }else{
        validationSchema = Joi.object({
            username: Joi.string().min(4).max(15).required(),
            password: Joi.string().min(8).max(15).required()
        });
    }

    const { error } = validationSchema.validate(req.body);
    
    if(error){
        util.sendResponse(false, 400, res, error.details[0].message.replace(new RegExp('\"', 'g'), "").toUpperCase());
        return false;
    }else
        return true;
}

// ******************************************************* | Close


module.exports = router;