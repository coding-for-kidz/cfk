const chalk = require('chalk');
const execSync = require('child_process').execSync;
const vorpal = require('vorpal')();

console.clear();

// console.log(
//     chalk.blue(
//         figlet.textSync('Coding For Kidz', {horizontalLayout: 'full'})
//     )
// );


function commitChanges(commitName) {
    try {
        execSync('git commit -S -m "' + commitName + '"', {
            encoding: 'utf-8',
            stdio: 'inherit'
        }); // Uses signing
    } catch (e) {
        console.log(chalk.yellow('Possibly cannot sign commit attempting to commit unsigned commit'));
        try {
            execSync('git commit -m "' + commitName + '" --no-gpg-sign', {
                encoding: 'utf-8',
                stdio: 'inherit'
            }); // Commits files without signing them
        } catch (e) {
            console.log(chalk.yellow('Nothing to commit.')) // There probably isn't anything to commit
        }
    }
}


function pushChanges(branchName) {
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
            }); // GitHub remote might not be configured
        }

        console.log(chalk.magenta("Pushing commits to Github"));

        execSync('git push github ' + branchName + ' --recurse-submodules=on-demand', {encoding: 'utf-8', stdio: 'inherit'});

        console.log(chalk.magenta("Pushing commits to Heroku"));

        execSync('git push heroku ' + branchName + ' --recurse-submodules=on-demand', {encoding: 'utf-8', stdio: 'inherit'});

        return 0;
    } catch (e) {
        console.log('Push or Pull failed \n ' + e);
        return 1;
    }
}

function gupdate(commitName, format) {
    if (commitName === undefined) {
        return false;
    }
    let branchName = execSync('git branch --no-color', {encoding: 'utf-8'});
    branchName = branchName.substring(2, branchName.length - 1);
    if (format) {
        execSync('black .', {encoding: 'utf-8', stdio: 'inherit'}); // formats repository
    }
    execSync('git add .', {
        encoding: 'utf-8',
        stdio: 'inherit'
    }); // Adds files
    console.log(chalk.magenta("Committing files"));
    commitChanges(commitName);
    return pushChanges(branchName);
}

async function runServer(production) {
    if (!production) {
        console.log(chalk.magenta("Running a webserver on 127.00.0.1 port 5000, press Ctrl-C to quit."));
        execSync('python run.py -v 10 --debug', {encoding: 'utf-8', stdio: 'inherit'});
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
        execSync('pip install -r requirements.txt', {encoding: 'utf-8', stdio: 'inherit'});
        execSync('pip install -r dev-requirements.txt', {encoding: 'utf-8', stdio: 'inherit'});
    }
    catch (e) {
        execSync('pip install -r dev-requirements.txt', {encoding: 'utf-8', stdio: 'inherit'});
    }
}

vorpal
    .command('req', 'Installs the requirements.')
    .action(function(args, callback) {
        this.log(args)
        installRequirements();
        callback();
    });

vorpal
    .command('docker <requiredArg>', 'Runs a docker container.')
    .action(function(args, callback) {
        let production = false
        docker();
        callback();
    });

vorpal
    .command('run', 'Runs the server.')
    .option('-p, --prod', 'Uses Production.')
    .action(function (args, callback) {
        runServer(args.options.prod);
        callback();
    })

vorpal
    .command('gupdate [commitName]', 'Sync with VCS.')
    .autocomplete(["updates", "formatting"])
    .option('-f --format', 'Format the files with black')
    .action(function (args, callback) {
        let gupdateResult = gupdate(args.commitName, args.options.format);
        if (!gupdateResult) {
            this.log("Commit name not specified");
        }
        callback();
    })

vorpal
  .delimiter('cfk>')
  .show();
