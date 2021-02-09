import {Server, Plugin, Request, ResponseToolkit} from '@hapi/hapi'


const usersPlugin = {
    name: 'app/users',
    dependencies: ['prisma'],
    register: async function(server: Server) {
        server.route([
            {
                path: '/users',
                method: "POST",
                handler: createUserHandler,
            }
        ])
    }
}

export default usersPlugin

interface UserInput  {
    firstName: string
    lastName: string
    email: string
    social: {
        facebook?: string
        twitter?: string
        github?: string
        website?: string
    }
}
const createUserHandler = async (request: Request, h : ResponseToolkit) => {
    const {prisma} = request.server.app
    const payload = request.payload as UserInput

    try{
        const createdUser = await prisma.user.create({
            data: {
                firstName: payload.firstName,
                lastName: payload.lastName,
                email: payload.email,
                social: JSON.stringify(payload.social)
            },
            select: {
                id: true
            }
        })
        return h.response(createdUser).code(201)
    }
    catch{
        (error) => console.log("Error in creating user ", error)
    }
}