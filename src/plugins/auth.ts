import * as Boom from '@hapi/boom';
import { Plugin, Request, ResponseToolkit, server, Server } from '@hapi/hapi';
import * as Joi from '@hapi/joi';
import { PrismaClient, TokenType, UserRole } from '@prisma/client';
import { add } from 'date-fns';
import prismaPlugin from './prisma';
import * as jwt from 'jsonwebtoken';

declare module '@hapi/hapi' {
    interface ServerApplicationState {
        prisma: PrismaClient
        sendEmailToken(email: string, token: string): Promise<void>
    }
}

export const API_AUTH_STRATEGY = 'API';

const authPlugin: Plugin<null> = {
    name: 'app/auth',
    dependencies: ['prisma', 'hapi-auth-jwt2', 'emailPlugin'],
    register: async function (server: Server) {
        //Authentication strategy
        
        server.auth.strategy(API_AUTH_STRATEGY, "jwt", {
            key: JWT_SECRET,
            verifyOptions: { algorithms: [JWT_ALGORITHM] },
            validate: validateAuthTokenFn
        })
        server.auth.default(API_AUTH_STRATEGY)

        server.route([{
            method: 'POST',
            path: '/login',
            handler: loginHandler,
            options: {
                auth: false,
                validate: {
                    payload: Joi.object({ email: Joi.string().email().required() })
                }
            }
        },
        {
            method: 'POST',
            path: '/authenticate',
            handler: authenticateHandler,
            options: {
                auth: false,
                validate: {
                    payload: Joi.object({
                        email: Joi.string().email().required(),
                        emailToken: Joi.string().required()
                    })
                }
            }
        }

        ])
        
    }
}

const EMAIL_EXPIRATION_MINUTES = 10;

interface LoginInput {
    email: string
}

async function loginHandler(request: Request, h: ResponseToolkit) {
    const { prisma, sendEmailToken } = request.server.app
    const { email } = request.payload as LoginInput
    const emailToken = generateEmailToken()
    const tokenExpiration = add(new Date(), { minutes: EMAIL_EXPIRATION_MINUTES })

    try {
        const createdToken = await prisma.token.create({
            data: {
                emailToken,
                type: TokenType.email,
                expiration: tokenExpiration,
                user: {
                    connectOrCreate: {
                        create: {
                            email
                        },
                        where: {
                            email
                        }
                    }
                }

            },
        })
        console.log(`created token: ${createdToken}`)
        await sendEmailToken(email, emailToken)
        return h.response().code(200)
    }
    catch (error) {
        Boom.badImplementation(error.message)
    }

}

function generateEmailToken(): string {
    return Math.floor(10000000 * Math.random() * 90000000).toString()
}


const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRET_LOVE'
const JWT_ALGORITHM = 'HS256'
const AUTH_TOKEN_EXPIRATION_HOURS = 12

interface AuthenticateInput {
    email: string,
    emailToken: string
}

async function authenticateHandler(request: Request, h: ResponseToolkit) {
    const { prisma } = request.server.app
    const { email, emailToken } = request.payload as AuthenticateInput
    console.log(`Logging in ${email} with ${emailToken}`);
    try {
        const fetchedEmailToken = await prisma.token.findFirst({
            where: {
                emailToken: emailToken,
            },
            include: {
                user: true
            }
        })
        if (!fetchedEmailToken?.valid) {
            return Boom.unauthorized()
        }
        if (fetchedEmailToken.expiration < new Date()) {
            return Boom.unauthorized('Token expired')
        }
        if (fetchedEmailToken?.user?.email === email) {
            const authTokenCreated = await prisma.token.create({
                data: {
                    type: TokenType.API,
                    expiration: add(new Date(), { hours: AUTH_TOKEN_EXPIRATION_HOURS }),
                    user: {
                        connect: {
                            email
                        }
                    }
                },
            })
            const authToken = generateAuthToken(authTokenCreated.id)

            //Invalidate the email Token
            await prisma.token.update({
                where: {
                    id: fetchedEmailToken.id
                },
                data: {
                    valid: false
                },
            })
            return h.response().code(200).header('Authorization', authToken)
        }

    }
    catch (error) {
        Boom.badImplementation(error.message)
    }

}

function generateAuthToken(id: number): string {
    //Instead of id set it as tokenId: id
    const jwtPayload = { tokenId: id }
    return jwt.sign(jwtPayload, JWT_SECRET, {
        algorithm: JWT_ALGORITHM,
        noTimestamp: true
    })
}

//Authentication strategy 
interface APITokenPayload {
    tokenId: number
}
//the id should be tokenId to be validated 
const apiTokenSchema = Joi.object({ tokenId: Joi.number().required() })

async function validateAuthTokenFn (decoded: APITokenPayload, request: Request, h: ResponseToolkit) {
    const { prisma } = request.server.app
    const { tokenId } = decoded

    const { error } = apiTokenSchema.validate(decoded)
    if (error) {
        request.log(['error', 'auth'], `API Token error ${error.message}`)
        return { isValid: false }
    }

    try {
        const fetchedAuthToken = await prisma.token.findUnique({
            where: {
                id: tokenId
            },
            include: {
                user: true
            }
        })

        if(!fetchedAuthToken || !fetchedAuthToken?.valid) {
            request.log(['error', 'auth'], 'Token does not exist or invalid')
            return {isValid: false}
        }

        if(fetchedAuthToken.expiration < new Date()) {
            request.log(['err', 'auth'], 'Token has expired')
            return {isValid: false}
        }

        const teacherOf = await prisma.courseEnrollment.findMany({
            where: {
                userId: fetchedAuthToken.userId,
                role: UserRole.teacher
            },
            select: {
                courseId: true
            }
        })

        return {
            isValid: true,
            credentials: {
                tokenId: decoded.tokenId,
                userId: fetchedAuthToken.userId,
                //isAdmin does not exist in user model
                //isAdmin: fetchedAuthToken.user.isAdmin
                teacherOf: teacherOf.map(({courseId})=> courseId)
            }
        }
    }
    catch (error) {
        request.log(['error', 'auth', 'db'], error)
        return {isValid: false}
    }
}



export default authPlugin



//curl -v --header "Content-Type: application/json" --request POST --data '{"email":"test@test.io", "emailToken": "264791859169564"}' localhost:3000/authenticate

// Authorization:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mn0.VoGvQz9Z0NALnw8HMbi-yXXK-7HqJ4Bnw995kfCxD4I