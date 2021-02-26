Creating a new grading system app using Prisma
Reference
https://www.prisma.io/blog/backend-prisma-typescript-orm-with-postgresql-data-modeling-tsjs1ps7kip1

1. Created a new folder gradingsystem
2. Created a readme.md file
3. Created a git project using the following steps
```
> git init
> git add
> git commit -m "First commit"
> git branch -M main
> git remote add origin git@github.com:shanthisa/gradingapp.git
> git push -u origin main
```

To stop a local postgres server

```
> brew services stop postgresql
```
4. Create docker-compose yml file
run the command 
```
docker-compose up -d
```
5. Check whether the psql server is running
```
psql -d postgres -U prisma -h localhost -p 5432
```

6. To include prisma, first create a package.json file by using:
```
npm init -y
```
Then initialize TypeScript and add Prisma client as a development dependency (--save-dev for dev dep)
```
npm install @prisma/cli typescript ts-node @types/node --save-dev
```

7. Create ts-config.json with 
```
{
  "compilerOptions": {
    "sourceMap": true,
    "outDir": "dist",
    "strict": true,
    "lib": ["esnext"],
    "esModuleInterop": true
  }
}
```
8. To create prisma schema file and .env, run
```
npx prisma init
```
9. change the DATABASE_URL in .env to include localhost and port 5432 with username prisma and password prisma

10. check psql connection with the following command:
```
psql -h localhost -U prisma
```
11. Add the models in schema.prisma file under prisma folder
12. Create database from prisma schema using
```
npx prisma migrate dev --preview-feature --skip-generate --name="init" 
```
13. Install the prisma client 
```
npm install --save @prisma/client
```
You will see @prisma under node_modules folder

14. Next generate the prisma client to use import {PrismaClient}
```
npx prisma generate
```
15. Next create seed.ts to insert test data to the database. Import PrismaClient. Create a new PrismaClient object. In async await function main(), use the object to create data for table
i.e. prisma.user.create() where user is table name.

16. use `npx ts-node seed.ts` to run the node ts file.

17. To run psql 
```
docker-compose up -d
psql -U prisma -h localhost
Enter password as prisma
```

18. In psql 
connect to database as `\c mydb` 
use `SELECT * FROM "User";` to check whether the data is created.

19. Create a course and related test using create: 
20. In the tests use add function (npm i date-fns) to create day intervals of tests.
21. Create a relation between the user created and to this course as teacher using connect: 
22. Create multiple users and connecting them to a course
23. Creating test results for these student users using for(const test of course.tests){}
24. Check results in 
```npx prisma studio```
25. Aggregate test results of avg, min, max for a particular test
26. Aggregate test results of avg, min, max for a particular student
27. Create a Hapi Server and checked status 200.
28. Created a plugin to modulate the different routes. 
29. Next to test whether the plugin works, using Jest. So Install 
```npm i -D jest ts-jest @types/jest```
30. Configure jest 
```npx ts-jest config:init```
This creates jest.config.js file
31. Write the test in status.test.ts
32. Create a plugin users and create a route for creating user
33. To run the test 
  ```npx jest```
34. Authentication is the process of verifying who a user is, while authorization is the process of verifying what they have access to.

Authentication and Authorization - Part 3
1. Create a token model which is 1-n with user, modify the first Name and lastName in user model to optional in prisma.schema
2. migrate the schema with 
```
npx prisma migrate dev --preview-feature --name "add-token"
```
(make sure the postgres server is running while running migration)

3. Install sendgrid email for email sending functionality
npm install --save @sendgrid/mail
4. Create the email plugin
5. Install the following dependencies:  
npm install --save hapi-auth-jwt2@10.1.0 jsonwebtoken@8.5.1
npm install --save-dev @types/jsonwebtoken@8.5.0
