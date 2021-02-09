import {createServer} from '../src/server'
import {server, Server} from '@hapi/hapi'

describe('Status plugin', () => {
    let srv : Server
    beforeAll(async () => {
       srv = await createServer()
    })
    afterAll(async()=> {
        await srv.stop()
    })

    test('status endpoint returns 200', async () => {
        const res = await srv.inject({
            method: "GET",
            url: "/"
        })
        expect(res.statusCode).toEqual(200)
        const response = JSON.parse(res.payload)
        expect(response.plugin).toEqual(true)
    })

    
})

