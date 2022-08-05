import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import readline from 'readline';
import dayjs from 'dayjs';

const prisma = new PrismaClient()
const SKIP_DATA_NUM = 0;
const CREATE_MANY_NUM = 200000;

async function main() {
    //var array = fs.readFileSync('D:/SW_Architect/disk1.gsd', 'utf-8').toString().split(["$"]);
    //var array = fs.readFileSync('prisma/datafile.txt', 'utf-8').toString().split(["$"]);
    var car_info;
    var cnt, cnt_10000, i, plate, plate_next, status_, registration, ownerName, ownerBirth, ownerAddress, ownerCity;
    var vehicleYear, vehicleMaker, vehicleModel, vehicleColor;
    var array;

    var timestamp;
    let today = dayjs();
    console.log(today.format());

    const toTimestamp = (strDate) => {  
        const dt = Date.parse(strDate);  
        return dt;  
      }  

      const toISOString = (strDate) => {  
        var s = new Date(strDate).toISOString();  
        return s;
      }    

    const fileStream = fs.createReadStream('D:/SW_Architect/datafile.txt');
    //const fileStream = fs.createReadStream('prisma/datafile.txt');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });
      
      
      i = 0;
      cnt = 0;
      cnt_10000 = 0;

      let arr = []
      for await (const line of rl) {

        // Each line in input.txt will be successively available here as `line`.
        //console.log(line);
        switch(i) {
            case 0: plate = line; i++; break;
            case 1: status_ = line; i++; break;
            case 2: registration = line; i++; break;
            case 3: ownerName = line; i++; break;
            case 4: ownerBirth = line; i++; break;
            case 5: ownerAddress = line; i++; break;
            case 6: ownerCity = line; i++; break;
            case 7: vehicleYear = line; i++; break;
            case 8: vehicleMaker = line; i++; break;
            case 9: vehicleModel = line; i++; break;
            case 10: 

            if (line.indexOf("$") != -1) {  //$가 포함되어 있으면 split해서 $앞부분이 vehicleColor이고 뒷부분이 plate임
                array = line.split("$");
                vehicleColor = array[0];
                i = 1;
                cnt++;
                if (cnt > SKIP_DATA_NUM) {
                    arr.push({
                            plate: plate,
                            status: status_,
                            registration: toISOString(registration),
                            ownerName: ownerName,
                            ownerBirth: toISOString(ownerBirth),
                            ownerAddress: ownerAddress,
                            ownerCity: ownerCity,
                            vehicleYear: Number(vehicleYear),
                            vehicleMaker: vehicleMaker,
                            vehicleModel: vehicleModel,
                            vehicleColor: vehicleColor
                        });
                }

                
                if(arr.length == CREATE_MANY_NUM){
                    console.log('prisma.plateNumber.createMany: '+ cnt);
                    let r = await prisma.plateNumber.createMany({
                        data: arr});
                    arr = [];
                }
                
                plate = array[1];
                
            }
            else { //마지막 라인
                //console.log(cnt++);
                cnt++;
                vehicleColor = line; 
                i = 0;

                if (cnt > SKIP_DATA_NUM) {
                    arr.push({
                        plate: plate,
                        status: status_,
                        registration: toISOString(registration),
                        ownerName: ownerName,
                        ownerBirth: toISOString(ownerBirth),
                        ownerAddress: ownerAddress,
                        ownerCity: ownerCity,
                        vehicleYear: Number(vehicleYear),
                        vehicleMaker: vehicleMaker,
                        vehicleModel: vehicleModel,
                        vehicleColor: vehicleColor
                    });
                }

                if(arr.length == CREATE_MANY_NUM){
                    console.log('prisma.plateNumber.createMany: '+ cnt);
                    let r = await prisma.plateNumber.createMany({
                        data: arr});
                    arr = [];
                }
                //}
                /*
                let r = await prisma.plateNumber.create({
                    data: {
                        plate: plate,
                        status: status_,
                        registration: toISOString(registration),
                        ownerName: ownerName,
                        ownerBirth: toISOString(ownerBirth),
                        ownerAddress: ownerAddress,
                        ownerCity: ownerCity,
                        vehicleYear: Number(vehicleYear),
                        vehicleMaker: vehicleMaker,
                        vehicleModel: vehicleModel,
                        vehicleColor: vehicleColor
                    }
                });
                */
                
            }

            break;
        }
      }

      if(arr.length > 1){
        console.log('prisma.plateNumber.createMany remain');
        let r = await prisma.plateNumber.createMany({
            data: arr});
        arr = [];
    }
      
      console.log('prisma.plateNumber.createMany end');
    /*
    

    console.log(array.length);
    //for(i in array) {
    //for(i=0; i<array.length-1; i++) {
    for(i=0; i<100; i++) {
        console.log(i);
        //console.log(array[i]);
        car_info = array[i].split("\n");
        
        console.log(car_info[2])
        timestamp = toTimestamp(car_info[2])
        console.log(timestamp)
        console.log(Date(car_info[2]))
        console.log(Date(timestamp))
        

        let r = await prisma.plateNumber.create({
            data: {
                plate: car_info[0],
                status: car_info[1],
                registration: Number(toTimestamp(car_info[2])),
                ownerName: car_info[3],
                ownerBirth: 1234,
                ownerAddress: car_info[5],
                ownerCity: car_info[6],
                vehicleYear: Number(car_info[7]),
                vehicleMaker: car_info[8],
                vehicleModel: car_info[9],
                vehicleColor: car_info[10]
            }
        });
        
    }
    */
    

    /*
    fs.readFile('prisma/datafile.txt', 'utf8' , (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        console.log(data)
    })
    */

    /*
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
    */
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })