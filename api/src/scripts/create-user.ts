import * as mongodb from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

/* Usage:
MONGO_USER=XXX MONGO_PWD=XXX MONGO_HOST=XXX SALT=XXX IV=XXX node create-user.js <account> <validDays>
* MONGO_USER: MongoDB用户名
* MONGO_PWD: MongoDB密码
* MONGO_HOST: MongoDB主机
* SALT: 加密盐
* IV: 加密向量
* account: 用户名
* validDays: 有效期（天），可选
*/

const aesEncrypt = (data: string, key: string, iv: string) => {
  const cipher = crypto.createCipheriv(
    'aes192',
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex')
  );
  const crypted = cipher.update(data, 'utf8', 'hex');
  return crypted + cipher.final('hex');
};

const generateRandomString = (length: number): string => {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+~`|}{[]\\:;"<>,.?/';

  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }

  return result;
};

// 获取命令行参数
const args = process.argv.slice(2);
const [account, validDays] = args;

// MongoDB连接字符串
const connectionString = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_HOST}:27017`;

// 数据库名称
const dbName = 'dbname';

// 创建一个MongoDB客户端实例
const client = new mongodb.MongoClient(connectionString);

// 连接数据库并创建用户记录
async function createMongoUser() {
  try {
    // 连接数据库
    await client.connect();
    console.log('Connected to MongoDB');

    // 获取数据库实例
    const db = client.db(dbName);

    // 获取用户集合
    const usersCollection = db.collection('users');

    const ramdomPassword = generateRandomString(16);
    // 加密用户密码
    const cryptPws = aesEncrypt(
      ramdomPassword,
      process.env.SALT,
      process.env.IV
    );

    // 创建用户记录
    const user = {
      account,
      password: cryptPws,
      uuid: uuidv4(),
      status: 'NORMAL',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (validDays) {
      const validDaysNum = parseInt(validDays);
      user['expiredAt'] = new Date(
        new Date().getTime() + validDaysNum * 24 * 60 * 60 * 1000
      );
    }

    // 插入用户记录
    const result = await usersCollection.insertOne(user);
    console.log(
      `Created user with ID: ${result.insertedId}, password is: ${ramdomPassword}`
    );
  } catch (error) {
    console.error(error);
  } finally {
    // 断开数据库连接
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// 调用连接数据库的函数
createMongoUser();
