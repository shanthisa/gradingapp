import {Server, server as serverFactory} from '@hapi/hapi';

const serverObj: Server = serverFactory({
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
})
serverObj.route({
    method: 'GET',
    path: '/yay',
    handler: (_request, _h) => {
        return "Yay. i work"
    }
});
serverObj.route({
    method: 'GET',
    path: '/err',
    handler: (_request, _h) => {
        throw "oops"
    }
});
export async function start() : Promise<Server> {
    try {
        await serverObj.start()
        return serverObj;
    } catch(err) {
        console.log("I caught the server error", err);
        throw err;
    }
}
// export function startPlain(): Promise<Server> {
//     return new Promise((res, rej) => {
//         serverObj.start().then(() => res(serverObj))
//     });
// }
console.log('Process argv: ', process.argv);
console.log('Process path: ', process.env.PATH);

process.on('unhandledRejection', err => {
    console.log("This is the unhandled case");
    console.log(err);
    process.exit(1);
})

start()
.then (server => {console.log("Server is running on ", server.info.uri)})
.catch (e => {console.log("Error on server running: ",e)})