const server = require('./index')
const http = require('http');

const request = (options, data) => {
    return new Promise((resolve) => {
        const req = http.request(
            options,
            resolve
        )

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    })
};


describe('Simple server', () => {
    beforeEach(() => {
        global.OBJECT = undefined;
    });

    afterAll(() => {
        server.stop();
    });

    const object = {'hello': 'world'};
    const requestOptions = {hostname: 'localhost', port: '3000', protocol: 'http:'};

    describe('POST', () => {
        it('should save sent object', async () => {
            await request({...requestOptions, method: 'POST'}, object);

            expect(global.OBJECT).toStrictEqual(object);
        });

        it('should return 200 if object is not created', async () => {
            const res = await request({...requestOptions, method: 'POST'}, object);

            expect(res.statusCode).toBe(200);
        });

        it('should return 400 if object is already created', async () => {
            global.OBJECT = object;

            const res = await request({...requestOptions, method: 'POST'}, object);

            expect(res.statusCode).toBe(400);
        });

        it('should return 400 if invalid data passed', async () => {
            const res = await request({...requestOptions, method: 'POST'});

            expect(res.statusCode).toBe(400);
        })
    });

    describe('PUT', () => {
       const newObject = {world: 'hello'};

        it('should replace object', async () => {
           global.OBJECT = object;

           await request({...requestOptions, method: 'PUT'}, newObject);

           expect(global.OBJECT).toStrictEqual(newObject);
        });

        it('should return 200 if object replaced', async () => {
            global.OBJECT = object;

            const res = await request({...requestOptions, method: 'PUT'}, newObject);

            expect(res.statusCode).toBe(200);
        });

        it('should return 400 if object is not created yet', async () => {
            const res = await request({...requestOptions, method: 'PUT'}, object);

            expect(res.statusCode).toBe(400);
        });

        it('should return 400 if invalid data passed', async () => {
            global.OBJECT = object;
            const res = await request({...requestOptions, method: 'PUT'});

            expect(res.statusCode).toBe(400);
        });
    });

    describe('PATCH', () => {
        const newObject = {'hello': 'мир', 'world': 'hello'};

        it('should update object', async () => {
            global.OBJECT = object;

            await request({...requestOptions, method: 'PATCH'}, newObject);

            expect(global.OBJECT).toStrictEqual({...object, ...newObject});
        });

        it('should return 200 if object is updated', async () => {
            global.OBJECT = object;

            const res = await request({...requestOptions, method: 'PATCH'}, newObject);

            expect(res.statusCode).toBe(200);
        });

        it('should return 400 if object is not created yet', async () => {
            const res = await request({...requestOptions, method: 'PATCH'}, newObject);

            expect(res.statusCode).toBe(400);
        });

        it('should return 400 if invalid data passed', async () => {
            global.OBJECT = object;

            const res = await request({...requestOptions, method: 'PATCH'});

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET', () => {
        it('should return saved object', async () => {
            global.OBJECT = object;

            const res = await request({...requestOptions, method: 'GET'});

            const data = await new Promise(resolve => {
                let json = '';

                res.setEncoding('utf8');
                res.on('data', chunk => json += chunk);
                res.on('end', () => resolve(JSON.parse(json)));
            });

            expect(data).toStrictEqual(object);
        });

        it('should return null if object is not created yet', async () => {
            const res = await request({...requestOptions, method: 'GET'});

            const data = await new Promise(resolve => {
                let json = '';

                res.setEncoding('utf8');
                res.on('data', chunk => json += chunk);
                res.on('end', () => resolve(JSON.parse(json)));
            });

            expect(data).toBe(null);
        });

        it('should return 200', async () => {
            const res = await request({...requestOptions, method: 'GET'});

            expect(res.statusCode).toBe(200);
        });

        it('should return Content-Type: application/json eader', async () => {
            const res = await request({...requestOptions, method: 'GET'});

            expect(res.headers['content-type']).toBe('application/json');
        });
    });

    describe('DELETE', () => {
        it('should delete saved object', async () => {
            global.OBJECT = object;

            await request({...requestOptions, method: 'DELETE'});

            expect(global.OBJECT).toBeUndefined();
        });

        it('should return 200 if object deleted', async () => {
            global.OBJECT = object;

            const res = await request({...requestOptions, method: 'DELETE'});

            expect(res.statusCode).toBe(200);
        });

        it('should return 400 if object is not created yet', async () => {
            const res = await request({...requestOptions, method: 'DELETE'});

            expect(res.statusCode).toBe(400);
        });


    });

    it('should return 405 if method not allowed', async () => {
        const res = await request({...requestOptions, method: 'OPTIONS'})
    })
});