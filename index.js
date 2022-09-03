const chalk = require('chalk'); // Color
const execSync = require('child_process').execSync; // Execute shell commands
const execFileSync = require('child_process').execFileSync;
const vorpal = require('vorpal')(); // Create shell
const figlet = require('figlet'); // ASCII Art
const path = require('path'); // Path manipulation
const clear = require('clear'); // clear the terminal
const CLI = require('clui');
const clc = require('cli-color');
const simpleGit = require('simple-git');

const options = {
   baseDir: process.cwd().substring(0, process.cwd()),
   binary: 'git',
   maxConcurrentProcesses: 6,
   trimmed: false,
};


// when setting all options in a single object
const git = simpleGit(options);

clear();

console.log(
    chalk.greenBright(
        figlet.textSync('Coding For Kidz', {horizontalLayout: 'full'})
    )
);

function run(command) {
    execSync(command, {encoding: 'utf-8', stdio: 'inherit'});
}

function runCommand(exec, args) {
    execFileSync(exec, args)
}

function getBranch() {
    let branchName = execSync('git branch --no-color', {encoding: 'utf-8'});
    branchName = branchName.substring(2, branchName.length - 1);
    return branchName
}

function commitChanges(commitName) {
    try {
        run('git commit -S -m "' + commitName + '"');
    } catch (e) {
        console.log(chalk.yellow('Possibly cannot sign commit attempting to commit unsigned commit'));
        try {
            run('git commit -m "' + commitName + '" --no-gpg-sign'); // Commits files without signing them
        } catch (e) {
            console.log(chalk.yellow('Nothing to commit.')) // There probably isn't anything to commit
        }
    }
}


function pushChanges(branchName) {
    try {
        console.log(chalk.magenta("Pulling commits from Heroku"));
        git.pull("heroku");
        console.log(chalk.magenta("Pulling commits from Github"));
        git.pull("github");

        console.log(chalk.magenta("Pushing commits to Github"));
        git.push('github')

        console.log(chalk.magenta("Pushing commits to Heroku"));
        git.push('heroku', branchName)

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
    let branchName = getBranch();
    if (format) {
        run('black .'); // formats repository
    }
    git.add(["."]);
    console.log(chalk.magenta("Committing files"));
    commitChanges(commitName);
    return pushChanges(branchName);
}

async function runServer(production) {
    if (!production) {
        console.log(chalk.magenta("Running a webserver on 127.00.0.1 port 5000, press Ctrl-C to quit."));
        run('python run.py -v 10 --debug');
    } else {
        const os = require('os');
        if (os.type() === "Windows_NT") {
            console.log(chalk.yellow("Cannot run gunicorn on Windows NT " + os.release + " running with waitress"))
            run("waitress-serve --call 'app:app'");
            return 1;
        } else {
            run('gunicorn wsgi:app');
        }
    }
    return 0;
}

function docker() {
    console.log(chalk.magenta("Building and running with docker compose"));
    run('docker compose build');
    try {
        run('docker compose down -v');
    }
    catch (e) {

    }
    try {
        run('docker compose up');
    }
    catch (e) {
        run('docker compose down -v');
    }
}

function installRequirements() {
    try {
        run('pip-compile requirements.in -U');
        run('pip-compile dev-requirements.in -U');
        run('pip install -r requirements.txt');
        run('pip install -r dev-requirements.txt');
    }
    catch (e) {
        run('pip install -r dev-requirements.txt');
    }
}

async function listOutdatedRequirements() {
    run('pip list --outdated');
}

function changeDelimiter(newDelimiter) {
    vorpal.delimiter(newDelimiter);
    vorpal.ui.refresh();
}

vorpal
    .command('cd', 'Changes your working directory')
    .action(function(args, callback) {
        this.log("Not Implemented");
        callback();
    })


vorpal
    .command('dir', 'Lists all files in working directory')
    .action(function(args, callback) {
        run("dir");
        callback();
    })

vorpal
    .command('req', 'Installs the requirements.')
    .action(function(args, callback) {
        installRequirements();
        callback();
    });


vorpal
    .command('outdated', 'Lists outdated requirements')
    .action(function(args, callback) {
        let spinner = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'];
        listOutdatedRequirements().then(r => callback());
    });

vorpal
    .command('docker', 'Runs a docker container.')
    .action(function(args, callback) {
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
    .command('version', 'Prints the version')
    .action(function(args, callback) {
        this.log("CFK: v0.0.0\nNode: " + process.version);
        callback();
    })

vorpal
    .command('format', 'Formats with black')
    .action(function(args, callback) {
        run("black .");
        callback();
    })

branch = chalk.magenta(getBranch());

python = chalk.yellow(execSync("python --version", {encoding: "utf-8"}).replace(/(\r\n|\n|\r)/gm, ""))
node = chalk.greenBright("Node " + process.version);

vorpal
  .delimiter(chalk.blue("Coding for Kidz") + " on " + branch + " via " + python + " via " +
      node + "\n" + chalk.greenBright('\u203A'))
  .show();
