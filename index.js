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

const run = async () => {
    const argv = require('minimist')(process.argv.slice(2));
    if (!(argv['_'][0]==("testcfk"))) {

        let code = 0;
        const action = await inquirer.askWhatToDO();
        let toDo = action.do;

        if (toDo === "gupdate") {
            const answers = await inquirer.askCommitName();
            const commitName = answers.commitname;

            console.clear();

            console.log(
                chalk.blue(
                    figlet.textSync('Coding For Kidz', {horizontalLayout: 'full'})
                )
            );

            console.log(chalk.magenta("Adding files"));


            execSync('git add .', {encoding: 'utf-8', stdio: 'inherit'});
            console.log(chalk.magenta("Commiting files"));
            try {
                const commit = execSync('git commit -S -am "' + commitName + '"', {
                    encoding: 'utf-8',
                    stdio: 'inherit'
                });
            } catch (e) {
                console.log(chalk.yellow('Possibly cannot sign commit attempting to commit unsigned commit'));
                try {
                    const commit = execSync('git commit -am "' + commitName + '"', {
                        encoding: 'utf-8',
                        stdio: 'inherit'
                    });
                } catch (e) {
                    console.log(chalk.yellow('Nothing to commit.'))
                }
            }

            try {
                console.log(chalk.magenta("Pulling files from Heroku"));
                const pull_heroku = execSync('git pull heroku main', {encoding: 'utf-8', stdio: 'inherit'});
                console.log(chalk.magenta("Pulling files from Github"));

                try {
                    const pull_github = execSync('git pull origin main', {encoding: 'utf-8', stdio: 'inherit'});
                } catch (e) {
                    console.log("Github remote may not be configured");
                    const pull_github = execSync('git remote add origin https://github.com/arihant2math/coding-for-kidz-project/', {
                        encoding: 'utf-8',
                        stdio: 'inherit'
                    });
                }

                console.log(chalk.magenta("Pushing files to Heroku"));

                const push_heroku = execSync('git push heroku main', {encoding: 'utf-8', stdio: 'inherit'});

                console.log(chalk.magenta("Pushing files to Github"));

                const push_github = execSync('git push origin main', {encoding: 'utf-8', stdio: 'inherit'});
            } catch (e) {
                console.log('Push or Pull failed \n ' + e);
                code = 1;
            }
        } else if (toDo === "test") {
            const test = execSync('pytest .', {
                encoding: 'utf-8',
                stdio: 'inherit'
            });
        } else if (toDo === "run") {

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
                const run = execSync('python run.py', {encoding: 'utf-8', stdio: 'inherit'});
            } else {
                const os = require('os');
                if (os.type() === "Windows_NT") {
                    console.log(chalk.yellow("Cannot run gunicorn on Windows NT " + os.release))
                    // const run = execSync('start powershell -Command "wsl; cd mnt/"'+'', { encoding: 'utf-8', stdio: 'inherit' });
                    code = 1;
                } else {
                    const run = execSync('gunicorn wsgi:app', {encoding: 'utf-8', stdio: 'inherit'});
                }
            }

        } else if (toDo === "install requirements") {
            const install = execSync('pip install -r dev_requirements.txt', {encoding: 'utf-8', stdio: 'inherit'});
        } else if (toDo === "update") {
            const update = execSync('start powershell -Command "D:; cd documents/programming/github/coding-for-kidz-project/cfk; npm install . -G; exit"', {
                encoding: 'utf-8',
                stdio: 'inherit'
            });
        } else if (toDo === "build") {
            const build = execSync('docker build . -t coding-for-kidz', {encoding: 'utf-8', stdio: 'inherit'});
        }


        if (code === 0) {
            console.log(chalk.green("DONE"));
        } else if (code === 1) {
            console.log(chalk.red("EXITED WITH AN ERROR"));
        }
    }
    else {

    }
};
try {
    let r = run();
}
catch (e) {
    console.log(chalk.red("EXITED WITH AN ERROR"));
}
