// index.js
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const axios = require('axios');
const config = require('./config.js');
var   Redis = require('ioredis');
//var sapcai = require('sapcai').default;
var mongoClient = require("mongodb").MongoClient;


//SAP OData Service Utilities
const LeaveBalanceLookup = require('./api_LeaveBalanceLookup.js');
const WFList = require('./api_WFList');

const app = express();
var path  = require("path");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/home.html'));
});

app.get('/files/:id',function(req,res){
  res.sendFile(path.join(__dirname+"/files/" + req.params.id));
})

app.get('/img/:imgid', (req, res) => {
  res.sendFile(path.join(__dirname+'/img/'+req.params.imgid));
})


function pad(num, size) {
    var s = "0000000000" + num;
    return s.substr(s.length-size);
};

app.post('/leave',function(req,res){

    var LeaveRecord = LeaveBalanceLookup(req,res);
    res = LeaveRecord.res;

});    

app.post('/wflist',function(req,res){

  console.log("LOGGIT >>> wfList Called");

  var auth = Buffer.from(config.USERNAME + ":" + config.PASSWORD).toString('base64');
  var SF_WF_URL = config.SFSF_URL + "Todo?$filter=categoryId eq '17'&$format=JSON";
  console.log("LOGGIT >>> " + SF_WF_URL);
  console.log("LOGGIT >>> " + auth);
  var wfListElements = [];

  axios.get(SF_WF_URL,{headers: {"Authorization" : "Basic " + auth}})
    .then(response => {
      console.log("LOGGIT >>> Response returned without error");

      for (var i in response.data.d.results) {

        console.log("LOGGIT >>> " + "WfRequest found");

        var wfRequestTodoResults = response.data.d.results[i];

        for (var i in wfRequestTodoResults.todos.results){

          var wfRequest = wfRequestTodoResults.todos.results[i];

          try{

            for(var i in wfRequest.entries.results){

              var wfItem = wfRequest.entries.results[i];

              console.log("LOGGIT >>> " +  JSON.stringify(wfItem));

              var name;

              if(wfItem.name){
                name = wfItem.name;
              }else{
                name = wfRequestTodoResults.categoryLabel;
              }

              wfListElements.push(
                {
                  "title": wfItem.subjectFullName,
                  "subtitle": wfRequest.name,
                  "buttons": [
                    {
                      "title": "Open Item",
                      "type": "web_url",
                      "value": wfItem.url
                    }
                  ]
                }
              );
            }
          }
          catch(error){
            //some workflow items dont contain the .entries.results extension
            wfListElements.push(
              {
                "title": wfRequest.name,
                "subtitle": wfRequestTodoResults.categoryLabel,
                "buttons": [
                  {
                    "title": "Open Item",
                    "type": "web_url",
                    "value": wfRequest.url
                  }
                ]
              }
            );
          }
        }

      }
        
      console.log('LOGGIT >>> Output response back to Recast:' + JSON.stringify(wfListElements) );

      res.send({
           replies:
           [
            {
              type: 'text',
              delay: 2,
              content: "Ok, so I have found the following items for you:"      
            },
            {
              type: 'list',
              content: {
                  elements: wfListElements
              }
            }
           ]
         });
    })
    .catch(error => {
      console.log(error);
        res.send({
            replies: [{
              type: 'text',
              content: "Looks like there's a problem. Please try again later, or call HR Direct",
            }]
        });

    });


});

app.get('/monogdb', (req, res) => {
  mongoClient.connect(config.MONGO_CONN_STRING, function (err, client) {

    const db = client.db(config.MONGO_DB_NAME);
    db.createCollection("Payslips", function(err,payslips){
      res.send("Payslips created successfully");
    });
    res.send('GET request to the homepage')
  })
});

//Get a list of my payslip documents
app.post('/payslip',function(req,res){            


    readPayslipReference = new Promise((resolve,reject) => {
      setTimeout(function() {
        mongoClient.connect(config.MONGO_CONN_STRING, function (err, client) {

          const db = client.db(config.MONGO_DB_NAME);
          var cursor = db.collection(config.MONGO_COLLECTION).find({Employee:"82094"});

          var payslipList = [];
          cursor.each(function(err, doc) {
            console.log("LOGGIT >>> Cursor hit");
            
            if (doc != null) {
                console.log("LOGGIT >>> " + JSON.stringify(doc));
        
                //We have the record, now we can get the Filename (URL to Blob Storage) and pass it back to the Bot
        
                payslipList.push({
                  "title": doc.Period,
                  "imageUrl": "./img/payslip.png",
                  "subtitle": doc.Year,
                  "buttons": [
                    {
                      "title": "View Payslip",
                      "type": "web_url",
                      "value": doc.Filename
                    }
                  ]
                });
                resolve(payslipList);
        
            } else {
              console.log("LOGGIT >>> Doc is null");
            }
        
          });
          client.close();
        })
      }, 300);

    });

    console.log(readPayslipReference.then(function(payslips){
      console.log("LOGGIT >>> Response sent as : " + JSON.stringify(payslips));
      res.send({
        replies:
        [
          {
            type: 'list',
            content: { elements: payslips }
          }
        ]
      });
    }));
});

app.post('/createleave',function(req,res){

  console.log("LOGGIT >>> Create Leave Called");

  res.send({
    replies:
    [
      {
        type: 'text',
        content: "Your leave request has been submitted for approval."
      }
    ]
  });
});

// Recast will send a post request to /errors to notify important errors
// described in a json body
app.post('/errors', (req, res) => {
   console.error(req.body);
   res.sendStatus(200);
});

app.listen(config.PORT, () => console.log(`App started on port ${config.PORT}`));

