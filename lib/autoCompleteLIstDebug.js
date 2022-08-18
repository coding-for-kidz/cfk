const autoCompleteList = require("./autoCompleteList");

autoCompleteList.addUse("hi", "test");
console.log(autoCompleteList.getCompletionList("test"));
