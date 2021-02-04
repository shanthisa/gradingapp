import { PrismaClient } from '@prisma/client';
import { POINT_CONVERSION_UNCOMPRESSED } from 'constants';
import { add } from 'date-fns';
import { userInfo } from 'os';

const prisma = new PrismaClient();

async function main() {
    await prisma.testResult.deleteMany()
    await prisma.courseEnrollment.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.test.deleteMany({})
    await prisma.course.deleteMany({})

    const teacher = await prisma.user.create(
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

    const weekFromNow = add(new Date(), { days: 7 })
    const twoWeeksFromNow = add(new Date(), { weeks: 2 })
    const fourWeeksFromNow = add(new Date(), { days: 28 })
    const monthFromNow = add(new Date("1-Mar-2021"), { months: 1 })

    const course = await prisma.course.create({
        data: {
            name: "CRUD Test for Prisma",
            courseDetails: "CRUD - Create, Read, Update, Delete operations using Prisma",
            tests: {
                create: [
                    {
                        name: 'Week Test',
                        date: weekFromNow
                    },
                    {
                        name: 'Bi-Weekly Test',
                        date: twoWeeksFromNow
                    },
                    {
                        name: 'Four Week Test',
                        date: fourWeeksFromNow
                    },
                    {
                        name: 'Final Test',
                        date: monthFromNow
                    }
                ]
            },
            members: {
                create: {
                    role: 'teacher',
                    user: {
                        connect: {
                            email: 'shaleo@gmail.com'
                        }
                    }
                }
            }  
        },
        include: {
            tests: true
        }
    }
    )
console.log(`Course details: ${course}`);

const radhai = await prisma.user.create(
    {
        data: {
            firstName: "Radhai",
            lastName: "Krishna",
            email: 'radhai@gmail.com',
            courses: {
                create: {
                role: "student",
                course: {
                    connect: {
                        id: course.id
                    }
                    
                }
            }
            }
        }
    }
)
console.log("Student Radhai: ", radhai);

const shiva = await prisma.user.create(
    {
        data: {
            firstName: "Shiva",
            lastName: "Shakti",
            email: 'shivashakti@gmail.com',
            courses: {
                create: {
                    role: "student",
                    course: {
                        connect: {
                            id: course.id
                        }
                    }
                }
            }
        }
    }
)
console.log("Student Shiva: ", shiva);

const testresult = await prisma.testResult.create(
    {
        data: {
                result: 100,
                grader: {
                    connect: {
                        id: teacher.id
                    }
                },
                student: {
                    connect: {
                        id: radhai.id
                    }
                },
                test: {
                    connect: {
                        id: course.tests[0].id,
                    },
                },
        },
    },
    )
console.log(`Test result ${testresult}`)

const radhaiTestResults = [99, 98, 97, 100]
const shivaTestResults = [65, 75, 85, 90]
let counter = 0;

for (const test of course.tests) {
    const radhaiTR = await prisma.testResult.create(
        {
            data: {
                result: radhaiTestResults[counter],
                grader: {
                    connect: {
                        id: teacher.id
                    }
                },
                student: {
                    connect: {
                        id: radhai.id
                    }
                },
                test: {
                    connect: {
                        id: test.id
                    }
                }
            }
        }
    )
    const shivaTR = await prisma.testResult.create(
        {
            data: {
                result: shivaTestResults[counter],
                grader: {
                    connect: {
                        id: teacher.id
                    }
                },
                student: {
                    connect: {
                        id: shiva.id
                    }
                },
                test: {
                    connect: {
                        id: test.id
                    }
                }
            }
        }
    )
    counter++;
    console.log(`Radhai Results ${radhaiTR}`);
    console.log(`Shiva test Results ${shivaTR}`);
}


}

main()
    .catch(e => console.log(`Error message in main: ${e}`))
    .finally(async () => await prisma.$disconnect());


