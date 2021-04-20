const chalk = require('chalk');
const figlet = require('figlet');
const execSync = require('child_process').execSync;

console.clear();

console.log(
  chalk.blue(
    figlet.textSync('Coding For Kidz', { horizontalLayout: 'full' })
  )
);
const inquirer  = require('./lib/inquirer');

const run = async () => {
  // var argv = require('minimist')(process.argv.slice(2));
  let code=0;
  const action = await inquirer.askWhatToDO();
  const toDo = action.do;

  if (toDo=="gupdate"){
    const answers = await inquirer.askCommitName();
    const commitname = answers.commitname;

    console.clear();

    console.log(
      chalk.blue(
        figlet.textSync('Coding For Kidz', { horizontalLayout: 'full' })
      )
    );

    console.log(chalk.yellow("Adding files"));


    
    const add = execSync('git add .', { encoding: 'utf-8' });
    
    console.log(add);


    console.log(chalk.yellow("Commiting files"));


    
    const commit = execSync('git commit -am "'+commitname+'"', { encoding: 'utf-8' });
    
    console.log(commit);


    console.log(chalk.yellow("Pulling files"));
    

    const pull = execSync('git pull', { encoding: 'utf-8' });

    console.log(pull);


    console.log(chalk.yellow("Pushing files"));


    const push = execSync('git push', { encoding: 'utf-8' });

    console.log(push);
  }
  else if (toDo=="test"){
    const test = execSync('cd website && python -m unittest discover -t ..', { encoding: 'utf-8' });
    console.log(test);
  }
  else if (toDo=="run"){

    const production = await inquirer.askProduction();
    p = production.production;

    console.clear();

    console.log(
      chalk.blue(
        figlet.textSync('Coding For Kidz', { horizontalLayout: 'full' })
      )
    );

    if (p=="no"){
      console.log("Running a webserver on 127.00.0.1 port 5000, press Ctrl-C to quit.");
      const run = execSync('python run.py', { encoding: 'utf-8' });
      console.log(run);
    }
    else {
      const os = require('os');
      if (os.type()=="Windows_NT") {
        console.log(chalk.red("Cannot run gunicorn on "+"Windows NT"+" "+os.release))
        code = 1;
      }
      else {
        const run = execSync('gunicorn wsgi:app', { encoding: 'utf-8' });
        console.log(run);
      }
    }
  }
  else if (toDo=="install requirements") {
    const install = execSync('pip install -r requirements.txt', { encoding: 'utf-8' });
    console.log(install);
  }
  else if (toDo=="update") {
    const update = execSync('start powershell -Command "D:; cd documents/programming/github/coding-for-kidz-project/cfk; npm install . -G; exit"');
    console.log(update);
  }

  else if (toDo=="build") {
    const build = execSync('docker build . -t coding-for-kidz');
    console.log(build);
  }
  if (code==0){
    console.log(chalk.green("DONE"));
  }
  else if (code==1) {
    console.log(chalk.red("EXITED WITH AN ERROR"));
  }
};

run();