const mongodb = require('mongodb').MongoClient;
const uri = 'mongodb://guest:guest@ds127878.mlab.com:27878/ads-data';
const collectionName = 'override';

function find() {
  var connection = null;
  return mongodb.connect(uri)
  .then(db => {
    connection = db;
    return db.collection(collectionName);
  })
  .then(collection => collection.find().toArray())
  .then(null, error => {
    console.error(error);
  })
  .then(array => {
    connection.close();
    console.log(`Found ${array.length} overrides`);
    return array;
  });
}

function update(override) {
  var connection = null;
  return mongodb.connect(uri)
  .then(db => {
    connection = db;
    return db.collection(collectionName);
  })
  .then(collection => collection.updateOne({_id: override._id}, {$set: override}))
  .then(null, error => {
    console.error(error);
  })
  .then(result => {
    connection.close();
    console.log(`Updated ${result.modifiedCount} Overrides`);
    return result;
  });
}

module.exports.find = find;
module.exports.update = update;
