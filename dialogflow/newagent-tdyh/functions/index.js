// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
// 'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const https = require('https');
const WeatherApi = require('./util/KMAHandler.js');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    function welcome(agent) {
        agent.add(`Welcome to my agent!`);
    }

    function fallback(agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);
    }

    function askAgain(agent) {
        console.log("---------askAgain------------");
        agent.setFollowupEvent({
            "name": "evt-ask-again"
        });
        agent.add('');
    }

    function getSample(agent) {
        console.log("----------------getSample");
        return sampleAPI()
            .then(result => agent.add(result))
            .catch((err) => agent.add(err));
    }

    function sampleAPI() {
        const url = "https://rubenchoi-test.web.app/test";
        return new Promise((resolve, reject) => {
            https.get(url, function (res) {
                console.log("**************************");
                console.log(res.statusCode, res.headers);
                var json = "";
                res.on("data", function (chunk) {
                    console.log("received JSON response: " + chunk);
                    json += chunk;
                });

                res.on("end", function () {
                    let jsonData = JSON.parse(json);
                    let r = "From Webhook and 3rd party: Type: " + jsonData.type + " Data: " + jsonData.data;
                    resolve(r);
                });
            });
        });
    }

    function getWeather(agent) {
        console.log("----------------getWeather");
        return new WeatherApi().weatherAPI()
            .then(result => agent.add(result))
            .catch((err) => agent.add(err));
    }

    // // Uncomment and edit to make your own intent handler
    // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    // function yourFunctionHandler(agent) {
    //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
    //   agent.add(new Card({
    //       title: `Title: this is a card title`,
    //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
    //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
    //       buttonText: 'This is a button',
    //       buttonUrl: 'https://assistant.google.com/'
    //     })
    //   );
    //   agent.add(new Suggestion(`Quick Reply`));
    //   agent.add(new Suggestion(`Suggestion`));
    //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
    // }

    // // Uncomment and edit to make your own Google Assistant intent handler
    // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    // function googleAssistantHandler(agent) {
    //   let conv = agent.conv(); // Get Actions on Google library conv instance
    //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
    //   agent.add(conv); // Add Actions on Google library responses to your agent's response
    // }
    // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
    // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('conf-room-reservation - no', askAgain);
    intentMap.set('ask-weather', getWeather);
    // intentMap.set('your intent name here', yourFunctionHandler);
    // intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);

});
