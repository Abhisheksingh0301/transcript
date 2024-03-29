var express = require("express");
var os = require('os');
var PassoutModel = require("../schema/passout");
var TranscriptModel = require("../schema/transcript");
var moment = require('moment');
var climate = require('city-weather');
const { ObjectId } = require("mongodb");
var pincode = require('pincode');
const res = require("express/lib/response");
const { request } = require("http");
const urls = require('url');
const { url } = require("inspector");
const { stat } = require("fs");
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;

var pssm = PassoutModel.find({});
var trn = TranscriptModel.find({});
/* GET index page */
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
              trn.count(function (err, ttcnt) {
                if (err) {
                  console.log(err);
                } else {
                  TranscriptModel.aggregate([{ $group: { _id: null, sum_val: { $sum: "$payamt" } } }], function (err, amt) {
                    res.render("index", {
                      title: "Transcript management system", dueverification: entdata, duedispatch: verdata, dispdone: totdata,
                      totalcnt: ttcnt, headertext: "Welcome to the summary page", totamt: amt
                    });
                  })
                }
              })
            }
          })
        }
      })
    }
  })
});
cput = os.cpus();
global.varcpu = cput[0].model;
global.varfreemem = (os.freemem() / 1048576).toFixed(2);
global.varosplat = os.platform();
global.varosrel = os.release();
global.varmem = (os.totalmem() / 1048576).toFixed(2);
// var osVer=os.version();


//Request page
router.get("/reqpage", function (req, res, next) {
  res.render("reqpage", {
    title: "Request page",
    headtext: "Welcome to the request page",
    reg: "",
    dp: "",
    ssn: "",
    passouts: { name: "aa" },
    moment: moment,
    curdt: Date.now(),
  });
});

/**/
//test page
router.get("/hi", function (req, res, next) {
  PassoutModel.find(function (err, passouts) {
    if (err) {
      console.log(err);
    } else {
      console.log(passouts.name);
      res.render("hi", { title: "test", passouts: passouts });
    }
  });
});

router.get("/hi", function (req, res, next) {
  res.render("hi", { title: "test" });
});


// Search for records [POST method]
router.post("/searchrecords/", function (req, res) {
  var fltrReg = req.body.txtreg;
  var fltrSessn = req.body.txtsessn;
  var fltrDept = req.body.txtdept;

  if (fltrReg != "" && fltrSessn != "" && fltrDept != "") {
    var fltrParameter = {
      $and: [
        { sesn: fltrSessn },
        { $and: [{ deptcode: fltrDept }, { regno: fltrReg }] },
      ],
    };
  } else {
    var fltrParameter = ({ regno: "" });
    //console.log("This is else part");
  }
  var studentFilter = PassoutModel.find(fltrParameter);
  // console.log(fltrParameter);
  studentFilter.exec(function (err, passouts) {
    if (err) {
      console.log(err);
    } else {
      res.render("reqpage", {
        passouts: passouts,
        headtext: "Welcome to the request page",
        title: "Passout student details",
        reg: req.body.txtreg,
        dp: req.body.txtdept,
        ssn: req.body.txtsessn,
        moment: moment,
        curdt: Date.now(),
      });
    }
  });
});

/* ADD RECORD IN TRANSACTION TABLE*/
router.post("/addrequest/", (req, res) => {
  TranscriptModel.find({ passout_id: req.body.id }).count(function (err, result) {
    if (err)
      throw err;
    console.log('Total count::::', result)
    if (result > 0) {
      console.log('Duplicate');
      res.render("hi", { title: "Duplicate record", headertext: "Duplicate record" });
    } else {
      const transdata = {
        passout_id: req.body.id,
        contactno: req.body.txtmobile,
        email_id: req.body.txtemail,
        appliedto: req.body.txtappfor,
        applno: req.body.txtappno,
        payid: req.body.txtpayid,
        payamt: req.body.txtpayamt,
        aftersxc: req.body.txtaftrsxc,
        entrydt: new Date(req.body.txtentrydt),
        verify: false,
        verificationdate: "",
        dispatchmode: "",
        dispatchid: "",
        dispatchdt: "",
        remarks: ""
      }
      var data = TranscriptModel(transdata);
      data.save(function (err) {
        if (err) {
          console.log('error', err);
        } else {
          res.redirect('../reqpage');
        }
      });
    }
  });

});

/* DIPLAY RECORDS OF TRANSCRIPT TABLE WHICH ARE NOT VERIFIED*/
router.get('/reqlist', function (req, res, next) {
  TranscriptModel.aggregate([
    {
      $lookup: {
        from: "passouts",
        localField: "passout_id",
        foreignField: "_id",
        as: "passdata"
      }
    }, { $match: { verify: false } }, { $unwind: "$passdata" }
  ], function (err, data) {
    if (err) {
      console.log(err);
    } else {
      res.render('reqlist', {
        transcripts: data, title: "Transcript request list (Verification pending)", moment: moment,
        headertext: "Transcript request list"
      })
    }
  }).sort({ "entrydt": 1 });
});
/* DIPLAY RECORDS OF TRANSCRIPT TABLE WHICH ARE VERIFIED*/
router.get('/verifylist', function (req, res, next) {
  TranscriptModel.aggregate([
    {
      $lookup: {
        from: "passouts",
        localField: "passout_id",
        foreignField: "_id",
        as: "passdata"
      }
    }, { $match: { verify: true, dispatchdt: null } }, { $unwind: "$passdata" }
  ], function (err, data) {
    if (err) {
      console.log(err);
    } else {
      res.render('approvedlist', {
        transcripts: data, title: "Transcript list (Verification done)", moment: moment,
        headertext: "Approved list of verification"
      })
    }
  }).sort({ "verificationdate": 1 });
});

//Get single record by ID for approval
router.get('/approvepage/:id', function (req, res) {
  // console.log(req.params.id);
  TranscriptModel.aggregate([
    {
      $lookup: {
        from: "passouts",
        localField: "passout_id",
        foreignField: "_id",
        as: "passdata"
      }
    },
    { $match: { _id: new ObjectId(req.params.id) } },
    { $unwind: "$passdata" }
  ], function (err, data) {
    if (err) {
      console.log(err);
    } else {
      // console.log(data);
      res.render('approve', {
        transcripts: data, title: "Transcript request list", moment: moment,
        headertext: "Transcript request list", updtmsg: ""
      })
    }
  });
});

/* APPROVE A TRANSCRIPT*/
router.post('/verify', function (req, res, next) {
  // console.log(req.body);
  var dataRecords = {
    verify: true,
    verificationdate: Date.now()
  }
  var pwd = "abhi@2022";
  var trId = req.body.id;
  console.log(trId);
  console.log(dataRecords);
  if (req.body.txtpwd == pwd) {
    var update = TranscriptModel.findByIdAndUpdate(req.body.id, dataRecords);
    update.exec(function (err, data) {
      if (err) throw err;
      trn.exec(function (err, data) {
        if (err) throw err;
        res.redirect("../reqlist");
      })
    })
  } else {
    TranscriptModel.aggregate([
      {
        $lookup: {
          from: "passouts",
          localField: "passout_id",
          foreignField: "_id",
          as: "passdata"
        }
      },
      { $match: { _id: new ObjectId(req.body.id) } },
      { $unwind: "$passdata" }
    ], function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        res.render('approve', {
          transcripts: data, title: "Transcript request list", moment: moment,
          headertext: "Transcript request list", updtmsg: "Incorrect password"
        })
      }
    });
  }
});

/* Final Dispatch*/
router.post('/finaldisp', function (req, res, next) {
  // console.log(req.body);
  var dataRecords = {
    dispatchmode: req.body.txtdispmode,
    dispatchdt: Date.now(),
    dispatchid: req.body.txtdspid,
    remarks: req.body.txtremark
  }
  var pwd = "dispatch@2022";
  var trId = req.body.id;
  console.log(trId);
  // console.log(dataRecords);
  if (req.body.txtpwd == pwd) {
    var update = TranscriptModel.findByIdAndUpdate(req.body.id, dataRecords);
    update.exec(function (err, data) {
      if (err) throw err;
      trn.exec(function (err, data) {
        if (err) throw err;
        res.redirect("../verifylist");
      })
    })
  } else {
    TranscriptModel.aggregate([
      {
        $lookup: {
          from: "passouts",
          localField: "passout_id",
          foreignField: "_id",
          as: "passdata"
        }
      },
      { $match: { _id: new ObjectId(req.body.id) } },
      { $unwind: "$passdata" }
    ], function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        res.render('dispatch', {
          transcripts: data, title: "Transcript request list", moment: moment,
          headertext: "Transcript request list", updtmsg: "Incorrect password"
        })
      }
    });
  }
});

//Get single record by ID for dispatch
router.get('/dispatch/:id', function (req, res) {
  console.log(req.params.id);
  TranscriptModel.aggregate([
    {
      $lookup: {
        from: "passouts",
        localField: "passout_id",
        foreignField: "_id",
        as: "passdata"
      }
    },
    { $match: { _id: new ObjectId(req.params.id) } },
    { $unwind: "$passdata" }
  ], function (err, data) {
    if (err) {
      console.log(err);
    } else {
      // console.log(data);
      res.render('dispatch', {
        transcripts: data, title: "Dispatch list", moment: moment,
        headertext: "Dispatch list", updtmsg: ""
      })
    }
  });
});
/* DIPLAY ALL RECORDS OF TRANSCRIPT TABLE */
router.get('/showall', function (req, res, next) {
  TranscriptModel.aggregate([
    {
      $lookup: {
        from: "passouts",
        localField: "passout_id",
        foreignField: "_id",
        as: "passdata"
      }
    }, { $unwind: "$passdata" }
  ], function (err, data) {
    if (err) {
      console.log(err);
    } else {
      res.render('showall', {
        transcripts: data, title: "All reords of Transcripts", moment: moment,
        headertext: "All reords of Transcripts", dtfrm: Date.now(), dtupto: Date.now()
      })
    }
  }).sort({ "entrydt": -1 });
});
/* DIPLAY ALL RECORDS BY DATE ON TRANSCRIPT TABLE */
router.post('/searchbydate', function (req, res, next) {
  datefrom = new Date(req.body.txtdtfrom);
  dateupto = new Date(req.body.txtdtupto);
  console.log(datefrom);
  TranscriptModel.aggregate([
    {
      $lookup: {
        from: "passouts",
        localField: "passout_id",
        foreignField: "_id",
        as: "passdata"
      }
    }, { $match: { entrydt: { $gte: datefrom, $lte: dateupto } } }, { $unwind: "$passdata" }
    // {entrydt:{$gte:ISODate('2022-04-25')}}
  ], function (err, data) {
    if (err) {
      console.log(err);
    } else {
      res.render('showall', {
        transcripts: data, title: "Records entered between specified dates", moment: moment,
        headertext: "Records entered between specified dates", dtfrm: datefrom, dtupto: dateupto
      })
    }
  }).sort({ "entrydt": -1 });
});

//Get single record by ID to display all data
router.get('/details/:id', function (req, res) {
  console.log(req.params.id);
  TranscriptModel.aggregate([
    {
      $lookup: {
        from: "passouts",
        localField: "passout_id",
        foreignField: "_id",
        as: "passdata"
      }
    },
    { $match: { _id: new ObjectId(req.params.id) } },
    { $unwind: "$passdata" }
  ], function (err, data) {
    if (err) {
      console.log(err);
    } else {
      // console.log(data);
      res.render('details', {
        transcripts: data, title: "Detail list", moment: moment,
        headertext: "Detail list", updtmsg: ""
      })
    }
  });
});
//ABOUT PAGE
router.get('/about', (req, res) => {

  res.render('about', { title: "This is about page" });
});
/* DELETE RECORDS FROM TRANSCRIPT TABLE*/
router.get('/deleterecord/:id', function (req, res) {
  TranscriptModel.findOne({ _id: req.params.id, verify: true }).count(function (err, results) {
    if (err)
      throw (err);
    if (results > 0) {
      console.log('Already verified');
      res.render("hi", { title: "Already verified record!!!", headertext: "This record is verified, so you cann't delete." });
    } else {
      TranscriptModel.findOneAndDelete({ _id: req.params.id }, function (err, data) {
        if (err) {
          res.redirect("../reqlist");
        } else {
          res.redirect("../reqlist");
        }
      })
    }
  })
})

router.get('/sms/', function (req, res) {
  //res.redirect("../reqlist");
  var message = "Please complete your EVALUATION by the last date. Thank you [COE, St. Xavier's College, Kolkata]" +
    "APIKEY=" + "WJLAskzsrJF" +
    "&MobileNo=" + "9239042405" + "&SenderID=" + "SXCKOL" +
    "&Message=" + URLEncoder.encode(message, "UTF-8") +
    "&ServiceName=" + "TEMPLATE_BASED";

});

router.get('/utilities', (req, res) => {
  res.render('utilities', { maxtemp: "", mintemp: "", actualtemp: "", description: "", city: "", title: "Welcome to Weather Report Page" })
});
router.post('/utilities', (req, res) => {
  var city = req.body.txttown;
  console.log(city);
  climate.getMaximumTemp(city, function (maxtemp) {
    console.log("Maximum temperature: " + maxtemp);
    climate.getClimateDescription(city, function (description) {
      console.log("Climate description: " + description);
      climate.getActualTemp(city, function (actualtemp) {
        console.log("Actual temperature: " + actualtemp);
        climate.getMinimumTemp(city, function (mintemp) {
          console.log("Minimum temperature: " + mintemp);
          res.render('utilities', {
            maxtemp: maxtemp, mintemp: mintemp, actualtemp: actualtemp, description: description,
            city: city, title: "Welcome to Weather Report Page"
          })
        });
      });
    });
  });

});

/*TO GET ADDRESS FROM PIN CODE */
router.get('/pincode', (req, res) => {
  res.render('pincode', { postoffice:"",city: "", state: "",pincode:"", country: "", title: "Search address by pin code" });
});
router.post('/pincode', (req, res) => {
  const pin = req.body.txtpin;
  console.log(pin);
  const request = require('request');
  request({
    url: "https://api.postalpincode.in/pincode/" + pin,
    // var reqUrl="https://jsonplaceholder.typicode.com/posts";
    json: true

    //**al9103674
  }, (err, response, body) => {
    var finduser = body.find(user => body,undefined,4);
    //console.log(JSON.parse(body,undefined,4))
    //console.log(JSON.stringify(finduser.PostOffice[0].Name));
    if(JSON.parse(JSON.stringify(finduser.Message!="No records found"))){
    var Postoffice = JSON.parse(JSON.stringify(finduser.PostOffice[0].Name));
    var District = JSON.parse(JSON.stringify(finduser.PostOffice[0].District));
    var State = JSON.parse(JSON.stringify(finduser.PostOffice[0].State));
    var Country = JSON.parse(JSON.stringify(finduser.PostOffice[0].Country));
    var Pincode = JSON.parse(finduser.PostOffice[0].Pincode);

    //var Pincode = JSON.stringify(finduser.PostOffice[0].Pincode);
    console.log(Postoffice, District, State, Country, Pincode);
    res.render('pincode', { postoffice:Postoffice,city: District, state: State,pincode:Pincode, country: Country, 
      title: "Search address by pin code" });
    } else {
      console.log(JSON.parse(JSON.stringify(finduser.Message)));
      res.render('pincode', { postoffice:"No records found",city: "", state: "",pincode:"", country: "", title: "Search address by pin code" });
    }
  })


});

module.exports = router;

//END OF FILE
