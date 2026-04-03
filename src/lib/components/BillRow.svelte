<script lang="ts">
	import { type Bill, BillTypes } from '$lib/types/bill';
	import { parseToCurrency } from '$lib/utils/currency';
	import { Icon } from 'svelte-icons-pack';
	import { BiCoin } from 'svelte-icons-pack/bi';
	import { FaSolidMoneyBill1Wave } from 'svelte-icons-pack/fa';

	export let bill: Bill;
	export let readonly = false;
	export let index: number;
	export let originalQuantity: number | string | null = null;
</script>

<div class="card container bill-row">
	{#if readonly}
		<div class="row-content">
			<span class={`value ${bill.type}`}>
				<Icon src={bill.type === BillTypes.COIN ? BiCoin : FaSolidMoneyBill1Wave} />
				{parseToCurrency(bill.value)}
			</span>
			<span class="bill-quantity">
				{bill.quantity || 0}
				{#if originalQuantity}
					<small class="text-muted">/ {originalQuantity}</small>
				{/if}
			</span>
			<span class="total-label">{parseToCurrency(bill.total)}</span>
		</div>
	{:else}
		<label class={`value ${bill.type}`} for="bill-quantity-{index}">
			<Icon src={bill.type === BillTypes.COIN ? BiCoin : FaSolidMoneyBill1Wave} />
			{parseToCurrency(bill.value)}
		</label>
		<div class="input-wrapper">
			<slot />
		</div>
		<label class="total-label" for="bill-quantity-{index}">
			{parseToCurrency(bill.total)}
		</label>
	{/if}
</div>

<style>
	.bill-row {
		margin-bottom: 0.5rem;
		transition: transform 0.2s;
	}

	.bill-row:focus-within {
		transform: translateY(-2px);
		border-color: var(--primary);
	}

	.row-content {
		display: flex;
		align-items: center;
		width: 100%;
		gap: 0.75rem;
	}

	.input-wrapper {
		flex: 1;
		display: flex;
		justify-content: center;
	}

	:global(.bill-quantity) {
		text-align: center;
		font-weight: 600;
		font-size: 1.1rem;
	}

	.text-muted {
		color: var(--text-muted);
		font-size: 0.8rem;
		margin-left: 4px;
	}
</style>
