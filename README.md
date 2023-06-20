# Redis Failover Demo

This project demonstrates the behavior of redis clients during server failure events.

To start the application, run

```
docker-compose up
```

This repo also includes k6 tests to generate load on the server. This test will simulate a read-heavy cache workload. 
A set number of keys should be generated ahead of time using `keys.sh` for the tests to read from. Each virtual user will
perform the following actions:

1. Uses the current timestamp to determine which key to use for the test
2. GET the value from Redis
3. If the value is not set, we will now save the current timestamp.
4. If the value is set, but is greater than some pre-determined TTL, we will overwrite the value. 

The TTL should be determined by the ratio of writes and reads we want to simulate. Consider the following:

* Target ratio: 20% writes, 80% reads
* 2000 tests/sec (2 test/ms)
* 4000 keys

(4000 / 2) / 0.2

In the above scenario, we will on average check each key once per second, and we want to overwrite 200 of those keys each
second. So, the artificial TTL must be 10 seconds to ensure that each key will be overwritten 20% of the time that is read.