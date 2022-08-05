import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()

async function main() {
    let r = await prisma.plateNumber.create({
        data: {
            plate: 'LKY1360',
            status: 'Owner Wanted',
            registration: '2023-08-22T19:20:30.451Z',
            ownerName: 'Jennifer Green',
            ownerBirth: '2001-08-01T19:20:30.451Z',
            ownerAddress: '5938 Juan Throughway Apt. 948',
            ownerCity: 'West Corey, TX 43780',
            vehicleYear: 2006,
            vehicleMaker: 'Audi',
            vehicleModel: 'Rogue',
            vehicleColor: 'lime'
        }
    });
    console.log(r);
    r = await prisma.plateNumber.create({
        data: {
            plate: 'HHF6697',
            status: 'Unpaid Fines - Tow',
            registration: '2022-06-06T19:20:30.451Z',
            ownerName: 'Eugene Bowman',
            ownerBirth: '1959-10-30T19:20:30.451Z',
            ownerAddress: 'Unit 7784 Box 0801',
            ownerCity: 'DPO AP 52775',
            vehicleYear: 2020,
            vehicleMaker: 'BMW',
            vehicleModel: 'Savana 3500 Cargo',
            vehicleColor: 'yellow'
        }
    });
    console.log(r);
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })