const AWS = require("aws-sdk");
const comprehend = new AWS.Comprehend();
const dynamoDb = new AWS.DynamoDB();
const lambda = new AWS.Lambda();

let results = [];
let resultSentiment = [];
 
exports.handler = async (event) => {

    for (let i = 0; i < event.Records.length; i++) {

        if (event.Records[i].eventName === 'INSERT') {
            
            let tweet = {

                TWEET_ID: (JSON.stringify(event.Records[i].dynamodb.NewImage.TWEET_ID.N)).replace(/"/g, ""),
                TWEET_CARRIER: (JSON.stringify(event.Records[i].dynamodb.NewImage.TWEET_CARRIER.S)).replace(/"/g, ""),
                TWEET_TIMESTAMP: (JSON.stringify(event.Records[i].dynamodb.NewImage.TWEET_TIMESTAMP.N)).replace(/"/g, ""),
                TWEET_TEXT: (JSON.stringify(event.Records[i].dynamodb.NewImage.TWEET_TEXT.S)).replace(/"/g, ""),
                TWEET_DATE: (JSON.stringify(event.Records[i].dynamodb.NewImage.TWEET_DATE.S)).replace(/"/g, "")

            };
            
            await new Promise((resolve, reject) => {

                let params = {

                    LanguageCode: "en",
                    Text: tweet.TWEET_TEXT

                };

                comprehend.detectSentiment(params, (err, data) => {

                    if (err) {

                        reject(err);

                    }

                    else {

                        resolve(resultSentiment.push(data));

                    }
                });
            });
            
            let newObject = {

                PutRequest: {

                    Item: {

                        "TWEET_ID": { "N": tweet.TWEET_ID },
                        "TWEET_CARRIER": { "S": tweet.TWEET_CARRIER },
                        "TWEET_TIMESTAMP": { "N": tweet.TWEET_TIMESTAMP },
                        "TWEET_DATE": { "S": tweet.TWEET_DATE },
                        "TWEET_SENTIMENT": { "S": resultSentiment[0].Sentiment },
                        "TWEET_POSITIVE": { "N": resultSentiment[0].SentimentScore.Positive.toString() },
                        "TWEET_NEGATIVE": { "N": resultSentiment[0].SentimentScore.Negative.toString() },
                        "TWEET_NEUTRAL": { "N": resultSentiment[0].SentimentScore.Neutral.toString() },
                        "TWEET_MIXED": { "N": resultSentiment[0].SentimentScore.Mixed.toString() }

                    }
                }
            };

            results.push(newObject);
            resultSentiment = [];

            if (results.length === 25) {

                let params = {

                    RequestItems: {

                        "flights_tweets_sentiment": results

                    }
                }

                await new Promise((resolve, reject) => {

                    dynamoDb.batchWriteItem(params, function (error, data) {

                        if (error) {

                            reject(error)

                        } else {

                            resolve(data)

                        }
                    });

                });
                
                results = [];

            }
        }
    }
    
    if (results.length != 0) {

        let params = {

            RequestItems: {

                "flights_tweets_sentiment": results

            }
        };

        await new Promise((resolve, reject) => {

            dynamoDb.batchWriteItem(params, function (error, data) {

                if (error) {

                    reject(error);

                } else {

                    resolve(data);

                }
            });

        });
        
        results = [];

    }
    
    //Create parameters for calling function
    let params = {
        //The lambda function we are going to invoke
        FunctionName: 'wsMessage', 
        
        //Type of invocation
        InvocationType: 'RequestResponse',
        
    };
    
    //Call function and log result
    try{
        
        await lambda.invoke(params).promise();

    }
    catch(err) {
        console.error("Failed to invoke child function: " + JSON.stringify(err));
    }
};