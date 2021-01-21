const http = require('http');
const port = 3000;
const host = 'localhost';

global.OBJECT = undefined;

const readBody = (request) => {
    return new Promise((resolve, reject) => {
        let data = '';

        request.on('data', chunk => data += chunk);
        request.on('end', () => {
            try {
                resolve(JSON.parse(data))
            } catch (e) {
                reject(e)
            }
        });
    });
}

const requestHandler = async (request, response) => {
    switch (request.method) {
        case 'POST':
            if (global.OBJECT === undefined) {
                try {
                    global.OBJECT = await readBody(request);

                    response.writeHeader(200);
                } catch (_) {
                    response.writeHeader(400);
                }
            } else {
                response.writeHeader(400);
            }

            break;
        case 'PUT':
            if (global.OBJECT !== undefined) {
                try {
                    global.OBJECT = await readBody(request);

                    response.writeHeader(200);
                } catch (_) {
                    response.writeHeader(400);
                }
            } else {
                response.writeHeader(400);
            }

            break;

        case 'PATCH':
            if (global.OBJECT !== undefined) {
                try {
                    Object.assign(global.OBJECT, await readBody(request));

                    response.writeHeader(200);
                } catch (_) {
                    response.writeHeader(400);
                }
            } else {
                response.writeHeader(400);
            }

            break;

        case 'GET':
            response.setHeader('Content-Type', 'application/json');
            response.writeHeader(200);
            response.write(JSON.stringify(global.OBJECT || null));

            break;

        case 'DELETE':
            if (global.OBJECT !== undefined) {
                global.OBJECT = undefined;

                response.writeHeader(200);
            } else {
                response.writeHeader(400);
            }

            break;

        default:
            response.writeHeader(405);
    }

    response.end();
}

const server = http.createServer(requestHandler);

const start = () => server.listen(port, host, () => {
    console.log(`Server is listening on ${host}:${port}`);
});

start();

module.exports = {
    stop: () => server.close(),
    start
};