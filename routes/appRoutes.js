'use strict';
module.exports = function (app) {
    var screenshot = require('../helper/screenshot');
    var responses = require('../helper/responses');

    // user Routes
    app.get("/", function (req, res) {
        res.render("index");
    });

    app.post("/", screenshot.capture);

    // star routes
    app.get('*', function (req, res) {
        return responses.errorMsg(res, 404, "Not Found", "path not found.", null);
    });

    app.put('*', function (req, res) {
        return responses.errorMsg(res, 404, "Not Found", "path not found.", null);
    });

    app.delete('*', function (req, res) {
        return responses.errorMsg(res, 404, "Not Found", "path not found.", null);
    });

    app.post('*', function (req, res) {
        return responses.errorMsg(res, 404, "Not Found", "path not found.", null);
    });

};