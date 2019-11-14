const axios = require('axios');
const config = require('./config.js');
const auth = Buffer.from(config.USERNAME + ":" + config.PASSWORD).toString('base64');

function LeaveBalanceLookup(req,res){

  console.log("LOGGIT >>> Leave Balance Called");

  console.log("LOGGIT >>> Memory = " + JSON.stringify(req.body.conversation.memory));

  var auth = Buffer.from(config.USERNAME + ":" + config.PASSWORD).toString('base64');
  var EmpNo = req.body.conversation.memory.EmployeeNumber.value;
  var SF_Leave_URL = config.SFSF_URL + "EmpTimeAccountBalance?$filter=userId eq '" + EmpNo + "' and timeAccountType eq '" + config.LEAVE_ACCOUNT_TYPE + "'&$format=json";
  console.log("LOGGIT >>> " + SF_Leave_URL);
  console.log("LOGGIT >>> " + auth);
  
  axios.get(SF_Leave_URL,{headers: {"Authorization" : "Basic " + auth}})
    .then(response => {
      console.log("LOGGIT >>> Response returned without error");
      console.log("LOGGIT >>> " + response.data.d.results[0]);
      for (var i in response.data.d.results) {
        
        console.log("LOGGIT >>> " + "Leave Record found");

        var LeaveRecord = response.data.d.results[i];

        console.log("LOGGIT >>> " +  JSON.stringify(LeaveRecord));

        res.send({
          replies:
          [
            {
              type: 'text',
              content: "Your current leave balance is " + LeaveRecord.balance + " " + LeaveRecord.timeUnit
            }
          ]
        });

      }
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
   
    return LeaveBalanceLookup;
}
 module.exports = LeaveBalanceLookup;