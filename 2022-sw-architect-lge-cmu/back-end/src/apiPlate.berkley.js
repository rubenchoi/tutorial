//import { PrismaClient } from '@prisma/client';
import bdb from 'berkeleydb';
import levenshtein from 'fast-levenshtein';

var result;
var db = new bdb.Db(); // create a new Db object
dbenv.open("licenseplate_.db");

//const prisma = new PrismaClient();

const apiPlate = async (req, res) => {
  try {
    console.log('[apiPlate] req.body:', req.body);
    const plateNumber = req.body.plateNumber;
    console.log('[apiPlate] plateNumber: ' + plateNumber);

    
    // exact match
    var result =db.get(plateNumber); // get

    if (result.length == 0) //if no match
    {
      //TODO: partial match
    }

    console.log(result);
    res.json(JSON.stringify(result));
  } catch (err) {
    console.error(err);
    res.status(500);        //sending failure to the client
  } finally {
    //await prisma.$disconnect();
  }
}

const apiPlatePartial = async (req, res) => {

  try {
    console.log('[apiPlatePartial] req.body:', req.body);
    const plateNumber = req.body.plateNumber;
    console.log('[apiPlatePartial] plateNumber: ' + plateNumber);

    /* CASE1 : 1000개당 약 2.5초 소요 (사용불가)
    let start, end;
    let distance;
    start = new Date();
    for (var i =1 ;i <= 25000000 ; i++) {
      result = await prisma.plateNumber.findUnique({
        where: 
        {
          id: i,
        },
      })

      distance = levenshtein.get(plateNumber, result.plate);
      if (distance < 2)
        console.log(distance);
      //console.log(result.plate);
      //console.log(i);
      if (i%1000==0)
      {
        end = new Date();
        console.log(i, end - start);
        start = new Date();
      }
    }
    */


    /* //CASE4 : 3000개당 약 850ms 소요 (사용불가) 
    const result = await prisma.$queryRaw
    `SELECT * FROM platenumber WHERE levenshtein(plate, ${plateNumber})
    BETWEEN 1 AND 2;`
    */

    /* LIKE 사용 (수십ms 소요되지만 confidence threshold 값을 넣을 수 없어서 사용불가)
    const result = await prisma.$queryRaw
    `SELECT * FROM platenumber WHERE plate LIKE "LKY136%"`; //수십ms 소요
    */
   

    /* contains 사용 50여초 소요 (사용불가)
    const result = await prisma.plateNumber.findMany({

          where: {
            //plate: plateNumber,
            plate: 
            {
              contains: "LKY136"  //50여초 소요
            }
          }
      
    });
    */

    console.log(result);
    res.json(JSON.stringify(result));
  } catch (err) {
    console.error(err);
    res.status(500);        //sending failure to the client
  } finally {
    await prisma.$disconnect();
  }
}

export { apiPlate };
export { apiPlatePartial };