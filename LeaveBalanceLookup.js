const axios = require('axios');
const config = require('./config.js');
const auth = Buffer.from(config.USERNAME + ":" + config.PASSWORD).toString('base64');
//const auth = 'STMwMTI1NjpTQVBEZW1vUEBzczE=';

function LeaveBalanceLookup(req,res){

  var EmpNo = req.body.conversation.memory.EmployeeNumber;
  
  axios.get(config.SFSF_URL + "EmpTimeAccountBalance?$filter=userId eq '" + EmpNo + "' and timeAccountType eq '" + config.LEAVE_ACCOUNT_TYPE + "'",{headers: {"Authorization" : "Basic " + auth}})
    .then(response => {

        for (var i in response.data.d.EmpTimeAccountBalance) {
          
          console.log("LOGGIT >>> " + "Leave Record found");
          console.log("LOGGIT >>> " +  LeaveRecord);

          var LeaveRecord = response.data.d.EmpTimeAccountBalance[i];

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
              content: "Looks like there's a problem with that number. Could you please resend that? It should be a 10 digit number, like 05000000002",
            }]
        });

    });
    LeaveBalanceLookup.res = res;
    return LeaveBalanceLookup;
}
 module.exports = LeaveBalanceLookup;