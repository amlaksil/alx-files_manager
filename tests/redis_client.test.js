import chai from 'chai';
import sinon from 'sinon';
import redis from 'redis';
import { promisify } from 'util';

import redisClient from '../utils/redis.js';

sinon.stub(console, 'log');
describe('redisClient test', () => {
  it('isAlive when redis started', () => new Promise((done) => {
    let i = 0;
    const repeatFct = async () => {
      await setTimeout(() => {
        i += 1;
        if (i >= 5) {
          chai.assert.isTrue(false);
          done();
        } else if (!redisClient.isAlive()) {
          repeatFct();
        } else {
          chai.assert.isTrue(true);
          done();
        }
      }, 1000);
    };
    repeatFct();
  })).timeout(10000);
  let testRedisClient;
  let redisDelAsync;
  let redisSetAsync;
  let redisGetAsync;

  beforeEach((done) => {
    testRedisClient = redis.createClient();
    redisDelAsync = promisify(testRedisClient.del).bind(testRedisClient);
    redisSetAsync = promisify(testRedisClient.set).bind(testRedisClient);
    redisGetAsync = promisify(testRedisClient.get).bind(testRedisClient);
    testRedisClient.on('connect', async () => {
      await redisSetAsync('myCheckerKey', 89);
      done();
    });
  });

  afterEach(async () => {
    await redisDelAsync('myCheckerKey');
  });

  it('get of existing key', async () => {
    const kv = await redisClient.get('myCheckerKey');
    chai.assert.exists(kv);
    chai.assert.equal(kv, 89);
  });

  it('set new key/value', async () => {
    await redisClient.set('setCheckerKey', '89', 1000);
    const kv = await redisGetAsync('setCheckerKey');
    chai.assert.exists(kv);
    chai.assert.equal(kv, 89);
  });

	    it('set new key/value with expiration', () => new Promise((done) => {
    setTimeout(async () => {
      await redisClient.set('setCheckerKey', 89, 2);
      const kv = await redisGetAsync('setCheckerKey');
      chai.assert.exists(kv);
      chai.assert.equal(kv, 89);

      setTimeout(async () => {
        const newKv = await redisGetAsync('setCheckerKey');
        chai.assert.notExists(newKv);
        done();
      }, 5000);
    }, 100);
  })).timeout(10000);

	    it('set new key/value', async () => {
    const kv = await redisGetAsync('myCheckerKey');
    chai.assert.exists(kv);
    chai.assert.equal(kv, 89);

    await redisClient.del('myCheckerKey');

    const newKv = await redisGetAsync('myCheckerKey');
    chai.assert.notExists(newKv);
  });
});
