# Image Repository
# How to start
just run
```bash
npm i
npm run start
```

## config
You can change the settings with some environment variables:


| Variable name        | purpose          |
| ------------- |:-------------:|
| PORT      | The port to which express will listen|
| REDIS_CONF_PATH      | A path to a JSON file with the redis connection config      |
| MONGODB_URI | The url of the mongodb server      |
| NODE_MAX_UPLOADS      | How many images is the user allowed per X seconds |
| NODE_TIME_LIMIT      | How many seconds until the user throttling timer expires      |

Basically the user is allowed to upload <NODE_MAX_UPLOADS> images per <NODE_TIME_LIMIT> seconds