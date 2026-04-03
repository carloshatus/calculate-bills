import { describe, it, expect } from 'vitest';

function getValueExpr(expr: number | null | string): number {
	try {
		const value = eval(String(expr));
		return value ? Number(value) : 0;
	} catch (e) {
		return 0;
	}
}

describe('Calculation Logic', () => {
	it('should evaluate simple expressions', () => {
		expect(getValueExpr('10+5')).toBe(15);
		expect(getValueExpr('10*2')).toBe(20);
		expect(getValueExpr('20-5')).toBe(15);
		expect(getValueExpr('10/2')).toBe(5);
	});

	it('should return 0 for invalid expressions', () => {
		expect(getValueExpr('abc')).toBe(0);
		expect(getValueExpr('10++5')).toBe(0);
	});

	it('should handle null or empty values', () => {
		expect(getValueExpr(null)).toBe(0);
		expect(getValueExpr('')).toBe(0);
	});
});
