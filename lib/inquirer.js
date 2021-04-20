const inquirer = require('inquirer');

module.exports = {
  askWhatToDO: () => {
    const questions = [
      {
        name: 'do',
        type: 'list',
        message: 'What do you need to do?',
        choices: ['run', 'test', 'gupdate', 'install requirements', 'build', 'update', 'quit'],
        filter: function (val) {
          return val.toLowerCase();
        }
      }
    ];
    return inquirer.prompt(questions);
  },
  askProduction: () => {
    const questions = [
      {
        name: 'production',
        type: 'list',
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
        validate: function( value ) {
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
