
### LGE Software Architect 2002 Studio Project Team 4 Server

## Create DB (only once at the very beginning)
1. Install MariaDB(10.6.x) - Root ID/PW for root:root. Update DATABASE_URL for prisma in .env if you change root:root.
2. Launch MariaDB MySQL Client and create database:
    create database lgeswa2022
3. Create tables using prisma commands:
    npx prisma migrate dev --name create_categories 
4. Verify:
    npx prisma studio


## TODO Seed; 25 million DB
1. Seed DB
    Faker:gen.py ==> datafile.txt ==> prisma seed.js ==> DB
    * See /prisma/seed.js example. There are addional things to do when parsing datafile.txt.
    * See https://www.prisma.io/docs/guides/database/seed-database for further detail.

## References

* [prisma basic](https://velog.io/@iamhayoung/prisma-schema)
* [prisma examples](https://medium.com/prisma-korea/%EC%8B%A4%EC%9A%A9%EC%A0%81%EC%9D%B8-prisma-%EC%98%88%EC%A0%9C-5ad2bd13768f)