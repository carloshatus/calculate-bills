<script lang="ts">
	import { type Bill, BillTypes } from '$lib/types/bill';
	import { parseToCurrency } from '$lib/utils/currency';
	import { Icon } from 'svelte-icons-pack';
	import { BiCoin } from 'svelte-icons-pack/bi';
	import { FaSolidMoneyBill1Wave } from 'svelte-icons-pack/fa';

	export let bill: Bill;
	export let readonly = false;
	export let index: number;
</script>

<div class="container">
	{#if readonly}
		<p class="value">
			<Icon src={bill.type === BillTypes.COIN ? BiCoin : FaSolidMoneyBill1Wave} />
			{parseToCurrency(bill.value)}
		</p>
		<i class="bill-quantity">{bill.quantity}</i>
		<i class="total-label">{parseToCurrency(bill.total)}</i>
	{:else}
		<label class={`value ${bill.type}`} for="bill-quantity-{index}">
			<Icon src={bill.type === BillTypes.COIN ? BiCoin : FaSolidMoneyBill1Wave} />
			{parseToCurrency(bill.value)}
		</label>
		<slot />
		<label class="total-label" for="bill-quantity-{index}">{parseToCurrency(bill.total)}</label>
	{/if}
</div>
