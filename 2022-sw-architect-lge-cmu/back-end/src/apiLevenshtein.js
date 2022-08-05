import levenshtein from 'fast-levenshtein';

var distance;
const apiLevenshtein = (req, res) => {
    try {
        //let arr = new Array();
        var arr = new Array();
        console.log('[apiLevenshtein] req.body:', req.body);
        for (let i=1; i<=25000000; i++) {
          arr[i] = levenshtein.get('ABC1234', 'ABC1234');
        }
        distance = levenshtein.get('ABC1234', 'ABC1234');
        console.log('[apiLevenshtein] result:', distance);
        res.json(distance);
      //const plateNumber = req.body.plateNumber;
      //console.log('[apiLevenshtein] plateNumber: ' + plateNumber);
  
      //fakeDBConnector(fakeSQLGenerator(plateNumber), plateNumber)
    //   var distance = levenshtein.get('back', 'book');
    //     .then(result => {
    //       console.log('[apiLevenshtein] result:', distance);
    //       res.json(result);   //sending response to the client
    //     })
    //     .catch(err => {
    //       console.error(err);
    //       res.status(500);    //sending failure to the client
    //     });
     } catch (err) {
       console.error(err);
       res.status(500);        //sending failure to the client
     }
  }


  export { apiLevenshtein };