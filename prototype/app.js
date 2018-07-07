"use strict";

const express = require('express');
var mime=require('mime');
var expressLogging = require('express-logging');
var logger = require('logops');
const app = express();
const body_parser = require('body-parser');
const path = require('path');
var fs = require('fs');
const http = require('https');

express.static.mime.types['wasm'] = 'application/wasm';

app.use(body_parser.json());
app.use(express.static(path.join(__dirname + 'public')));
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(expressLogging(logger));

app.get('/', function(req, res) {
    res.render('index.html');
});

app.get('/style.css', function(req, res) {    
    res.sendFile(__dirname + '/public/style.css');
});

app.get('/index2.html', function(req, res) {
    res.render('index2.html');
});

app.get('/riscvemu64.wasm', function(req, res) {
    res.sendFile(__dirname + '/public/riscvemu64.wasm');
});

app.get('/term.js', function(req, res) {
    res.sendFile(__dirname + '/public/term.js');
});

app.get('/jslinux.js', function(req, res) {
    res.sendFile(__dirname + '/public/jslinux.js');
});

app.get('/riscvemu64.js', function(req, res) {
    res.sendFile(__dirname + '/public/riscvemu64.js');
});

app.get('/root_9p-riscv64.cfg', function(req, res) {
    res.sendFile(__dirname + '/public/root_9p-riscv64.cfg');
});

app.get('/bbl64.bin', function(req, res) {
    res.sendFile(__dirname + '/public/bbl64.bin');
});

app.get(/^\/(tmp\/.+)/, function(req, res) {
    var rx = new RegExp('/head.+');
    var url = req.originalUrl.match(rx);
    var newUrl;
    var contentType = 'text/plain';

    if (url === null) {
        rx = new RegExp('/files.+');
        url = req.originalUrl.match(rx);
        contentType = 'application/octet-stream';
    }

    newUrl = "https://vfsync.org/u/os/buildroot-riscv64" + url;

    http.get(newUrl, (response) => {
        res.setHeader('Content-type', contentType);
        response.pipe(res);
    });
});

app.post('/initialize', function (req, res) {
    initialize();
    res.redirect('index2.html?mem=16');
});

app.get('/images/upload-icon.png', function(req, res) {
    res.sendFile(__dirname + '/public/images/upload-icon.png');
});

app.get('/images/bg-scrollbar-track-y.png', function(req, res) {
    res.sendFile(__dirname + '/public/images/bg-scrollbar-track-y.png');
});

app.get('/images/bg-scrollbar-trackend-y.png', function(req, res) {
    res.sendFile(__dirname + '/public/images/bg-scrollbar-trackend-y.png');
});

app.get('/images/bg-scrollbar-thumb-y.png', function(req, res) {
    res.sendFile(__dirname + '/public/images/bg-scrollbar-thumb-y.png');
});

const server = app.listen(5000, function() {
    console.log("listening on port %d", server.address().port);
});

function copyFile(src, dest, cb) {
    var cbCalled = false;
    var rd = fs.createReadStream(src);
    var wr = fs.createWriteStream(dest);
    
    rd.on("error", function(err) {
        done(err);
    });

    wr.on("error", function(err) {
        done(err);
    });

    wr.on("close", function(ex) {
        done("file copied.");
    });
    
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
}

function initialize() {
    copyFile(__dirname + "/originals/original.txt", __dirname + "/temp/copied.txt", console.log);
}
