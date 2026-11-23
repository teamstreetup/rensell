const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/rensell';
const ATLAS_URI = 'mongodb+srv://Vercel-Admin-atlas-pro-rensell:6CnqI9WDMADObmfc@atlas-pro-rensell.ohnngim.mongodb.net/rensell?retryWrites=true&w=majority';

async function migrate() {
  console.log('='.repeat(50));
  console.log('Starting Migration from Local MongoDB to Atlas Cloud');
  console.log('='.repeat(50));

  let localConn, atlasConn;

  try {
    console.log('\n1. Connecting to Local MongoDB...');
    localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✓ Connected to Local MongoDB');

    console.log('\n2. Connecting to MongoDB Atlas Cloud...');
    atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✓ Connected to MongoDB Atlas Cloud');

    const collections = ['users', 'products', 'orders', 'reviews'];

    for (const collName of collections) {
      console.log(`\n--- Migrating collection: ${collName} ---`);
      const localColl = localConn.db.collection(collName);

      const docs = await localColl.find({}).toArray();
      console.log(`Found ${docs.length} document(s) in local ${collName}`);

      if (docs.length > 0) {
        // Sync to 'rensell' database on Atlas
        const rensellColl = atlasConn.useDb('rensell').collection(collName);
        await rensellColl.deleteMany({});
        await rensellColl.insertMany(docs);
        console.log(`✓ Synced ${docs.length} document(s) to Atlas rensell.${collName}`);

        // Also sync to 'test' database on Atlas (Vercel default without dbName)
        const testColl = atlasConn.useDb('test').collection(collName);
        await testColl.deleteMany({});
        await testColl.insertMany(docs);
        console.log(`✓ Synced ${docs.length} document(s) to Atlas test.${collName}`);
      } else {
        console.log(`No documents to migrate for ${collName}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Verification: Document counts in MongoDB Atlas:');
    for (const collName of collections) {
      const count = await atlasConn.db.collection(collName).countDocuments();
      console.log(` - ${collName}: ${count}`);
    }
    console.log('='.repeat(50));
    console.log('✓ Migration Completed Successfully!');

  } catch (error) {
    console.error('\n✗ Migration Error:', error);
    process.exit(1);
  } finally {
    if (localConn) await localConn.close();
    if (atlasConn) await atlasConn.close();
  }
}

migrate();
