const crypto = require('crypto');

const algorithm = 'aes192';
const key = 'Ak5Nl98Ln';

export function encrypt(password) {
  const cipher = crypto.createCipher(algorithm, key);
  let crypted = cipher.update(password, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

export function decrypt(password) {
  const decipher = crypto.createDecipher(algorithm, key);
  let dec = decipher.update(password, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}
