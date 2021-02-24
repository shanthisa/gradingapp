import { badImplementation, Boom } from '@hapi/boom'
import { Server, Plugin, Request, ResponseToolkit, ServerRoute } from '@hapi/hapi'
import * as Joi from '@hapi/joi'
import { PrismaClient } from '@prisma/client'
import { userInfo } from 'os'

declare module '@hapi/hapi' {
    interface ServerApplicationState {
        prisma: PrismaClient
    }
}

// const userInputValidator = Joi.object(
//     {
//         firstName: Joi.string().required(),
//         lastName: Joi.string().required(),
//         email: Joi.string().email().required(),
//         social: Joi.object(
//             {
//                 facebook: Joi.string().optional(),
//                 twitter: Joi.string().optional(),
//                 github: Joi.string().optional(),
//                 website: Joi.string().optional(),
//             }
//         ).optional()
//     }
// )

const userInputValidator = Joi.object(
    {
        firstName: Joi.string().alter({
            create: schema => schema.required(),
            update: schema => schema.optional(),
        }),
        lastName: Joi.string().alter({
            create: schema => schema.required(),
            update: schema => schema.optional()
        }),
        email: Joi.string().email().alter({
            create: schema => schema.required(),
            update: schema => schema.optional()
        }),
        social: Joi.object({
            facebook: Joi.string().optional(),
            twitter: Joi.string().optional(),
            github: Joi.string().optional(),
            website: Joi.string().optional()
        }).optional()
    }
)

const createUserValidator = userInputValidator.tailor('create')
const updateUserValidator = userInputValidator.tailor('update')

const usersPlugin = {
    name: 'app/users',
    dependencies: ['prisma'],
    register: async function (server: Server) {
        server.route([{
            method: 'POST',
            path: '/users',
            handler: createUserHandler,
            options: {
                validate: {
                    payload: createUserValidator
                }
            },
        },
        {
            method: 'GET',
            path: `/users/{userId}`,
            handler: getUserHandler,
            options: {
                validate: {
                    params: Joi.object({
                        userId: Joi.number().integer()
                    })
                }
            }
        },
        {
            method: 'DELETE',
            path: `/users/{userId}`,
            handler: deleteUserHandler,
            options: {
                validate: {
                    params: Joi.object({
                        userId: Joi.number().integer()
                    }
                    )
                }
            }
        },
        {
            method: 'PUT',
            path: `/users/{userId}`,
            handler: updateUserHandler,
            options: {
                validate: {
                    payload: updateUserValidator
                }
            }
        }
        ])
    },
}

export default usersPlugin

interface UserInput {
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

let createUserHandler = async (request: Request, h: ResponseToolkit) => {
    const { prisma } = request.server.app
    const payload = request.payload as UserInput
    try {
        const createdUser = await prisma.user.create({
            data: {
                firstName: payload.firstName,
                lastName: payload.lastName,
                email: payload.email,
                social: JSON.stringify(payload.social),
            },
            select: {
                id: true,
            },
        })
        console.log("Created user: ", createdUser)
        return h.response(createdUser).code(201)
    }
    catch {
        (error) => console.log("Error in creating user ", error)
    }
}

let getUserHandler = async (request: Request, h: ResponseToolkit) => {
    const { prisma } = request.server.app
    const userId = parseInt(request.params.userId)
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (user) return h.response(user).code(200)
        else return h.response().code(404)
    }
    catch {
        (err) => {
            console.log(err)
            return badImplementation()
        }
    }
}

let deleteUserHandler = async (request: Request, h: ResponseToolkit) => {
    const { prisma } = request.server.app
    const userId = parseInt(request.params.userId, 10)
    try {
        await prisma.user.delete({
            where: {
                id: userId
            }
        })
        return h.response().code(204)
    }
    catch (err) {

        console.log('Error while deleting user ', err)
        //return h.response().code(500)
        return badImplementation('failed to delete user')
    }
}

let updateUserHandler = async (request: Request, h: ResponseToolkit) => {
    const { prisma } = request.server.app
    const userId = parseInt(request.params.userId)

    try {
        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: request.payload
        })
        return h.response(updatedUser).code(200)
    }
    catch (err) {
        console.log('error in updating user ', err)
        return h.response().code(500)
    }
}