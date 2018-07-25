"use strict";

var cors = require('cors');
var mime = require('mime');
var expressLogging = require('express-logging');
var logger = require('logops');
var fs = require('fs');
const express = require('express');
const body_parser = require('body-parser');
const path = require('path');
const http = require('https');
const app = express();

var key = fs.readFileSync('certificates/key.pem');
var cert = fs.readFileSync('certificates/cert.pem');
var options = {
    key: key,
    cert: cert
};

express.static.mime.types['wasm'] = 'application/wasm';

app.use(cors());
app.use(body_parser.json());
app.use(express.static(path.join(__dirname + 'public')));
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(expressLogging(logger));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://vfsync.org");
    
    if(!req.secure) {
        console.log('*** insecure request received ***');
        var secureUrl = "https://" + req.headers['host'] + req.url; 
        res.writeHead(301, { "Location":  secureUrl });
        res.end();
    }
    next();
});

app.get('/', function(req, res, next) {
    res.render('index.html');
});

app.get('/style.css', function(req, res, next) {    
    res.sendFile(__dirname + '/public/style.css');
});

app.get('/index2.html', function(req, res, next) {
    res.render('index2.html');
});

app.get('/riscvemu64.wasm', function(req, res, next) {
    res.sendFile(__dirname + '/public/riscvemu64.wasm');
});

app.get('/term.js', function(req, res, next) {
    res.sendFile(__dirname + '/public/term.js');
});

app.get('/jslinux.js', function(req, res, next) {
    res.sendFile(__dirname + '/public/jslinux.js');
});

app.get('/riscvemu64.js', function(req, res, next) {
    res.sendFile(__dirname + '/public/riscvemu64.js');
});

app.get('/root-riscv64.cfg', function(req, res, next) {
    res.sendFile(__dirname + '/public/root-riscv64.cfg');
});

app.get('/root_9p-riscv64.cfg', function(req, res, next) {
    res.sendFile(__dirname + '/public/root_9p-riscv64.cfg');
});

app.get('/bbl64.bin', function(req, res, next) {
    res.sendFile(__dirname + '/public/bbl64.bin');
});

app.get('/root-riscv64.bin', function(req, res, next) {
    res.sendFile(__dirname + '/public/root-riscv64.bin');
});

app.get(/^\/(tmp\/.+)/, function(req, res, next) {
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

app.post('/initialize', function (req, res, next) {
    initialize();
    res.redirect('https://127.0.0.1:5000/index2.html');
});

app.get('/images/upload-icon.png', function(req, res, next) {
    res.sendFile(__dirname + '/public/images/upload-icon.png');
});

app.get('/images/bg-scrollbar-track-y.png', function(req, res, next) {
    res.sendFile(__dirname + '/public/images/bg-scrollbar-track-y.png');
});

app.get('/images/bg-scrollbar-trackend-y.png', function(req, res) {
    res.sendFile(__dirname + '/public/images/bg-scrollbar-trackend-y.png');
});

app.get('/images/bg-scrollbar-thumb-y.png', function(req, res, next) {
    res.sendFile(__dirname + '/public/images/bg-scrollbar-thumb-y.png');
});

const server = http.createServer(options, app).listen(5000, function() {
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
