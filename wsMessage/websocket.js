let AWS = require("aws-sdk");

const lambda = new AWS.Lambda();

let retObj = [];


//Import functions for database
let db = require('database');

module.exports.getSendMessagePromises = async (message, domainName, stage) => {
    
    //Create parameters for calling function
    let params = {
        //The lambda function we are going to invoke
        FunctionName: 'getData', 
        
        //Type of invocation
        InvocationType: 'RequestResponse',
        
    };
    
    //Call function and log result
    try{
        let data = await lambda.invoke(params).promise();

        //Parse returned JSON to JavaScript object
        retObj = JSON.parse(data.Payload).body;
        
        //Log out data that has been returned
        console.log(retObj);
    }
    catch(err) {
        console.error("Failed to invoke child function: " + JSON.stringify(err));
    }
    
    //Get connection IDs of clients
    let clientIdArray = (await db.getConnectionIds()).Items;
    console.log("\nClient IDs:\n" + JSON.stringify(clientIdArray));

    //Create API Gateway management class.
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        endpoint: domainName + '/' + stage
    });

    //Try to send message to connected clients
    let msgPromiseArray = clientIdArray.map( async item => {
        try{
            console.log("Sending message '" + message + "' to: " + item.ConnectionId);

            //Create parameters for API Gateway
            let apiMsg = {
                ConnectionId: item.ConnectionId,
                Data: JSON.stringify(retObj)
            };

            //Wait for API Gateway to execute and log result
            await apigwManagementApi.postToConnection(apiMsg).promise();
            console.log("Message '" + message + "' sent to: " + item.ConnectionId);
        }
        catch(err){
            console.log("Failed to send message to: " + item.ConnectionId);

            //Delete connection ID from database
            if(err.statusCode == 410) {
                try {
                    await db.deleteConnectionId(item.ConnectionId);
                }
                catch (err) {
                    console.log("ERROR deleting connectionId: " + JSON.stringify(err));
                    throw err;
                }
            }
            else{
                console.log("UNKNOWN ERROR: " + JSON.stringify(err));
                throw err;
            }
        }
    });

    return msgPromiseArray;
};

