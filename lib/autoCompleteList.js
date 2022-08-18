const fs = require("fs");
const os = require("os");
const path = require("path");

function addUse(use, command) {
    let content;
    let contentJson;
    let fileLocation = path.join(os.homedir(), ".cfk/data/autoComplete" + command + ".json");
    fs.writeFile(fileLocation, "{}", { flag: 'wx' }, function (err) {
        if (err) throw err;
        console.log("It's saved!");
    });
    try {
        content = fs.readFileSync(fileLocation);
        contentJson = JSON.parse(content);
    }
    catch (e) {
        fs.writeFile(fileLocation, "{}", err => {
            if (err) {
                console.error(err);
            }
            // file written successfully
        });
        contentJson = {"": 0}
    }
    console.log(typeof contentJson);
    if (contentJson.hasOwnProperty(use)) {
        contentJson[use] += 1;
    }
    else {
        contentJson[use] = 1;
    }
    fs.writeFile(fileLocation, contentJson.stringify(), err => {
        if (err) {
            console.error(err);
        }
        // file written successfully
    });
}

function getCompletionList(command) {
    let fileLocation = path.join(os.homedir(), ".cfk/data/autoComplete" + command + ".json");
    try {
        const content = fs.readFileSync(fileLocation);
    }
    catch (e) {
        return [];
    }
    const completionList = JSON.parse(content);
    var highest = {};
    for(var completion in completionList) {
        let firstLetter = completion.substring(0, 1);
        let occurrences = completionList[completion];
        if (completionList.hasOwnProperty(firstLetter)) {
             if (completionList[firstLetter][0] < occurrences) {
                 completionList[firstLetter] = {completion: occurrences}
             }
        }
        else {
            highest[firstLetter] = {completion: occurrences}
        }
    }
    let completions = [];
    for (completion in highest) {
        completions.push(completion[0]);
    }
    return completions;
}

module.exports = {
    addUse: addUse,
    getCompletionList: getCompletionList
};
