const mongodb = require('mongodb').MongoClient;
const uri = 'mongodb://guest:guest@ds127878.mlab.com:27878/ads-data';

export class DB {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }
  find(filter) {
    var connection = null;
    return mongodb.connect(uri)
    .then(db => {
      connection = db;
      return db.collection(this.collectionName);
    })
    .then(collection => collection.find(filter).toArray())
    .then(null, error => {
      console.error(error);
    })
    .then(array => {
      connection.close();
      console.log(`Found ${array.length} ${this.collectionName}`);
      return array;
    });
  }
  update(filter, data) {
    var connection = null;
    return mongodb.connect(uri)
    .then(db => {
      connection = db;
      return db.collection(this.collectionName);
    })
    .then(collection => collection.updateOne(filter, {$set: data}))
    .then(null, error => {
      console.error(error);
    })
    .then(result => {
      connection.close();
      console.log(`Updated ${result.modifiedCount} ${this.collectionName}`);
      return result;
    });
  }
  insert(data) {
    var connection = null;
    return mongodb.connect(uri)
    .then(db => {
      connection = db;
      return db.collection(this.collectionName);
    })
    .then(collection => collection.insertOne(data))
    .then(null, error => {
      console.error(error);
    })
    .then(result => {
      connection.close();
      console.log(`Inserted ${result.insertedCount} ${this.collectionName}`);
      return result;
    });
  }
}
