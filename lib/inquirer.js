const inquirer = require('inquirer');
const argv = require('minimist')(process.argv.slice(2));
    module.exports = {
    askWhatToDO: () => {
        const questions = [
            {
                name: 'do',
                type: 'list',
                message: 'What do ' +
                    'you need to do?',
                default: argv['_'][0],
                choices: ['run', 'test', 'gupdate', 'install requirements', 'build', 'update', 'quit'],
                filter: function (val) {
                    return val.toLowerCase();
                }
            }
        ];
        return inquirer.prompt(questions);
    },
    askProduction: () => {
        let runProduction;
        const os = require('os');
        if (os.type() === "Windows_NT") {
            runProduction = "No";
        }
        else {
            runProduction = "Yes";
        }
        const questions = [
            {
                name: 'production',
                type: 'list',
                default: runProduction,
                message: 'Do you want to run a production server?',
                choices: ['Yes', 'No'],
                filter: function (val) {
                    return val.toLowerCase();
                }
            }
        ];
        return inquirer.prompt(questions);
    },
    askCommitName: () => {
        const questions = [
            {
                name: 'commitname',
                type: 'input',
                message: 'Enter your commit name:',
                default: "commit",
                validate: function (value) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter the name of your commit.';
                    }
                }
            }
        ];
        return inquirer.prompt(questions);
    },
};
