const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async function (event) {

    let resultsAA2017 = [];
    let resultsAA2018 = [];
    let resultsAADelays = [];
    let resultsAACancellations = [];
    let resultsAADates = [];

    let resultsNK2017 = [];
    let resultsNK2018 = [];
    let resultsNKDelays = [];
    let resultsNKCancellations = [];
    let resultsNKDates = [];

    let resultsB62017 = [];
    let resultsB62018 = [];
    let resultsB6Delays = [];
    let resultsB6Cancellations = [];
    let resultsB6Dates = [];

    let results = [];

    let resultsTweets = [];

    let searchItem = ["AA", "NK", "B6"];

    for (let i = 0; i < searchItem.length; i++) {

        let params = {

            TableName: "flights_data",
            FilterExpression: "OP_CARRIER = :op",
            ExpressionAttributeValues: {
                ':op': searchItem[i]
            }

        };

        await new Promise((resolve, reject) => {

            documentClient.scan(params, function (err, data) {

                if (err) {

                    reject(err);

                } else {

                    resolve(data.Items.forEach(function (tweet) {

                        if (tweet.FL_DATE.includes("2017-12") && tweet.OP_CARRIER.includes("AA")) {

                            resultsAA2017.push(tweet);

                        }


                        if (tweet.FL_DATE.includes("2018") && tweet.OP_CARRIER.includes("AA")) {

                            resultsAA2018.push(tweet);

                        }

                        if (tweet.FL_DATE.includes("2017-12") && tweet.OP_CARRIER.includes("NK")) {

                            resultsNK2017.push(tweet);

                        }


                        if (tweet.FL_DATE.includes("2018") && tweet.OP_CARRIER.includes("NK")) {

                            resultsNK2018.push(tweet);

                        }

                        if (tweet.FL_DATE.includes("2017-12") && tweet.OP_CARRIER.includes("B6")) {

                            resultsB62017.push(tweet);

                        }


                        if (tweet.FL_DATE.includes("2018") && tweet.OP_CARRIER.includes("B6")) {

                            resultsB62018.push(tweet);

                        }

                    }))

                }

            });

        });

    };

    let searchTweets = ["AmericanAir", "SpiritAirlines", "JetBlue"];

    let TWEET_NEUTRAL = 0;
    let TWEET_MIXED = 0;
    let TWEET_NEGATIVE = 0;
    let TWEET_POSITIVE = 0;

    for (let i = 0; i < searchTweets.length; i++) {

        let params = {

            TableName: "flights_tweets_sentiment",
            FilterExpression: "TWEET_CARRIER = :ca",
            ExpressionAttributeValues: {
                ':ca': searchTweets[i]
            }

        };

        await new Promise((resolve, reject) => {

            documentClient.scan(params, function (err, data) {

                if (err) {

                    reject(err);

                } else {

                    resolve(data.Items.forEach(function (tweet) {

                        TWEET_POSITIVE = + tweet.TWEET_POSITIVE;
                        TWEET_NEGATIVE = + tweet.TWEET_NEGATIVE;
                        TWEET_MIXED = + tweet.TWEET_MIXED;
                        TWEET_NEUTRAL = + tweet.TWEET_NEUTRAL;

                    }));

                    if (searchTweets[i] === "AmericanAir") {

                        resultsTweets.push(

                            {
                                AA: {

                                    sentiment_analysis: {

                                        TWEET_POSITIVE: TWEET_POSITIVE / 100,
                                        TWEET_NEGATIVE: TWEET_NEGATIVE / 100,
                                        TWEET_MIXED: TWEET_MIXED / 100,
                                        TWEET_NEUTRAL: TWEET_NEUTRAL / 100

                                    }

                                }
                            }
                        )

                        TWEET_NEUTRAL = 0;
                        TWEET_MIXED = 0;
                        TWEET_NEGATIVE = 0;
                        TWEET_POSITIVE = 0;

                    }

                    if (searchTweets[i] === "SpiritAirlines") {

                        resultsTweets.push(

                            {
                                NK: {

                                    sentiment_analysis: {

                                        TWEET_POSITIVE: TWEET_POSITIVE / 100,
                                        TWEET_NEGATIVE: TWEET_NEGATIVE / 100,
                                        TWEET_MIXED: TWEET_MIXED / 100,
                                        TWEET_NEUTRAL: TWEET_NEUTRAL / 100

                                    }

                                }
                            }
                        )

                        TWEET_NEUTRAL = 0;
                        TWEET_MIXED = 0;
                        TWEET_NEGATIVE = 0;
                        TWEET_POSITIVE = 0;

                    }

                    if (searchTweets[i] === "JetBlue") {

                        resultsTweets.push(

                            {
                                B6: {

                                    sentiment_analysis: {

                                        TWEET_POSITIVE: TWEET_POSITIVE / 100,
                                        TWEET_NEGATIVE: TWEET_NEGATIVE / 100,
                                        TWEET_MIXED: TWEET_MIXED / 100,
                                        TWEET_NEUTRAL: TWEET_NEUTRAL / 100

                                    }

                                }
                            }
                        )

                        TWEET_NEUTRAL = 0;
                        TWEET_MIXED = 0;
                        TWEET_NEGATIVE = 0;
                        TWEET_POSITIVE = 0;

                    }

                }

            });

        });

    }

    function compare(x, y) {

        if (x.FL_DATE > y.FL_DATE) return 1;

        if (x.FL_DATE < y.FL_DATE) return -1;

        return 0;

    }

    resultsAA2017.sort(compare);
    resultsAA2018.sort(compare);

    resultsNK2017.sort(compare);
    resultsNK2018.sort(compare);

    resultsB62017.sort(compare);
    resultsB62018.sort(compare);

    for (let i = 0; i < resultsAA2017.length; i++) {

        if (resultsAA2017[i].OP_CARRIER.includes("AA")) {

            resultsAADelays.push(resultsAA2017[i].DEP_DELAY);
            resultsAACancellations.push(resultsAA2017[i].CANCELLED);
            resultsAADates.push(resultsAA2017[i].FL_DATE);

        }

        if (resultsNK2017[i].OP_CARRIER.includes("NK")) {

            resultsNKDelays.push(resultsNK2017[i].DEP_DELAY);
            resultsNKCancellations.push(resultsNK2017[i].CANCELLED);
            resultsNKDates.push(resultsNK2017[i].FL_DATE);

        }

        if (resultsB62017[i].OP_CARRIER.includes("B6")) {

            resultsB6Delays.push(resultsB62017[i].DEP_DELAY);
            resultsB6Cancellations.push(resultsB62017[i].CANCELLED);
            resultsB6Dates.push(resultsB62017[i].FL_DATE);

        }

    }

    for (let i = 0; i < resultsAA2018.length; i++) {

        if (resultsAA2018[i].OP_CARRIER.includes("AA")) {

            resultsAADelays.push(resultsAA2018[i].DEP_DELAY);
            resultsAACancellations.push(resultsAA2018[i].CANCELLED);
            resultsAADates.push(resultsAA2018[i].FL_DATE);

        }

        if (resultsNK2018[i].OP_CARRIER.includes("NK")) {

            resultsNKDelays.push(resultsNK2018[i].DEP_DELAY);
            resultsNKCancellations.push(resultsNK2018[i].CANCELLED);
            resultsNKDates.push(resultsNK2018[i].FL_DATE);

        }

        if (resultsB62018[i].OP_CARRIER.includes("B6")) {

            resultsB6Delays.push(resultsB62018[i].DEP_DELAY);
            resultsB6Cancellations.push(resultsB62018[i].CANCELLED);
            resultsB6Dates.push(resultsB62018[i].FL_DATE);

        }

    }

    let searchPredictions = ["AA", "NK", "B6"];
    let predictionsAA = [];
    let predictionsNK = [];
    let predictionsB6 = [];


    for (let i = 0; i < searchPredictions.length; i++) {

        let params = {

            TableName: "flights_predictions",
            FilterExpression: "OP_CARRIER = :op",
            ExpressionAttributeValues: {
                ':op': searchItem[i]
            }

        };

        await new Promise((resolve, reject) => {

            documentClient.scan(params, function (err, data) {

                if (err) {

                    reject(err);

                } else {

                    resolve(data.Items.forEach(function (flight) {

                        if (flight.OP_CARRIER.includes("AA")) {

                            predictionsAA.push(flight);

                        }

                        if (flight.OP_CARRIER.includes("NK")) {

                            predictionsNK.push(flight);

                        }

                        if (flight.OP_CARRIER.includes("B6")) {

                            predictionsB6.push(flight);

                        }

                    }))

                }

            });

        });

    }

    let resultPredictionsAA = JSON.parse(predictionsAA[0].predictions);
    let keys = Object.keys(resultPredictionsAA[0].quantiles);

    let resultPredictionsNK = JSON.parse(predictionsNK[0].predictions);
    let keys1 = Object.keys(resultPredictionsNK[0].quantiles);

    let resultPredictionsB6 = JSON.parse(predictionsB6[0].predictions);
    let keys2 = Object.keys(resultPredictionsB6[0].quantiles);

    results.push(

        {

            AA: {

                delays: resultsAADelays,
                predictions: {
                    mean: resultPredictionsAA[0].mean,
                    quantiles1: resultPredictionsAA[0].quantiles[keys[0]],
                    quantiles9: resultPredictionsAA[0].quantiles[keys[1]]

                },
                cancellations: resultsAACancellations,
                dates: resultsAADates,
                sentiment_analysis: resultsTweets[0].AA.sentiment_analysis

            }

        }

    )

    results.push(

        {

            NK: {

                delays: resultsNKDelays,
                predictions: {
                    mean: resultPredictionsNK[0].mean,
                    quantiles1: resultPredictionsNK[0].quantiles[keys1[0]],
                    quantiles9: resultPredictionsNK[0].quantiles[keys1[1]]

                },
                cancellations: resultsNKCancellations,
                dates: resultsNKDates,
                sentiment_analysis: resultsTweets[1].NK.sentiment_analysis

            }

        }

    )

    results.push(

        {

            B6: {

                delays: resultsB6Delays,
                predictions: {
                    mean: resultPredictionsB6[0].mean,
                    quantiles1: resultPredictionsB6[0].quantiles[keys2[0]],
                    quantiles9: resultPredictionsB6[0].quantiles[keys2[1]]

                },
                cancellations: resultsB6Cancellations,
                dates: resultsB6Dates,
                sentiment_analysis: resultsTweets[2].B6.sentiment_analysis

            }

        }

    )

    //Return response to parent 
    const response = {
        statusCode: 200,
        body: results
    };

    return response;

};
