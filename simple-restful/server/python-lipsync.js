const PATH_PYTHON_DIR = require('path').resolve(__dirname, "../python") + '/';

const DEBUG = (...args) => console.log("[python--lip--sync] ", ...args);

const onError = (err) => {
    // console.log(err);
    DEBUG("* ERROR: Failed to run Lipsync");
    // DEBUG("*1. See requirements.txt and intalled.txt");
    // DEBUG("**********************************************************************************");
}

class PythonLipsync {
    constructor() {
        try {
            DEBUG("starting...");
            let command = require('child_process')
                .spawn('python', [PATH_PYTHON_DIR + 'lipsync/interface.py'],
                    { cwd: PATH_PYTHON_DIR });

            command.stdout.on("data", m => DEBUG(m));
            command.stderr.on("data", m => DEBUG(m));
            command.on("exit", m => DEBUG('Exit: ' + m));
        } catch (err) {
            onError(err);
        }
    }
}

module.exports = () => {
    return new PythonLipsync()
};
