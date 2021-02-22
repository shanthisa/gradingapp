import {PrismaClient} from '@prisma/client'
import {Plugin, Server} from '@hapi/hapi'

declare module '@hapi/hapi' {
    interface ServerApplicationState {
        prisma : PrismaClient
    }
}

const prismaPlugin : Plugin<null> = {
    name: 'prisma',
    register: async (server: Server) => {
        const prisma = new PrismaClient();
        server.app.prisma = prisma;

        server.ext({
            type: 'onPostStop',
            method: async (server: Server) => {
                server.app.prisma.$disconnect()
                console.log('Server stopped. So disconnected prisma')
            }
        })
    }
}

export default prismaPlugin;