const apiPlateFaked = (req, res) => {
  try {
    console.log('[apiPlateFaked] req.body:', req.body);
    const plateNumber = req.body.plateNumber;
    console.log('[apiPlateFaked] plateNumber: ' + plateNumber);

    fakeDBConnector(fakeSQLGenerator(plateNumber), plateNumber)
      .then(result => {
        console.log('[apiPlateFaked] result:', result);
        res.json(result);   //sending response to the client
      })
      .catch(err => {
        console.error(err);
        res.status(500);    //sending failure to the client
      });
  } catch (err) {
    console.error(err);
    res.status(500);        //sending failure to the client
  }
}

const fakeSQLGenerator = (plateNumber) => {
  return 'SELECT * FROM plate_table WHERE plate_number = ' + plateNumber;
};

const fakeDBConnector = (queryStatement, testData) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('[apiPlateFaked] [emulator] given query:', queryStatement);
      setTimeout(() => {
        const queryResult = ['TEST1', testData, 'TEST3']
        console.log('[apiPlateFaked] [emulator] assuming query has been successfully processed and returns: ', queryResult)
        resolve(queryResult);
      }, 1000);
    } catch (err) {
      console.error(err);
      reject();
    }
  })
};

export { apiPlateFaked };
