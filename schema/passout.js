var mongoose = require('mongoose');
var Schema=mongoose.Schema;


var pass=new Schema({
    certificateno:String,
    idno:String,
    student_id:String,
    roll:String,
    name:String,
    printname:String,
    regno:String,
    sex:String,
    sess:String,
    type:String,
    deptcode:String,
    specialisation:String,
    percentage:{type:Number, default:0.0},
    class:String,
    class_div:String,
    qg:false,
    deptno:String,
    sortorder:Number,
    degree:String,
    yearofpassing:String,
    issuedate:String,
    improvement:false,
    // cgpa:{type:Number, default:0.0},
    cgpa:String,
    grade:String
});
module.exports=mongoose.model('passout',pass);

