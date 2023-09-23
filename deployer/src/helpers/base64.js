import crypto from 'crypto';

export const randomString = () => {
  const randomString = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${randomString}-${timestamp}`;
};
// Function to encode data to Base64
export const toBase64 = (data = randomString) => {
  return Buffer.from(data).toString('base64');
};

// Function to decode data from Base64
export const fromBase64 = (base64Data) => {
  return Buffer.from(base64Data, 'base64').toString('utf-8');
};
