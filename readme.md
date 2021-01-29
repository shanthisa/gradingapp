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

17. In psql use `SELECT * FROM "User";` to check whether the data is created.