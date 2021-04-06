// Load modules
var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require("url");

// CONSTANTS
// host variables
const hostname = 'localhost';
const port = 3000;
// available APIs
const apis = ['/updatePoints', '/getPoints', '/getQuestionNumber', '/putQuestionNumber'];

// STORED VARIABLES
var totalPoints = 0;
var questionNumber = 0;
var welcomePage = true;
var session;

// CREATE SERVER
const server = http.createServer(function (request, response) {
    console.log('request ', request.url, ' method ', request.method);

    // CHECK INCOMING REQUEST
    
    // If not APIs, then redirect
    if (!apis.includes(request.url)) {
        var filePath = '.' + request.url;

        if (welcomePage) {
            filePath = './views/home.html';
            welcomePage = false;
        } else {
            if (filePath === './' || filePath.includes('/quiz.html')) {
                totalPoints = 0;
                questionNumber = 0;
                filePath = './views/quiz.html';
            }
        }

        var extname = String(path.extname(filePath)).toLowerCase();
        var mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.wav': 'audio/wav',
            '.mp4': 'video/mp4',
            '.woff': 'application/font-woff',
            '.ttf': 'application/font-ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'application/font-otf',
            '.wasm': 'application/wasm'
        };

        var contentType = mimeTypes[extname] || 'application/octet-stream';

        fs.readFile(filePath, function (error, content) {
            if (error) {
                if (error.code == 'ENOENT') {
                    fs.readFile('./404.html', function (error, content) {
                        response.writeHead(404, { 'Content-Type': 'text/html' });
                        response.end(content, 'utf-8');
                    });
                }
                else {
                    response.writeHead(500);
                    response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
                }
            }
            else {
                response.writeHead(200, { 'Content-Type': contentType });
                response.end(content, 'utf-8');
            }
        });
    // else respond to APIs
    } else {
        var resBody;

        const { headers, method, url } = request;
        let body = [];
        
        // handle error
        request.on('error', (err) => {
            console.error(err);
        // handle response
        }).on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            // convert json to a string
            body = Buffer.concat(body).toString();

            response.on('error', (err) => {
                console.error(err);
            });

            // code for actions based on API
            if (request.method === 'PATCH' && request.url.includes('/updatePoints')) {
                console.log('body: ' + body);
                var jsonObject = JSON.parse(body);
                totalPoints += jsonObject;
                resBody = body;

                console.log('points: ', totalPoints);
            } else if (request.method === 'GET' && request.url.includes('/getPoints')) {
                resBody = totalPoints;

                console.log('totalPoints: ' + totalPoints);
            } else if (request.method === 'GET' && request.url.includes('/getQuestionNumber')) {
                resBody = questionNumber;

                console.log('questionNumber: ' + questionNumber);
            } else if (request.method === 'PUT' && request.url.includes('/putQuestionNumber')) {
                console.log('body: ' + body);
                var jsonObject = JSON.parse(body);
                questionNumber = jsonObject;
                resBody = body;

                console.log('questionNumber: ' + questionNumber);
            }

            // prepare response and send
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');

            const responseBody = { headers, method, url, resBody };

            response.write(JSON.stringify(responseBody));
            response.end();
        });
    }
}).listen(port, hostname);