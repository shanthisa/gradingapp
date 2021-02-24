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
        console.log("UserID is: ", userId)
        expect(typeof userId === 'number').toBeTruthy()
    })

    test('get created user id', async() => {
        const response = await server.inject({
            method: 'GET',
            url: `/users/${userId}`,
        })
        console.log(`url is /users/${userId}`)
        expect(response.statusCode).toEqual(200)
        const user = JSON.parse(response.payload)
        expect(user.id).toBe(userId)
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
        expect(response.statusCode).toEqual(400)
       
    })

    test('get non existant user returns 404', async () => {
        const response = await server.inject({
            method: 'GET',
            url: '/users/9999',
        })
        expect(response.statusCode).toEqual(404)
    })

    test('update user with invalid user parameter', async () => {
        const response = await server.inject({
            method: 'PUT',
            url: '/users/12345'
        })
        expect(response.statusCode).toEqual(400)
    })

    test('update user that was created', async() => {
        const updatedFirstName = 'shanthi_updated'
        const updatedLastName = 'sa_updated'
        const response = await server.inject({
            method: 'PUT',
            url: `/users/${userId}`,
            payload: {
                firstName: updatedFirstName,
                lastName: updatedLastName
            }
        })

        expect(response.statusCode).toEqual(200)
        const user = JSON.parse(response.payload)
        expect(user.firstName).toEqual(updatedFirstName)
        expect(user.lastName).toEqual(updatedLastName)

    })

    test('delete invalid user', async() => {
        const response = await server.inject({
            method: 'DELETE',
            url: `/users/1234`
        })
        expect (response.statusCode).toEqual(500)
    })

    test ('delete created user', async () => {
        const response = await server.inject({
            method: 'DELETE',
            url: `/users/${userId}`
        })
        expect(response.statusCode).toEqual(204)
    })
})