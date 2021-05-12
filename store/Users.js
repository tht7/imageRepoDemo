/**
 * @author tht7 ( tht7 )
 * @date 12/05/2021 2:32 PM
 *
 */
// region imports and connections
const Redis   = require('ioredis');
const fs      = require('fs');
let redisConf = undefined;
if ( process.env.REDIS_CONF_PATH ) {
	try {
		redisConf = JSON.parse(fs.readFileSync(process.env.REDIS_CONF_PATH));
	} catch (configLoadingException) {
		console.error(`Was unable to load redis config from "${process.env.REDIS_CONF_PATH}", Error: `, configLoadingException);
		redisConf = undefined;
	}
}
const redis   = new Redis(redisConf); // uses defaults unless given configuration object
// endregion

// region config
/**
 * Will determine the max images the user is permitted to upload per timeUnit
 * @type {number|number}
 */
const MAX_UPLOADS_LIMIT = parseInt(process.env.NODE_MAX_UPLOADS)    || 1;
/**
 * Will determine the time unit
 * (so the user is allow to upload up to MAX_UPLOADS_LIMIT images per TIME_UPLOAD_LIMIT seconds)
 * @type {number|number}
 */
const TIME_UPLOAD_LIMIT = parseInt(process.env.NODE_TIME_LIMIT)     || 60;
// endregion config

exports.user = {
	/**
	 * Will create a self expiring key on redis representing the amount the user has posted,
	 * Every time this function is called the key's value will be incremented,
	 * if the value is above a certain limit we'll return false (to cancel the request),
	 * the counter will reset every X seconds
	 * @param userId
	 * @return {boolean}
	 */
	async rateLimitUser(userId) {
		const key = `user_limit:${userId}`;
		const counter = await redis.incr(key);
		if (counter === 1) {
			await redis.expire(key, TIME_UPLOAD_LIMIT);
		}
		return counter <= MAX_UPLOADS_LIMIT;
	}
};
