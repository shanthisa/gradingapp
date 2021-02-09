import {startServer, createServer} from './server'

createServer()
.then(startServer)
.catch(err=>{console.log("Error:start",err)})

