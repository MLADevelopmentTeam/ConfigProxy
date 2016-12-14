const mongodb = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
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
  save(data) {
    var connection = null;
    return mongodb.connect(uri)
    .then(db => {
      connection = db;
      return db.collection(this.collectionName);
    })
    .then(collection => {
      var promise = null;
      if(data._id) {
        data._id = new ObjectId(data._id);
        promise = collection.updateOne({_id: data._id}, {$set: data}, {w: 1});
      } else {
        promise = collection.insertOne(data, {w: 1});
      }
      return promise;
    })
    .then(null, error => {
      console.error(error);
    })
    .then(result => {
      connection.close();
      console.log(`Updated: ${result.modifiedCount || 0}, Inserted: ${result.insertedCount || 0} - ${this.collectionName}`);
      return result;
    });
  }
  update(filter, data) {
    var connection = null;
    var updateOptions = {multi: true, w: 1};
    return mongodb.connect(uri)
    .then(db => {
      connection = db;
      return db.collection(this.collectionName);
    })
    .then(collection => collection.updateMany(filter, {$set: data}, updateOptions))
    .then(null, error => {
      console.error(error);
    })
    .then(result => {
      connection.close();
      console.log(`Updated ${result.modifiedCount} ${this.collectionName}`);
      return result;
    });
  }
  delete(id) {
    var connection = null;
    var updateOptions = {w: 1};
    return mongodb.connect(uri)
    .then(db => {
      connection = db;
      return db.collection(this.collectionName);
    })
    .then(collection => collection.deleteOne({_id: new ObjectId(id)}, updateOptions))
    .then(null, error => {
      console.error(error);
    })
    .then(result => {
      connection.close();
      console.log(`Deleted ${result.deletedCount} ${this.collectionName}`);
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
