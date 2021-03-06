const chalk = require('chalk');
const figlet = require('figlet');
const execSync = require('child_process').execSync;

console.clear();

console.log(
    chalk.blue(
        figlet.textSync('Coding For Kidz', {horizontalLayout: 'full'})
    )
);
const inquirer = require('./lib/inquirer');

const os = require('os');

async function commitChanges(commitName) {
        try {
        execSync('git commit -S -m "' + commitName + '"', {
            encoding: 'utf-8',
            stdio: 'inherit'
        }); // Uses signing
    } catch (e) {
        console.log(chalk.yellow('Possibly cannot sign commit attempting to commit unsigned commit'));
        try {
            const commit = execSync('git commit -m "' + commitName + '"', {
                encoding: 'utf-8',
                stdio: 'inherit'
            }); // Commits files without signing them
        } catch (e) {
            console.log(chalk.yellow('Nothing to commit.')) // There probably isn't anything to commit
        }
    }
}


async function pushChanges(branchName) {
    try {
        console.log(chalk.magenta("Pulling commits from Heroku"));
        execSync('git pull heroku ' + branchName, {encoding: 'utf-8', stdio: 'inherit'});
        console.log(chalk.magenta("Pulling commits from Github"));

        try {
            execSync('git pull github ' + branchName, {encoding: 'utf-8', stdio: 'inherit'});
        } catch (e) {
            console.log("Github remote may not be configured");
            execSync('git remote add github https://github.com/coding-for-kidz/coding-for-kidz-project/', {
                encoding: 'utf-8',
                stdio: 'inherit'
            }); // Github remote might not be configured
        }

        console.log(chalk.magenta("Pushing commits to Heroku"));

        execSync('git push heroku ' + branchName + ' --recurse-submodules=on-demand', {encoding: 'utf-8', stdio: 'inherit'});

        console.log(chalk.magenta("Pushing commits to Github"));

        execSync('git push github ' + branchName + ' --recurse-submodules=on-demand', {encoding: 'utf-8', stdio: 'inherit'});
        return 0;
    } catch (e) {
        console.log('Push or Pull failed \n ' + e);
        return 1;
    }
}
async function gupdate() {
    const answers = await inquirer.askCommitName();
    const commitName = answers.commitname;

    let branchName = execSync('git branch --no-color', {encoding: 'utf-8'});
    branchName = branchName.substring(2, branchName.length - 1);


    console.clear();

    console.log(
        chalk.blue(
            figlet.textSync('Coding For Kidz', {horizontalLayout: 'full'})
        )
    );
    execSync('black .', {encoding: 'utf-8', stdio: 'inherit'}); // formats repository
    execSync('git add .', {
        encoding: 'utf-8',
        stdio: 'inherit'
    }); // Adds files
    console.log(chalk.magenta("Commiting files"));
    await commitChanges(commitName);
    return await pushChanges(branchName);
}


async function runServer() {
    const production = await inquirer.askProduction();
    let p = production.production;

    console.clear();

    console.log(
        chalk.blue(
            figlet.textSync('Coding For Kidz', {horizontalLayout: 'full'})
        )
    );

    if (p === "no") {
        console.log(chalk.magenta("Running a webserver on 127.00.0.1 port 5000, press Ctrl-C to quit."));
        execSync('python run.py --debug', {encoding: 'utf-8', stdio: 'inherit'});
    } else {
        const os = require('os');
        if (os.type() === "Windows_NT") {
            console.log(chalk.yellow("Cannot run gunicorn on Windows NT " + os.release + " running with waitress"))
            execSync("waitress-serve --call 'app:app'", {encoding: 'uft-8', stdio: 'inherit'});
            return 1;
        } else {
            execSync('gunicorn wsgi:app', {encoding: 'utf-8', stdio: 'inherit'});
        }
    }
    return 0;
}

function docker() {
    console.log(chalk.magenta("Building and running with docker compose"));
    execSync('docker compose build', {encoding: 'utf-8', stdio: 'inherit'});
    try {
        execSync('docker compose down -v', {encoding: 'utf-8', stdio: 'inherit'});
    }
    catch (e) {

    }
    try {
        execSync('docker compose up', {encoding: 'utf-8', stdio: 'inherit'});
    }
    catch (e) {
        execSync('docker compose down -v', {encoding: 'utf-8', stdio: 'inherit'});
    }
}

function installRequirements() {
    try {
         execSync('pip-compile requirements.in -U', {encoding: 'utf-8', stdio: 'inherit'});
        execSync('pip-compile dev-requirements.in -U', {encoding: 'utf-8', stdio: 'inherit'});
        execSync('pip install -r dev-requirements.txt', {encoding: 'utf-8', stdio: 'inherit'});
    }
    catch (e) {
        execSync('pip install -r dev-requirements.txt', {encoding: 'utf-8', stdio: 'inherit'});
    }
}

const run = async () => {
    const argv = require('minimist')(process.argv.slice(2));
    if (!(argv['_'][0]===("testcfk"))) { // for testing purposes
        let code = 0;
        const action = await inquirer.askWhatToDO();
        let toDo = action.do;

        if (toDo === "gupdate") {
            code = await gupdate();
        }
        else if (toDo === "test") {
            execSync('pytest . -v', {encoding: 'utf-8',
                stdio: 'inherit'
            });
        }
        else if (toDo === "run") {
            code = await runServer();
        }
        else if (toDo === "install requirements") {
            installRequirements();
        }
        else if (toDo === "build and run") {
            docker();
        }

        if (code === 0) {
            return chalk.green("DONE");
        } else if (code === 1) {
            return chalk.red("EXITED WITH AN ERROR");
        }
    }
};
try {
    run().then(r => {console.log(r)});
}
catch (e) {
    console.log(chalk.red("EXITED WITH AN ERROR"));
    console.log(e);
}
