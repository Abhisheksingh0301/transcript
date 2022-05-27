var mongoose = require('mongoose');
var Schema=mongoose.Schema;

var trans=new Schema({
    passout_id:mongoose.Schema.Types.ObjectId,
    contactno:String,
    email_id:String,
    appliedto:String,
    applno:String,
    payid:String,
    payamt:Number,
    aftersxc:String,
    entrydt:{type:Date, default:Date.now},
    verify:false,
    verificationdate:Date,
    dispatchmode:String,
    dispatchid:String,
    dispatchdt:Date,
    remarks:String
});

module.exports=mongoose.model('transcript',trans);