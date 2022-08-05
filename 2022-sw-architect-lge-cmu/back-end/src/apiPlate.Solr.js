import http from 'http'
import fs from 'fs';
const config = JSON.parse(fs.readFileSync('conf/config.json'));

const query_items = '&fl=plate,status,registration,ownerName,ownerBirth,ownerAddress,ownerCity,vehicleYear,vehicleMaker,vehicleModel,vehicleColor';

const apiPlate = async (req, res) => {
  try {
    var plateNumber = req.path.split('/')[2]
    var options = {
      hostname: '127.0.0.1',
      port: '8983',
      path: '/solr/license_plate/query?q=plate:' + plateNumber + config.confidence
             + query_items + '&rows=' + config.rows,
      method: 'GET',
      json:true
    }
    function handleResponse(response) {
      var serverData = '';
      response.on('data', function (chunk) {
        serverData += chunk;
      });
      response.on('end', function () {
        // console.log(serverData);
        const fianl_data = JSON.parse(serverData).response.docs
        res.json(fianl_data);
      });
    }
    http.request(options, function(response){
      handleResponse(response);
    }).end();
  } catch (err) {
    console.error(err);
    res.status(500);        //sending failure to the client
  } finally {

  }
}

export { apiPlate };