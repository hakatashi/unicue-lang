require('dotenv').config();

const fs = require('fs');
const {promisify} = require('util');
const category = require('unicode-11.0.0/General_Category');
const bidi = require('unicode-11.0.0/Bidi_Class');
const parser = require('codepoints/parser');
const {last} = require('lodash');

const swapBytes = (buffer) => {
	const l = buffer.length;
	for (let i = 0; i < l; i += 2) {
		[buffer[i], buffer[i + 1]] = [buffer[i + 1], buffer[i]];
	}
	return buffer;
};

const pairs = [
	[0x0028, 0x0029],
	[0x005B, 0x005D],
	[0x007B, 0x007D],
	[0x0F3A, 0x0F3B],
	[0x0F3C, 0x0F3D],
	[0x169B, 0x169C],
	[0x2045, 0x2046],
	[0x207D, 0x207E],
	[0x208D, 0x208E],
	[0x2308, 0x2309],
	[0x230A, 0x230B],
	[0x2329, 0x232A],
	[0x2768, 0x2769],
	[0x276A, 0x276B],
	[0x276C, 0x276D],
	[0x276E, 0x276F],
	[0x2770, 0x2771],
	[0x2772, 0x2773],
	[0x2774, 0x2775],
	[0x27C5, 0x27C6],
	[0x27E6, 0x27E7],
	[0x27E8, 0x27E9],
	[0x27EA, 0x27EB],
	[0x27EC, 0x27ED],
	[0x27EE, 0x27EF],
	[0x2983, 0x2984],
	[0x2985, 0x2986],
	[0x2987, 0x2988],
	[0x2989, 0x298A],
	[0x298B, 0x298C],
	[0x298D, 0x2990],
	[0x298F, 0x298E],
	[0x2991, 0x2992],
	[0x2993, 0x2994],
	[0x2995, 0x2996],
	[0x2997, 0x2998],
	[0x29D8, 0x29D9],
	[0x29DA, 0x29DB],
	[0x29FC, 0x29FD],
	[0x2E22, 0x2E23],
	[0x2E24, 0x2E25],
	[0x2E26, 0x2E27],
	[0x2E28, 0x2E29],
	[0x3008, 0x3009],
	[0x300A, 0x300B],
	[0x300C, 0x300D],
	[0x300E, 0x300F],
	[0x3010, 0x3011],
	[0x3014, 0x3015],
	[0x3016, 0x3017],
	[0x3018, 0x3019],
	[0x301A, 0x301B],
	[0xFE59, 0xFE5A],
	[0xFE5B, 0xFE5C],
	[0xFE5D, 0xFE5E],
	[0xFF08, 0xFF09],
	[0xFF3B, 0xFF3D],
	[0xFF5B, 0xFF5D],
	[0xFF5F, 0xFF60],
	[0xFF62, 0xFF63],
];

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
	const uniqueChars = new Set(chars);

	if (uniqueChars.size !== chars.length) {
		throw new Error('the characters used in the source code is not unique');
	}

	const codepoints = parser('UCD');

	const stdin = await new Promise((resolve) => {
		let chunks = [];

		process.stdin.on('data', (chunk) => {
			chunks.push(chunk);
		});

		process.stdin.on('end', () => {
			resolve(Buffer.concat(chunks));
		});
	})
	let stdinPointer = 0;

	let pointer = 0;
	let stack = [];

	const searchOpening = (current, [open, close]) => {
		let depth = 1;
		let pointer = current - 1;

		while (pointer >= 0) {
			const char = chars[pointer].codePointAt();
			if (char === open) {
				depth--;
			} else if (char === close) {
				depth++;
			}

			if (depth === 0) {
				return pointer;
			}

			pointer--;
		}

		return pointer;
	};

	const searchClosing = (current, [open, close]) => {
		let depth = 1;
		let pointer = current + 1;

		while (chars.length > pointer) {
			const char = chars[pointer].codePointAt();
			if (char === open) {
				depth++;
			} else if (char === close) {
				depth--;
			}

			if (depth === 0) {
				return pointer;
			}

			pointer++;
		}

		return pointer;
	};

	while (chars.length > pointer && pointer >= 0) {
		const char = chars[pointer];
		const info = codepoints[char.codePointAt()];

		if (!info) {
			pointer++;
			continue;
		}

		if (info.numeric.match(/^[\d/]+$/)) {
			const components = info.numeric.split('/');
			const number = parseInt(components[0]) / parseInt(components[1] || 1);

			if (info.script === 'Common') {
				stack.push(number);
			} else if (info.script === 'Arabic') {
				const a = stack.pop();
				stack.push(a + number);
			} else if (info.script === 'Tamil') {
				const a = stack.pop();
				stack.push(a - number);
			} else if (info.script === 'Devanagari') {
				const a = stack.pop();
				stack.push(a * number);
			} else if (info.script === 'Nko') {
				const a = stack.pop();
				stack.push(a / number);
			} else if (info.script === 'Han') {
				const a = stack.pop();
				stack.push(a % number);
			} else if (info.script === 'Medefaidrin') {
				pointer += number;
				continue;
			}

			pointer++;
			continue;
		}

		if (info.category === 'Ps') {
			if (info.script === 'Common') {
				const pair = pairs.find(([open]) => open === info.code);
				const closing = searchClosing(pointer, pair);

				if (last(stack) === 0) {
					pointer = closing + 1;
				}
			}
			continue;
		}

		if (info.category === 'Pe') {
			if (info.script === 'Common') {
				const pair = pairs.find(([, close]) => close === info.code);
				const opening = searchOpening(pointer, pair);

				if (last(stack) !== 0) {
					pointer = opening + 1;
				}
			}
			continue;
		}

		if (info.script === 'Modi') {
			// SWAP
			const a = stack.pop();
			const b = stack.pop();
			stack.push(a);
			stack.push(b);
		} else if (info.script === 'Egyptian_Hieroglyphs') {
			// POP
			stack.pop();
		} else if (info.script === 'Linear_A') {
			// READ
			const input = stdinPointer >= stdin.length ? -1 : stdin[stdinPointer];
			stdinPointer++;
			stack.push(input);
		} else if (info.script === 'Linear_B') {
			// WRITE
			const output = stack.pop();
			process.stdout.write(Buffer.from([output]));
		} else if (info.script === 'Batak') {
			// NEG
			const a = stack.pop();
			stack.push(-a);
		} else if (info.script === 'Runic') {
			// DUP
			const a = stack.pop();
			stack.push(a);
			stack.push(a);
		} else if (info.script === 'Thai') {
			// DUP3
			const a = stack.pop();
			stack.push(a);
			stack.push(a);
			stack.push(a);
		} else if (info.script === 'Hiragana') {
			// ADD
			const a = stack.pop();
			const b = stack.pop();
			stack.push(a + b);
		} else if (info.script === 'Katakana') {
			// SUB
			const a = stack.pop();
			const b = stack.pop();
			stack.push(a - b);
		} else if (info.script === 'Telugu') {
			// MUL
			const a = stack.pop();
			const b = stack.pop();
			stack.push(a * b);
		} else if (info.script === 'Georgian') {
			// DIV
			const a = stack.pop();
			const b = stack.pop();
			stack.push(a / b);
		} else if (info.script === 'Myanmar') {
			// CMP
			const a = stack.pop();
			const b = stack.pop();
			stack.push(a === b ? 1 : 0);
		} else if (info.script === 'Kannada') {
			// GT
			const a = stack.pop();
			const b = stack.pop();
			stack.push(a > b ? 1 : 0);
		} else if (info.script === 'Devanagari') {
			// LT
			const a = stack.pop();
			const b = stack.pop();
			stack.push(a < b ? 1 : 0);
		} else if (info.script === 'Cyrillic') {
			// AND
			const a = stack.pop();
			const b = stack.pop();
			stack.push((a !== 0 && b !== 0) ? 1 : 0);
		} else if (info.script === 'Arabic') {
			// OR
			const a = stack.pop();
			const b = stack.pop();
			stack.push((a !== 0 || b !== 0) ? 1 : 0);
		} else if (info.script === 'Syriac') {
			// NOT
			const a = stack.pop();
			stack.push(a === 0 ? 1 : 0);
		}

		pointer++;
	}
})();