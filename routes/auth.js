const express = require('express');
const router = express.Router();
const User=require('../models/user.model');
const config=require('../config/database');
const jwt=require('jsonwebtoken');
router.post('/register', function(req, res, next) {
    if(!req.body.username){
        res.json({
            success:false,
            message:"you must provide user-name"
        });
    }
    if(!req.body.email){
        res.json({
            success:false,
            message:"you must provide an email"
        });
    }
    else {
        if(!req.body.password) {
            res.json({
                success:false,
                message:"you must provide password"
            });
        }else {
            let user=new User({
                email:req.body.email,
                username:req.body.username,
                password:req.body.password
            });
            user.save((err) =>{
                if(err) {
                    if(err.code === 11000){
                        res.json({
                            success:false,
                            message:"User name or email Already exist"
                        });
                    }
                    else{
                        if(err.errors){
                            if(err.errors.email){
                                res.json({
                                    success:false,
                                    message:err.errors.email.message
                                });
                            }
                            if(err.errors.username)
                            {
                                res.json({
                                    success:false,
                                    message:err.errors.username.message
                                });
                            }else{
                                if(err.errors.password)
                                {
                                    res.json({
                                        success:false,
                                        message:err.errors.password.message
                                    });
                                }
                                else{
                                    res.json({
                                        success:false,
                                        message:err
                                    });
                                }
                            }
                        }
                        res.json({
                            success:false,
                            message:"Could Not save the user. Error "+err
                        });
                    }
                }else{
                    res.json({
                        success:true,
                        message:"Account  is Created"
                    });
                }
            })
        }
    }

});
router.get('/checkEmail/:email', (req, res) => {
    if (!req.params.email) {
        res.json({ success: false, message: 'E-mail was not provided' });
    } else {

        User.findOne({ email: req.params.email }, (err, user) => {
            if (err) {
                res.json({ success: false, message: err });
            } else {

                if (user) {
                    res.json({ success: false, message: 'E-mail is already taken' });
                } else {
                    res.json({ success: true, message: 'E-mail is available' });
                }
            }
        });
    }
});
router.get('/checkUsername/:username', (req, res) => {

    if (!req.params.username) {
        res.json({ success: false, message: 'Username was not provided' });
    } else {

        User.findOne({ username: req.params.username }, (err, user) => {
            if (err) {
                res.json({ success: false, message: err });
            } else {
                if (user) {
                    res.json({ success: false, message: 'Username is already taken' });
                } else {
                    res.json({ success: true, message: 'Username is available' });
                }
            }
        });
    }
});
router.post('/login', (req, res) => {
    console.log("Username:",req.body.username);
    console.log("password",req.body.password);
    if (!req.body.username) {
        res.json({ success: false, message: 'No username was provided' });
    } else {
        if (!req.body.password) {
            res.json({ success: false, message: 'No password was provided.' });
        } else {
            User.findOne({ username: req.body.username.toLowerCase() }, (err, user) => {
                if (err) {
                    res.json({ success: false, message: err });
                } else {
                    if (!user) {
                        res.json({ success: false, message: 'Username not found.' });
                    } else {
                        const validPassword = user.comparePassword(req.body.password);
                        if (!validPassword) {
                            res.json({ success: false, message: 'Password invalid' });
                        } else {
                            console.log(config.secret);
                            const token = jwt.sign({ userId: user._id }, config.secret, { expiresIn: '24h' });
                            res.json({ success: true, message: 'Success!', token: token, user: { username: user.username } });
                            // Return success and token to frontend
                        }
                    }
                }
            });
        }
    }
});
// MiddleWare
router.use((req, res, next) => {
    const token = req.headers['authorization']; // Create token found in headers
    // Check if token was found in headers
    if (!token) {
        res.json({ success: false, message: 'No token provided' }); // Return error
    } else {
        // Verify the token is valid
        jwt.verify(token, config.secret, (err, decoded) => {
            // Check if error is expired or invalid
            if (err) {
                res.json({ success: false, message: 'Token invalid: ' + err }); // Return error for token validation
            } else {
                req.decoded = decoded; // Create global variable to use in any request beyond
                next(); // Exit middleware
            }
        });
    }
});
router.get('/profile', (req, res) => {
    // Search for user in database
    User.findOne({ _id: req.decoded.userId }).select('username email').exec((err, user) => {
        // Check if error connecting
        if (err) {
            res.json({ success: false, message: err }); // Return error
        } else {
            // Check if user was found in database
            if (!user) {
                res.json({ success: false, message: 'User not found' }); // Return error, user was not found in db
            } else {
                res.json({ success: true, user: user }); // Return success, send user object to frontend for profile
            }
        }
    });
});
module.exports = router;
