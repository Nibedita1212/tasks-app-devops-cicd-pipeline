const test = require('node:test');
const assert = require('node:assert');
const { validateTitle } = require('../src/validate');

test('accepts a normal title', () => assert.strictEqual(validateTitle('Learn Jenkins'), true));
test('rejects empty title', () => assert.strictEqual(validateTitle('   '), false));
test('rejects non-string', () => assert.strictEqual(validateTitle(42), false));
test('rejects title longer than 100 chars', () => assert.strictEqual(validateTitle('a'.repeat(101)), false));
