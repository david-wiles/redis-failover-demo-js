import http from "k6/http";
import { SharedArray } from 'k6/data';

// The targeted percentage of commands which should be writes in the tested workload
const writePct = 0.2

const rate = 2000;
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
      maxVUs: 500
    }
  }
};

export default function () {
  const now = new Date();
  const key = keys[now.getMilliseconds() % keys.length];
  const domain = "localhost:9000";

  const getResponse = http.get(`http://${domain}/get/${key}`);
  const v = getResponse.json('value');
  if (!v || now - Date.parse(v) > ms) http.post(`http://${domain}/set/${key}/${now}`);
}
