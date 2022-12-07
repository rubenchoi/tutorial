const mqtt = require('mqtt');

const logger = (...args) => console.log("[backend] ", ...args);

const SHELL_LAUNCHER = './nodejs/shell-launcher.js'

const DEFAULT_HOST = "ws://127.0.0.1:8888"
const DEFAULT_TOPIC = "backend-shell-launcher"
const TOPIC_OF_INTEREST = 'topic_of_interest'

const topic = DEFAULT_TOPIC;

const mqttClient = mqtt.connect(DEFAULT_HOST);
mqttClient.on('connect', () => {
    logger('mqtt connected');

    mqttClient.subscribe([topic, TOPIC_OF_INTEREST]);
    mqttClient.on('message', (topic, message) => {
        logger(`received<<${topic}>> ${message.toString()}`);

        if (topic === TOPIC_OF_INTEREST) {
            require(SHELL_LAUNCHER)(false, 'test1', mqttClient, DEFAULT_TOPIC);
        }
    });
});

require('yargs')
    .command({
        command: 'python',
        handler: (argv) => {
            const filename = argv._[1];
            logger(`[Shell Launcher] node backend.js py ${filename}`);
            require(SHELL_LAUNCHER)(true, filename, mqttClient, topic);
        }
    })
    .command({
        command: ['shell', '*'],
        handler: (argv) => {
            const filename = argv._[1];
            logger(`[Shell Launcher] node backend.js shell ${filename}`);
            require(SHELL_LAUNCHER)(false, filename, mqttClient, topic);
        }
    })
    .showHelpOnFail(true)
    .help('help', 'node backend.js pylaunch filepath')
    .demandCommand()
    .argv
