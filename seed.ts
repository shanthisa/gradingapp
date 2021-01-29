import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

    await prisma.user.create(
        {
            data: {
                email: 'shaleo@gmail.com',
                firstName: 'Shanthi',
                lastName: 'SA',
                social: {
                    facebook: 'shanthisa',
                    twitter: 'shavag',
                }
        }
        }
    )
}

main()
.catch(e=> console.log('Error in main:',e))
.finally( async () => await prisma.$disconnect())