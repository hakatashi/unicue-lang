require('dotenv').config();

const fs = require('fs');
const {promisify} = require('util');
const Twitter = require('twitter');
const twitterText = require('twitter-text');

(async () => {
	if (process.argv.length <= 2) {
		console.error('Usage: index.js <file>');
		throw new Error('file note specified');
	}

	const twitter = new Twitter({
		consumer_key: process.env.TWITTER_CONSUMER_KEY,
		consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
		access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
		access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
	});

	const file = process.argv[2];
	const sourceBuffer = await promisify(fs.readFile)(file);
	const source = sourceBuffer.toString();

	// const tweets = await twitter.get('statuses/user_timeline', {screen_name: 'kcz146'});
	const tweets = require('./temp.json');

	let isEntered = false;
	tweets.sort((a, b) => {
		if (a.created_at && b.created_at) {
			const atA = new Date(a.created_at);
			const atB = new Date(b.created_at);
			return atA.getTime() - atB.getTime();
		}

		if (a.id_str && b.id_str) {
			return a.id_str.localeCompare(b.id_str);
		}

		return 0;
	});

	for (const tweet of tweets) {
		console.log(tweet.text, twitterText.parseTweet(tweet.text));
	}
})();