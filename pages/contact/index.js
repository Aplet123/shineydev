module.exports = {
    init: function(app, config) {
        var base = config.BASE;
        var path = require("path");
        var fs = require("fs");
        var _ = require("lodash");
        var request = require("request");
        for (let dir of fs.readdirSync(__dirname)) {
            if((!/^.+\.js$/i.test(dir) && !/^.+\.disabled$/i.test(dir)) || (/^.+\.folder\.js$/i.test(dir) && !/^.+\.disabled$/i.test(dir))) {
                require(path.join(__dirname, dir, "index.js")).init(app, {
                    BASE: base + ((/^.+\.unstable$/i.test(dir)) ? "unstable/" : "") + dir.replace(/\.folder\.js$/i, ".js").replace(/\.unstable$/i, "") + "/"
                });
            }
        }
        app.get(new RegExp("^" + _.escapeRegExp(base) + "{0}\\.?(?:(?:html?)|(?:pug)|(?:jade)|(?:txt))?$"), function(req, res) {
            res.render("pages/contact", {});
        });
        app.post(new RegExp("^" + _.escapeRegExp(base) + "{0}\\.?(?:(?:html?)|(?:pug)|(?:jade)|(?:txt))?$"), function(req, res) {
            if (! (typeof req.body.first == "string" && typeof req.body.last == "string" && typeof req.body.email == "string" && typeof req.body.message == "string")) {
                res.sendStatus(400);
                return;
            }
            if (req.body.first.length == 0 || req.body.last.length == 0 || req.body.message.length < 30 || req.body.message.length > 1000 || req.body.first.length > 50 || req.body.last.length > 50 || req.body.email.length > 50) {
                res.sendStatus(400);
                return;
            }
            if (! req.body.email.match(/^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/gi) && ! req.body.email.match(/^.{1,32}?#\d{4}$/gi)) {
                res.sendStatus(400);
                return;
            }
            request.post({
                url: "https://canary.discordapp.com/api/webhooks/407247225392201729/f5Qkzm6ukzEPlnglqBG_afbhoeI8CpIzEBnxl2tqtw577SwW7kREhx7Oz0u4swE6wEqb",
                json: {
                    embeds: [{
                        title: `New Contact from ${req.body.first} ${req.body.last}`,
                        footer: {
                            text: "Contact at: " + req.body.email
                        },
                        description: req.body.message,
                        color: 0x0000ff
                    }]
                }
            }, function (error, response, body) {
                if (response.statusCode.toString()[0] != "2" || error) {
                    res.sendStatus(500);
                    return;
                }
                res.end("Successful");
            });
            return;
        });
    }
};