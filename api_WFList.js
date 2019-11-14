const axios = require('axios');
const config = require('./config.js');
const auth = Buffer.from(config.USERNAME + ":" + config.PASSWORD).toString('base64');

    function WFList(res,resp){
        var auth = Buffer.from(config.USERNAME + ":" + config.PASSWORD).toString('base64');
        //  var EmpNo = req.body.conversation.memory.EmployeeNumber.value;
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
            return WFList;
    }
    module.exports = WFList;
  