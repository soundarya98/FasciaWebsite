var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");

    let coll = dbo.collection('EEG-FPZ-CZ');
    coll.deleteMany({});
    coll.estimatedDocumentCount().then((count) => {
        console.log(count)
        db.close();
    });
});

