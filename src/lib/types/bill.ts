export enum BillTypes {
	BILL = 'bill',
	COIN = 'coin'
}

export type Bill = {
	value: number;
	quantity: number | null | string;
	total: number;
	type: BillTypes;
	originalQuantity?: number | null | string;
};

export type SavedCalculation = {
	id: string;
	name: string;
	date: string;
	createdAt?: string;
	bills: Bill[];
	observations: string[];
	total: number;
};
