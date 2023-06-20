import * as crypto from 'crypto';

export const aesEncrypt = (data: string, key: string, iv: string) => {
  const cipher = crypto.createCipheriv(
    'aes192',
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex')
  );
  const crypted = cipher.update(data, 'utf8', 'hex');
  return crypted + cipher.final('hex');
};

export const aesDecrypt = (encrypted: string, key: string, iv: string) => {
  const decipher = crypto.createDecipheriv(
    'aes192',
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex')
  );
  const decrypted = decipher.update(encrypted, 'hex', 'utf8');
  return decrypted + decipher.final('utf8');
};
