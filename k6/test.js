import http from "k6/http";
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { SharedArray } from 'k6/data';

// The targeted percentage of commands which should be writes
const writePct = __ENV.WRITE_PERCENTAGE || 0.2

// Rate of reads throughout the test. The actual rate of HTTP requests may be greater
// since a write would be included in the same test
const rate = __ENV.RATE || 300;

const keys = new SharedArray('keys', function() {
  const data = open('keys.txt');
  return data.split("\n");
});

// The artificial TTL to use in the test to maintain the desired write percentage
const ms = (keys.length / (rate / 1000)) / writePct;

export const options = {
  scenarios: {
    fixed_write_percentage: {
      executor: 'constant-arrival-rate',
      duration: '30s',
      rate: rate,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 1000
    }
  }
};

export default function () {
  const now = new Date();

  // Random keys are used for each VU to ensure that key ordering does not
  // affect which Redis host is used for a key
  const key = keys[randomIntBetween(0, keys.length-1)];
  const domain = "localhost:9000";

  // Get the key from cache
  const getResponse = http.get(`http://${domain}/get/${key}`);
  const v = getResponse.json('value');

  // If the key is not found, or the cached value is a date greater than our
  // artificial TTL, we should overwrite the value with the current time
  if (!v || now - Date.parse(v) > ms)
    http.post(`http://${domain}/set/${key}/${now}`);
}
