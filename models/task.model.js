"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const taskSchema=new Schema({
    name:{type:String,required:true,lowercase: true},
    createdBy: { type: String },
    createdAt: { type: Date, default: Date.now() },
    isDone:{type: Number, enum: [0, 1], default: 0}
});

module.exports=mongoose.model('Task',taskSchema);
