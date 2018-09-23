require('dotenv').config();

const fs = require('fs');
const {promisify} = require('util');
const category = require('unicode-11.0.0/General_Category');
const bidi = require('unicode-11.0.0/Bidi_Class');
const parser = require('codepoints/parser');

const codepoints = parser('UCD');

const swapBytes = (buffer) => {
	const l = buffer.length;
	for (let i = 0; i < l; i += 2) {
		[buffer[i], buffer[i + 1]] = [buffer[i + 1], buffer[i]];
	}
	return buffer;
};

(async () => {
	if (process.argv.length <= 2) {
		console.error('Usage: index.js <file>');
		throw new Error('file note specified');
	}

	const file = process.argv[2];

	const sourceBuffer = await promisify(fs.readFile)(file);

	let source = '';
	if (sourceBuffer.slice(0, 3).equals(Buffer.from([0xEF, 0xBB, 0xBF]))) {
		source = sourceBuffer.slice(3).toString('utf8');
	} else if (sourceBuffer.slice(0, 2).equals(Buffer.from([0xFE, 0xFF]))) {
		source = swapBytes(sourceBuffer.slice(2)).toString('utf16le');
	} else if (sourceBuffer.slice(0, 2).equals(Buffer.from([0xFE, 0xFF]))) {
		source = sourceBuffer.slice(2).toString('utf16le');
	} else {
		source = sourceBuffer.toString('utf8');
	}
	const chars = Array.from(source);

	let pointer = 0;
	let stack = [];

	while (chars.length > pointer) {
		const char = chars[pointer];
		console.log(codepoints[char.codePointAt()]);

		pointer++;
	}
})();