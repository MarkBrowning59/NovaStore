require('dotenv').config();
const { MongoClient } = require('mongodb');


let _novaMongoDBepository;

const init_NovaMongoDBRepository = async () => {
    if (_novaMongoDBepository) return _novaMongoDBepository;
  
    const client = await MongoClient.connect(process.env.MONGO_URI);
    _novaMongoDBepository = client.db(); // ✅ store Db instance
    return _novaMongoDBepository;
  };
  

const getMongoRepository = () => {
    if (!_novaMongoDBepository) {
        throw Error('Database not initialized');
    }

    return _novaMongoDBepository;
};

module.exports = {
    init_NovaMongoDBRepository ,
    getMongoRepository 
};
