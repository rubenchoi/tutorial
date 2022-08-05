import mongoose from 'mongoose';

var result;

const usersSchema = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
  passwd: {
    required: true,
    type: String,
  }
});

mongoose.connect('mongodb://10.58.2.34:27017/lgeswa2022');
var db = mongoose.connection;
// 4. 연결 실패
db.on('error', function(){
  console.log('Connection Failed!');
});
// 5. 연결 성공
db.once('open', function() {
  console.log('MongoDB for Auth is connected');
});
const userFind = mongoose.model('users', usersSchema);


export { userFind };