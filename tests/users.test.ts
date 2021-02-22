import { createServer } from '../src/server'
import { Server } from '@hapi/hapi'

describe('create user - /users - POST', () => {
    let server: Server

    beforeAll(async () => server = await createServer())
    afterAll(async () => await server.stop())

    let userId;

    test('create user', async () => {
        console.log("i am here");
        const response = await server.inject({
            method: 'POST',
            url: '/users',
            payload: {
                firstName: 'Shanthi',
                lastName: 'SA',
                email: `shanthi${Date.now()}@gmail.com`,
                social: {
                    facebook: 'shanthisa',
                    twitter: 'shavag',
                    website: 'shaleo.wordpress.com'
                }
            }
        });
        console.log("done with request");
        expect(response.statusCode).toEqual(201);
        userId = JSON.parse(response.payload)?.id
        expect(typeof userId === 'number').toBeTruthy()
    })

    test('create user validation', async () => {
        const response = await server.inject({
            method: 'POST',
            url: '/users',
            payload: {
                firstName: 'Shanthi',
                email: `shanthi${Date.now()}@gmail.com`,
                social: {
                    facebook: 'shanthisa'
                }
            }
        })
        console.log(response.payload)
        expect(response.statusCode).toEqual(400)
       
    })
})