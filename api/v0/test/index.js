module.exports = {
    init: function(app, config) {
        var base = config.BASE;
        var path = require("path");
        var fs = require("fs");
        for (let dir of fs.readdirSync(__dirname)) {
            if((!/^.+\.js$/i.test(dir) && !/^.+\.disabled$/i.test(dir)) || (/^.+\.folder\.js$/i.test(dir) && !/^.+\.disabled$/i.test(dir))) {
                require(path.join(__dirname, dir, "index.js")).init(app, {
                    BASE: base + ((/^.+\.unstable$/i.test(dir)) ? "unstable/" : "") + dir.replace(/\.folder\.js$/i, ".js").replace(/\.unstable$/i, "") + "/"
                });
            }
        }
        app.get(base, function(req, res) {
            res.end("hi");
        });
    }
};