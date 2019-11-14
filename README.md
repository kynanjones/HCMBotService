# HCMBotService

Deploy your node service and acess the home.html page to call the webchat window.

<h2>Index.js</h2>

<b>Index.js</b> is your main app, where all of your middleware services are held. These are called by <b>SAP Conversational AI</b>, and (should) return results back to SAP CAI in the expected format.

<h2>API Services</h2>

<h3>/leave</h3>
<b>Get Leave Balance</b>
<p>Calls SuccessFactors APIs to get the leave balance for given employee number (82094).</p>

<h3>/wflist</h3>
<b>Workflow tasks</b>
<p>Get list of SuccessFactors workflow tasks. Ugly nested code, but I didn't have the time to do it properly. </p>

<h3>/mongodb</h3>
<b>Internal, not called by SAP CAI.</b> 
<p>This call was an admin task to establish the Payslip collection in MongoDB.</p>

<h3>/payslip</h3>
<b>Get Employee Payslips</b>
<p>Reads MongoDB for instances of Payslips for a given Employee. The entry in Mongo references a file (used to be in Blob Storage, but now is just stored locally within the project).</p>

<h3>/createleave</h3>
<b>Creates a Leave Request</b>
<p>Doesn't <b>Actually</b> create a leave request, but maybe one day I will get the time to implement it.</p>

<h3>/errors</h3>
<b>Not used.</b>
