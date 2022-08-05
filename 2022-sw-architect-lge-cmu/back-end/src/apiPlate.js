import mongoose from 'mongoose';
import levenshtein from 'fast-levenshtein';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync('conf/config.json'));

const FIND_TIME_OUT = 1000;

const platenumberSchema = new mongoose.Schema({
  plate: {
    required: true,
    type: String,
  },
  status: {
    required: true,
    type: String,
  },
  registration: {
    required: true,
    type: String,
  },
  ownerName:  {
    required: true,
    type: String,
  },
  ownerBirth:  {
    required: true,
    type: String,
  },
  ownerAddress:  {
    required: true,
    type: String,
  },
  ownerCity:  {
    required: true,
    type: String,
  },
  vehicleYear:  {
    required: true,
    type: Number,
  },  
  vehicleMaker:  {
    required: true,
    type: String,
  },
  vehicleModel:  {
    required: true,
    type: String,
  },
  vehicleColor:  {
    required: true,
    type: String,
  }
});

//const prisma = new PrismaClient();
mongoose.connect('mongodb://10.58.2.34:27017/lgeswa2022');
var db = mongoose.connection;
// 4. 연결 실패
db.on('error', function(){
  console.log('Connection Failed!');
});
// 5. 연결 성공
db.once('open', function() {
  console.log('MongoDB for RestApi is connected');
});
const collections = mongoose.model('platenumber', platenumberSchema);
const dist_levenshtein = config.max_dist_levenshtein;
const max_num_of_partial_match = config.max_num_of_partial_match;

const apiPlate = async (req, res, logfn) => {
  var result;
  try {
    const plateNumber = req.params.platenumber;

    let start = new Date();
    // exact match
    var result = await collections.find(
      {
        plate: plateNumber  
      }
    );
    //let end = new Date();
    //console.log(`${end - start}ms`)

    if (result.length)
    {
      res.json(result);
      console.log(new Date().toISOString() + req.user.id+' exact match')
      logfn(req.user.id, req.params.platenumber, start, new Date().getTime(), 'exact');
    }
    else //if no exact match
    {
      var partial_result = [];
      let word;
      var result;

      //console.log(plateNumber.length)

      word = plateNumber.substr(0, 3);

      if (/^[a-zA-Z]+$/.test(word)) //앞에 3자리가 문자이면 partial match수행
      {
        const query = new RegExp('^'+ word);
        try {
          result = await collections.find(
            {
              plate: query
            }
            ).maxTime(FIND_TIME_OUT);
          } catch (err) {
            res.json(result);
            console.log(req.user.id+' Search Timeout');
            logfn( req.user.id, req.params.platenumber, start, new Date().getTime(), 'no');
          }
      }
      else
      {
        result = []
      }

      if (result.length)
      {
        for (var i=0;i<result.length;i++)
        {
          if (levenshtein.get(plateNumber, result[i].plate) <= dist_levenshtein)
          {
            partial_result.push(result[i]);
          }
        }
        if (partial_result.length == 0)
        {
          res.json(partial_result);
          console.log(req.user.id+' no match');
          logfn( req.user.id, req.params.platenumber, start, new Date().getTime(), 'no');
        }
        else if (partial_result.length > max_num_of_partial_match)
        {
          res.json(partial_result.slice(0,max_num_of_partial_match));
          console.log(req.user.id+' partial match '+partial_result.length);
          logfn( req.user.id, req.params.platenumber, start, new Date().getTime(), 'partial');
        }
        else
        {
          res.json(partial_result);
        }
        console.log(req.user.id+' partial match '+partial_result.length);
        logfn( req.user.id, req.params.platenumber, start, new Date().getTime(), 'partial');
      }
      else
      {
        res.json(result);
        console.log(req.user.id+' no match');
        logfn( req.user.id, req.params.platenumber, start, new Date().getTime(), 'no');
      }
    }
    //console.log(result);
    //res.json(JSON.stringify(result));
  } catch (err) {
    console.error(err);
    res.status(500);        //sending failure to the client
  } finally {
  }
}

const apiPlatePartial = async (req, res) => {

  try {
    console.log('[apiPlatePartial] req.body:', req.body);
    const plateNumber = req.body.plateNumber;
    console.log('[apiPlatePartial] plateNumber: ' + plateNumber);

    /*
    // CASE1 : 1000개당 약 2.5초 소요 (사용불가)
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


    /*
     //CASE2 : 3000개당 약 850ms 소요 (사용불가)

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