export enum BillTypes {
    BILL = 'bill',
    COIN = 'coin'
}

export type Bill = {
    value: number;
    quantity: number | null | string;
    total: number;
    type: BillTypes;
};