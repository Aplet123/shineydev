var _ = require("lodash");
module.exports = {
    init: function (bot) {
        bot.on("message", function(message) {
            const prefix = "<=>";
            var instruction;
            if (message.author.bot) {
                return;
            }
            if (! (new RegExp("^"+ _.escapeRegExp(prefix) + "[^]+", "i")).test(message.content)) {
                return;
            }
            instruction = message.content.slice(prefix.length);
            if (/^halp$/i.test(instruction)) {
                message.author.sendMessage("no");
            }
        });
    }
};