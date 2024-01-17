import chai from 'chai';
import MongoClient from 'mongodb';
import dbClient from '../utils/db.js';

describe('dbClient test', () => {
  it('isAlive when mongodb started', () => new Promise((done) => {
    let i = 0;
    const repeatFct = async () => {
      await setTimeout(() => {
        i += 1;
        if (i >= 5) {
          chai.assert.isTrue(false);
          done();
        } else if (!dbClient.isAlive()) {
          repeatFct();
        } else {
          chai.assert.isTrue(true);
          done();
        }
      }, 1000);
    };
    repeatFct();
  })).timeout(20000);

	    let testClientDb = null;

	        const waitConnection = () => new Promise((resolve, reject) => {
    let i = 0;
    const repeatFct = async () => {
      await setTimeout(() => {
        i += 1;
        if (i >= 5) {
          reject();
        } else if (!dbClient.isAlive()) {
          repeatFct();
        } else {
          resolve();
        }
      }, 1000);
    };
    repeatFct();
  });

  beforeEach(async () => {
    const dbInfo = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '27017',
      database: process.env.DB_DATABASE || 'files_manager',
    };
    const mcPromise = () => new Promise((resolve, reject) => {
      MongoClient.connect(`mongodb://${dbInfo.host}:${dbInfo.port}/${dbInfo.database}`, (err, client) => {
        if (err) {
          reject();
        } else {
          resolve(client.db(dbInfo.database));
        }
      });
    });
    testClientDb = await mcPromise();
    await testClientDb.collection('users').deleteMany({});
    await waitConnection();
  });
  it('nbUsers for empty collection', async () => {
    chai.assert.equal(await dbClient.nbUsers(), 0);
  });
  it('nbUsers for a collection with one document', async () => {
    await testClientDb.collection('users').deleteMany({});
    await testClientDb.collection('users').insertOne({ email: 'me@me.com' });
    await waitConnection();
    chai.assert.equal(await dbClient.nbUsers(), 1);
  });

	    it('nbUsers for a collection with 12 documents', async () => {
    await testClientDb.collection('users').deleteMany({});

    const items = [];
    for (let i = 0; i < 12; i += 1) {
      items.push({ email: `me-${i}@me.com` });
    }
    await testClientDb.collection('users').insertMany(items);
    await waitConnection();
    chai.assert.equal(await dbClient.nbUsers(), 12);
  });
	    it('nbFiles for empty collection', async () => {
    await testClientDb.collection('files').deleteMany({});
    await waitConnection();
    chai.assert.equal(await dbClient.nbFiles(), 0);
  });

	    it('nbFiles for a collection with one document', async () => {
		        await testClientDb.collection('files').deleteMany({});
				 await waitConnection();
    await testClientDb.collection('files').insertOne({ name: 'myFile.txt' });
    chai.assert.equal(await dbClient.nbFiles(), 1);
  });

	    it('nbFiles for a collection with 12 documents', async () => {
		        await testClientDb.collection('files').deleteMany({});

    for (let i = 0; i < 12; i += 1) {
      await testClientDb.collection('files').insertOne({ email: `me-${i}@me.com` });
    }
    chai.assert.equal(await dbClient.nbFiles(), 12);
  });
});
