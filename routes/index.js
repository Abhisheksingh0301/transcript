var express = require('express');
var TranscriptModel = require("../schema/transcript");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  TranscriptModel.find({ verificationdate: null, dispatchdt: null }).count(function (err, entdata) {
    if (err) {
      console.log(err);
    } else {
      TranscriptModel.find({ verificationdate: { $ne: null }, dispatchdt: null }).count(function (err, verdata) {
        if (err) {
          console.log(err);
        } else {
          TranscriptModel.find({ verificationdate: { $ne: null }, dispatchdt: { $ne: null } }).count(function (err, totdata) {
            if (err) {
              console.log(err);
            } else {
              TranscriptModel.find().count(function (err, ttcnt) {
                if (err) {
                  console.log(err);
                } else {
                  TranscriptModel.aggregate([{$group:{_id:null,sum_val:{$sum:"$payamt"}}}],function(err,amt){
                  res.render("index", {
                    title: "Transcript management system", dueverification: entdata, duedispatch: verdata, dispdone: totdata,
                    totalcnt: ttcnt, headertext: "Welcome to the summary page", totamt:amt
                  });
                });
                }
              })
            }
          })
        }
      })
    }
  })
});
module.exports = router;
