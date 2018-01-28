'use strict';

var request = require("request");
var express = require("express");
var _ = require("lodash");
var app = express();
var fs = require("fs");
var path = require("path");

if(! process.env.ENGINE) {
    require("dotenv").config();
} else {
    setInterval(function() {
        request(`https://${process.env.DEPLOY_NAME}.herokuapp.com`, _.noop);
    }, 1200000);
}

app.set('port', (process.env.PORT || 5000));

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(function(req, res, next) {
    if (!/^[-a-zA-Z0-9_.]+(?::\d+)?$/i.test((req.get("Host") || ""))) {
        res.status(400);
        if (req.accepts("text/html")) {
            res.set({
                "Accept": "text/html",
                "Content-Type": "text/html"
            });
            res.render("pages/error", {
                error: "Invalid Host Header",
                status: 400,
                url: _.escape(( req.get("X-Forwarded-Proto") || "http") + "://" + req.get("host") + req.originalUrl),
                method: _.escape(req.method)
            });
        } else if (req.accepts("application/json")) {
            res.set({
                "Accept": "application/json",
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify({
                error: "Invalid Host Header",
                status: 400,
                url: ( req.get("X-Forwarded-Proto") || "http") + "://" + req.get("host") + req.originalUrl,
                method: req.method
            }));
        } else {
            res.set({
                "Accept": "text/plain",
                "Content-Type": "text/plain"
            });
            res.end(`400 on HTTP ${req.method} request: Invalid Host Header | ${( req.get("X-Forwarded-Proto") || "http") + "://" + req.get("host") + req.originalUrl}`);
        }
    } else {
        next();
    }
});

app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.engine("html", require("express-ejs-extend"));
app.set('view engine', 'html');
app.disable("x-powered-by");

app.get('/', function(request, response) {
  response.render('pages/index', {});
});

for (let dir of fs.readdirSync(path.join(__dirname, "api"))) {
    if((!/^.+\.js$/i.test(dir) && !/^.+\.disabled$/i.test(dir)) || (/^.+\.folder\.js$/i.test(dir) && !/^.+\.disabled$/i.test(dir))) {
        require(path.join(__dirname, "api", dir, "index.js")).init(app, {
            BASE: process.env[dir.toUpperCase() + "BASE"] || ( "/api/" + ((/^.+\.unstable$/i.test(dir)) ? "unstable/" : "") + dir.replace(/\.folder\.js$/i, ".js").replace(/\.unstable$/i, "") + "/" )
        });
    }
}

for (let dir of fs.readdirSync(path.join(__dirname, "pages"))) {
    if((!/^.+\.js$/i.test(dir) && !/^.+\.disabled$/i.test(dir)) || (/^.+\.folder\.js$/i.test(dir) && !/^.+\.disabled$/i.test(dir))) {
        require(path.join(__dirname, "pages", dir, "index.js")).init(app, {
            BASE: process.env["PAGES" + dir.toUpperCase() + "BASE"] || ( "/" + ((/^.+\.unstable$/i.test(dir)) ? "unstable/" : "") + dir.replace(/\.folder\.js$/i, ".js").replace(/\.unstable$/i, "") + "/" )
        });
    }
}

app.use(function(req, res) {
    res.status(404);
    if (req.accepts("text/html")) {
        res.render("pages/error", {
            error: "Not Found",
            status: 404,
            url: _.escape(( req.get("X-Forwarded-Proto") || "http") + "://" + req.get("host") + req.originalUrl),
            method: _.escape(req.method)
        });
    } else if (req.accepts("application/json")) {
        res.set({
            "Accept": "application/json",
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            error: "Not Found",
            status: 404,
            url: ( req.get("X-Forwarded-Proto") || "http") + "://" + req.get("host") + req.originalUrl,
            method: req.method
        }));
    } else {
        res.set({
            "Accept": "text/plain",
            "Content-Type": "text/plain"
        });
        res.end(`404 on HTTP ${req.method} request: Not Found | ${( req.get("X-Forwarded-Proto") || "http") + "://" + req.get("host") + req.originalUrl}`);
    }
});

app.listen(app.get('port'), function() {
  console.log(`Running web serer at port ${app.get("port")}.`);
});