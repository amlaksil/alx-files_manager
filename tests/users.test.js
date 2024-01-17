import chai from 'chai';
import chaiHttp from 'chai-http';

import MongoClient from 'mongodb';
import sha1 from 'sha1';

chai.use(chaiHttp);

describe('gET /users', () => {
  let testClientDb = null;
  let initialUser = null;

  const fctRandomString = () => Math.random().toString(36).substring(2, 15);

  beforeEach(() => {
    const dbInfo = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '27017',
      database: process.env.DB_DATABASE || 'files_manager',
    };
    return new Promise((resolve) => {
      MongoClient.connect(`mongodb://${dbInfo.host}:${dbInfo.port}/${dbInfo.database}`, async (err, client) => {
        testClientDb = client.db(dbInfo.database);

        await testClientDb.collection('users').deleteMany({});

        resolve();
      });
    });
  });

  afterEach(() => {
  });

  it('gET /users creates a new user in DB (when pass correct parameters)', () => new Promise((done) => {
    const userParam = {
      email: `${fctRandomString()}@me.com`,
      password: `${fctRandomString()}`,
    };
    chai.request('http://localhost:5000')
      .post('/users')
      .send(userParam)
      .end((err, res) => {
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(201);
        const resUserId = res.body.id;
        const resUserEmail = res.body.email;
        chai.expect(resUserEmail).to.equal(userParam.email);

        testClientDb.collection('users')
          .find({})
          .toArray((err, docs) => {
            chai.expect(err).to.be.null;
            chai.expect(docs.length).to.equal(1);
            chai.expect(docs[0]._id.toString()).to.equal(resUserId);
            chai.expect(docs[0].email).to.equal(resUserEmail);
            done();
          });
      });
  })).timeout(30000);

		    it('gET /users with missing email', () => new Promise((done) => {
    const userParam = {
      password: `${fctRandomString()}`,
    };
    chai.request('http://localhost:5000')
      .post('/users')
      .send(userParam)
      .end((err, res) => {
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(400);
        const resError = res.body.error;
        chai.expect(resError).to.equal('Missing email');

        testClientDb.collection('users')
          .find({})
          .toArray((err, docs) => {
            chai.expect(err).to.be.null;
            chai.expect(docs.length).to.equal(0);
            done();
          });
      });
  })).timeout(30000);

		    it('gET /users with missing password', () => new Promise((done) => {
    const userParam = {
      email: `${fctRandomString()}@me.com`,
    };
    chai.request('http://localhost:5000')
      .post('/users')
      .send(userParam)
      .end((err, res) => {
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(400);
        const resError = res.body.error;
        chai.expect(resError).to.equal('Missing password');

        testClientDb.collection('users')
          .find({})
          .toArray((err, docs) => {
            chai.expect(err).to.be.null;
            chai.expect(docs.length).to.equal(0);
            done();
          });
      });
  })).timeout(30000);

		    it('gET /users with email that already exists', () => new Promise((done) => {
					 // Add 1 user
    initialUser = {
      email: `${fctRandomString()}@me.com`,
      password: sha1(fctRandomString()),
    };
    testClientDb.collection('users').insertOne(initialUser);
					 const userParam = {
      email: initialUser.email,
      password: `${fctRandomString()}`,
    };
    chai.request('http://localhost:5000')
      .post('/users')
      .send(userParam)
      .end((err, res) => {
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(400);
        const resError = res.body.error;
        chai.expect(resError).to.equal('Already exist');

        testClientDb.collection('users')
          .find({})
          .toArray((err, docs) => {
            chai.expect(err).to.be.null;
            chai.expect(docs.length).to.equal(1);
            const docUser = docs[0];
            chai.expect(docUser.email).to.equal(initialUser.email);
            chai.expect(docUser.password.toUpperCase()).to.equal(initialUser.password.toUpperCase());
            done();
          });
      });
  })).timeout(30000);
});
