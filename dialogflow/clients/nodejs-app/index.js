const PORT_DIALOGFLOW_NODE_APP = 8001;

const DIALOGFLOW_NODE_APP = './src/DialogflowNodeApp.js'
const TEST_APP = './sample/DetectTextIntent.js'

require('yargs')
    .command({
        command: 'test',
        handler: () => {
            require(TEST_APP);
        }
    })
    .command({
        command: '*',
        handler: () => {
            console.log("[Dialogflow-Tutorial]");
            require(DIALOGFLOW_NODE_APP)(PORT_DIALOGFLOW_NODE_APP);
        }
    })
    .showHelpOnFail(true)
    .help('help', 'npm [start|test]')
    .demandCommand()
    .argv
