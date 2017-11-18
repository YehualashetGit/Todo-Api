"use strict";
const express = require('express');
const router = express.Router();
const User = require('../models/user.model'); // Import User Model Schema
const Task=require('../models/task.model'); // Import Task Model schema
const jwt=require('jsonwebtoken');
const config=require('../config/database');
const auth=require('./auth');
router.post('/newTask',(req,res)=>{
    // if the user  is login then find the id by using the token
    console.log("the user info is",auth);

    // Check if blog title was provided
    if (!req.body.name) {
        res.status(400).json({ success: false, message: 'Task  name is required.' }); // Return error message
    } else {
        // Check if blog's creator was provided
        if (!req.body.createdBy) {
            res.json({ success: false, message: 'task creator is required.' }); // Return error
        } else {

            // Create the task object for insertion into database
            const task = new Task({
                name: req.body.name, // Title field
                createdBy: req.body.createdBy // CreatedBy field
            });
            task.save((err,data) => {
                if (err) {

                    if (err.errors) {
                        if (err.errors.title) {
                            res.json({ success: false, message: err.errors.title.message });
                        } else {
                            if (err.errors.body) {
                                res.json({ success: false, message: err.errors.body.message });
                            } else {
                                res.json({ success: false, message: err });
                            }
                        }
                    } else {
                        res.json({ success: false, message: err });
                    }
                } else {
                    res.json({ success: true, message: 'Blog saved!',data:data });
                }
            });
        }
    }
});
router.get('/allTask/:createdBy', (req, res) => {
    console.log(req.params.createdBy);
    // Search database for all blog posts

    Task.find({createdBy:req.params.createdBy}, (err, tasks) => {
        // Check if error was found or not
        if (err) {
            res.json({ success: false, message: err }); // Return error message
        } else {
            // Check if tasks were found in database
            if (!tasks) {
                res.json({ success: false, message: 'No tasks found.' }); // Return error of no tasks found
            } else {
                res.json({ success: true, tasks: tasks }); // Return success and tasks array
            }
        }
    }).sort({ 'name':'asc' }); // Sort tasks from newest to oldest
});
router.delete('/deleteTask/:id', (req, res) => {
    // Check if ID was provided in parameters
    if (!req.params.id) {
        res.json({ success: false, message: 'No id provided' }); // Return error message
    } else {
        // Check if id is found in database
        Task.findOne({ _id: req.params.id }, (err, task) => {
            // Check if error was found
            if (err) {
                console.log("Task is not deleted with invalid id");
                res.json({ success: false, message: 'Invalid id' }); // Return error message
            } else {
                // Check if blog was found in database
                if (!task) {
                    console.log("Task is not deleted due to not found");
                    res.json({ success: false, messasge: 'Task was not found' }); // Return error message
                } else {
                    // Remove the blog from database
                    task.remove((err) => {
                        if (err) {
                            res.json({ success: false, message: err }); // Return error message
                        } else {
                            console.log("Task is deleted");
                            res.json({ success: true, message: 'Task deleted!' }); // Return success message
                        }
                    });
                }
            }
        });
    }
});
module.exports = router;
