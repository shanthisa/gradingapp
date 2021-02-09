import { Plugin } from "@hapi/hapi";
import {Server, ResponseToolkit} from '@hapi/hapi'

const plugin: Plugin<undefined> = {
    name: 'app/status',
    register: async function(server: Server){
      server.route({
        method: 'GET',
        path: '/',
        handler: (_,h : ResponseToolkit) => {
            return h.response({plugin: true}).code(200)
        }
      })  
    }
}
export default plugin;