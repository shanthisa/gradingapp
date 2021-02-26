import {ResponseToolkit, Server, server} from '@hapi/hapi';
import status from './plugins/status';
import prisma from './plugins/prisma';
import usersPlugin from './plugins/users';
import emailPlugin from './plugins/email';
import * as hapiAuthJWT from 'hapi-auth-jwt2';
import authPlugin from './plugins/auth';


const serverObj : Server = server({
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3000,
}
)

export async function createServer(): Promise<Server>{
    await serverObj.register([status, prisma, usersPlugin, emailPlugin, hapiAuthJWT, authPlugin])
    await serverObj.initialize()
    return serverObj;
}

export async function startServer(srvr: Server): Promise<Server>{
    await srvr.start();
    console.log("Server running on: ", srvr.info.uri);
    return srvr;
}
// export async function start(): Promise<Server>{
// // serverObj.route({   
// //     method: 'GET',
// //     path: '/',
// //     handler: ((_req,h : ResponseToolkit)=> {return h.response({up: true}).code(200)})
// // })

// await serverObj.register([status])

//     await serverObj.start();
//     console.log("Server running on:", serverObj.info.uri)
//     return serverObj;
// }

process.on('unhandledRejection', err => {
    console.log("error ",err)
    process.exit(0);
})

// start()
// .then(() => console.log("Server is running at: ", serverObj.info.uri))
// .catch((e) => console.log('error while starting server: ', e))