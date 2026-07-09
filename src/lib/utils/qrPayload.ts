import type { Bill } from '$lib/types/bill';
import { BillTypes } from '$lib/types/bill';

export interface QRPayload {
	v: number; // schema version
	n: string; // page name
	b: Array<[number, string | number | null]>; // [value, quantity]
	o: string[]; // observations
}

/**
 * Encodes bills, pageName and observations into a compact JSON string for QR Code.
 */
export function encodePayload(bills: Bill[], pageName: string, observations: string[]): string {
	const payload: QRPayload = {
		v: 1,
		n: pageName || '',
		b: bills.map((bill) => [bill.value, bill.quantity ?? null]),
		o: observations
	};
	return JSON.stringify(payload);
}

/**
 * Decodes a QR payload string back into bills, pageName and observations.
 */
export function decodePayload(raw: string): {
	bills: Bill[];
	pageName: string;
	observations: string[];
} | null {
	try {
		const payload: QRPayload = JSON.parse(raw);
		if (payload.v !== 1 || !Array.isArray(payload.b)) return null;

		const VALUE_TYPE_MAP: Record<number, BillTypes> = {
			200: BillTypes.BILL,
			100: BillTypes.BILL,
			50: BillTypes.BILL,
			20: BillTypes.BILL,
			10: BillTypes.BILL,
			5: BillTypes.BILL,
			2: BillTypes.BILL,
			1: BillTypes.COIN,
			0.5: BillTypes.COIN,
			0.25: BillTypes.COIN,
			0.1: BillTypes.COIN,
			0.05: BillTypes.COIN,
			0.01: BillTypes.COIN
		};

		const bills: Bill[] = payload.b.map(([value, quantity]) => {
			const qty = quantity ?? null;
			const numQty = qty !== null ? Number(qty) : 0;
			return {
				value,
				quantity: qty,
				total: isNaN(numQty) ? 0 : numQty * value,
				type: VALUE_TYPE_MAP[value] ?? BillTypes.BILL
			};
		});

		return {
			bills,
			pageName: payload.n || '',
			observations: Array.isArray(payload.o) ? payload.o : []
		};
	} catch {
		return null;
	}
}

export type MergeStrategy = 'sum' | 'overwrite' | 'fill_empty';

/**
 * Merges incoming bills into current bills based on strategy.
 * Bills are matched by value.
 */
export function mergeBills(current: Bill[], incoming: Bill[], strategy: MergeStrategy): Bill[] {
	const incomingMap = new Map<number, Bill>();
	for (const bill of incoming) {
		incomingMap.set(bill.value, bill);
	}

	return current.map((bill) => {
		const inc = incomingMap.get(bill.value);
		if (!inc) return bill;

		const currentQty =
			bill.quantity !== null && bill.quantity !== '' ? Number(bill.quantity) : null;
		const incQty = inc.quantity !== null && inc.quantity !== '' ? Number(inc.quantity) : null;

		let newQty: number | null;

		switch (strategy) {
			case 'sum': {
				const a = currentQty ?? 0;
				const b = incQty ?? 0;
				newQty = a + b;
				break;
			}
			case 'overwrite': {
				newQty = incQty;
				break;
			}
			case 'fill_empty': {
				newQty = currentQty === null || currentQty === 0 ? incQty : currentQty;
				break;
			}
		}

		return {
			...bill,
			quantity: newQty,
			total: (newQty ?? 0) * bill.value
		};
	});
}

/**
 * Merges observations: union deduplicated.
 */
export function mergeObservations(current: string[], incoming: string[]): string[] {
	const set = new Set([...current, ...incoming]);
	return Array.from(set);
}
