const dotenv = require('dotenv');

const Twitter = require('twitter');

dotenv.config();

import { Database } from './database';

const client = new Twitter({
    consumer_key: 'CPl5Wbip7J6CIp9mEzWR4sltQ',
    consumer_secret: 'LgduVglLtfJib6maPOIa4DowEgKDi1hCeXaR00VLFENGOkUk6F',
    access_token_key: '1232271208856637441-g30KfrfRyjiq8qMoN3FxjJTDUgFs8N',
    access_token_secret: 'WqkgzdgxmcN65imqmbBKBPrW5fO9pesGvKiW1gUO5fHYw'
});

interface Tweet {

    TWEET_ID: number;
    TWEET_TIMESTAMP: number;
    TWEET_DATE: string;
    TWEET_CARRIER: string;
    TWEET_TEXT: string;

}

class Main {

    database: Database;

    constructor() {

        this.database = new Database(

            'us-east-1',
            'ASIAT4XI3T3QLVC42VBI',
            'yEyMWPNvz2VG7gBsBmmdXqCToV3h95Zi046rYx5c',
            'FwoGZXIvYXdzEOz//////////wEaDJcITuc3OTwV5NovPSK/ATpupKceeYbavmNDX644+VJVDfF6YQWxVSWvfOyINR+AmEdH8wvuJ3gt1ZTIgwgBOqjJOOaShuX9om3YLg6OmKqPpglGsoFxcEB364SQUraOVGd211dfAMWPQqWwN8npGbNhSXrKNQ5XcH48WHcN6zoMZd6L2umdeo9Ign4MW2grJXQThxk0UMkiAgJXehsx0GfIN8Qte853UHoUNyimYvrUx4B4hP4LOAv8EWn7XiU4h64jrTUUKlnYzE5wwbTMKJWMypAGMi3o2LiF0nkGYUG7To/1aby3QfY9vIXG2at7nq6xuTZdomyRah82SrwKdeDESDk='
        )
    }

    arrayTweets: any = [];

    async storeTweets(keyword: string) {

        this.database.connect();

        try {

            let searchParams = {
                q: keyword,
                count: 100,
                lang: 'en',
                tweet_mode: 'extended'
            };

            let twitterResult = await client.get('search/tweets', searchParams);

            for (let i = 0; i < twitterResult.statuses.length; i++) {

                let newObject: Tweet = {

                    TWEET_ID: twitterResult.statuses[i].id,
                    TWEET_CARRIER: keyword,
                    TWEET_TIMESTAMP: new Date(twitterResult.statuses[i].created_at).valueOf(),
                    TWEET_DATE: twitterResult.statuses[i].created_at,
                    TWEET_TEXT: twitterResult.statuses[i].full_text

                }

                let params = {

                    PutRequest: {
                        Item: {
                            "TWEET_ID": { "N": newObject.TWEET_ID.toString() },
                            "TWEET_CARRIER": { "S": newObject.TWEET_CARRIER },
                            "TWEET_TIMESTAMP": { "N": newObject.TWEET_TIMESTAMP.toString() },
                            "TWEET_DATE": { "S": newObject.TWEET_DATE },
                            "TWEET_TEXT": { "S": newObject.TWEET_TEXT },
                        }
                    }

                }

                this.arrayTweets.push(params);

                if (this.arrayTweets.length === 25) {

                    this.database.storeData(this.arrayTweets);
                    this.arrayTweets = [];

                }

            }

        } catch (error) {

        }

    }

}

let main: Main = new Main();

main.storeTweets("AmericanAir");
main.storeTweets("JetBlue");
main.storeTweets("SpiritAirlines");


