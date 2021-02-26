import {Server} from '@hapi/hapi';
import * as sendgrid from '@sendgrid/mail';

declare module '@hapi/hapi' {
    interface ServerApplicationState {
        sendEmailToken(email: string, token: string) : Promise <void>
    }
}

async function sendEmailTokenFn (email: string, token: string ) {
    const msg = {
        to: email,
        from: 'email_configured_in_sendgrid@email.com',
        subject: 'Login token for the modern backend API',
        text: `The login token is ${token}`
    }
    await sendgrid.send(msg)
}

async function debugSendEmailToken (email: string, token: string) {
    console.log(`Token for the email ${email} is ${token}`)
}

const emailPlugin = {
    name: 'emailPlugin',
    register: async function (server: Server) {
        if(process.env.SENDGRID_API_KEY) {
            sendgrid.setApiKey(process.env.SENDGRID_API_KEY)
            server.app.sendEmailToken = sendEmailTokenFn
        }
        else {
            console.log('process.env.SENDGRID_API_KEY should be set for sendgrid to send emails. So logging the email and token in debug mode')
            server.app.sendEmailToken = debugSendEmailToken
        }
        
    }

}
export default emailPlugin