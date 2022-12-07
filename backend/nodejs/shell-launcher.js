const TEST_FILE = 'test1'

const logger = (...args) => console.log("[shell-launcher] ", ...args);

class ShellLauncher {
    constructor(isPython = true, filename = TEST_FILE, mqttClient, topic) {
        try {
            const BASE_DIR = require('path').resolve(__dirname, isPython ? "../python" : "../shell");
            const filepath = `${BASE_DIR}/${filename}.${isPython ? 'py' : 'sh'}`;
            logger(`launch ${isPython ? 'python ' : ''} shell for ${filepath}`);
            const command = require('child_process').spawn(isPython ? 'python3' : 'sh', [filepath], { cwd: BASE_DIR });
            command.stdout.on("data", m => {
                const received = m.toString().trim();
                mqttClient.publish(topic, received);
                logger(received);
            });
            command.stderr.on("data", m => {
                logger('********** ERROR **********')
                logger(m.toString())
            });
            command.on("exit", m => logger(`test ends`));
        } catch (err) {
            logger(err);
        }
    }
}

module.exports = (isPython, filename, mqttClient, topic) => {
    return new ShellLauncher(isPython, filename, mqttClient, topic);
};
