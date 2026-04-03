<script lang="ts">
	import { parseToCurrency } from '$lib/utils/currency';
	import { Icon } from 'svelte-icons-pack';
	import { BiCoin } from 'svelte-icons-pack/bi';
	import { FaSolidMoneyBill1Wave } from 'svelte-icons-pack/fa';

	export let total = 0;
	export let totalBills = 0;
	export let totalCoins = 0;
	export let totalQuantity: number | null = null;
	export let rest: number | null = null;
</script>

<div class="card totals-card">
	<div class="main-total">
		<span class="label">Total Geral</span>
		<span class="amount">{parseToCurrency(total)}</span>
	</div>

	{#if rest !== null}
		<div class="sub-total rest">
			<span class="label">Sobra</span>
			<span class="amount">{parseToCurrency(rest)}</span>
		</div>
	{/if}

	<div class="breakdown">
		<div class="item">
			<div class="icon-label bill">
				<Icon src={FaSolidMoneyBill1Wave} />
				<span>Cédulas</span>
			</div>
			<span class="value">{parseToCurrency(totalBills)}</span>
		</div>

		<div class="item">
			<div class="icon-label coin">
				<Icon src={BiCoin} />
				<span>Moedas</span>
			</div>
			<span class="value">{parseToCurrency(totalCoins)}</span>
		</div>

		{#if totalQuantity !== null}
			<div class="item quantity">
				<span class="label">Qtd. Total</span>
				<span class="value">{totalQuantity}</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.totals-card {
		padding: 1.5rem;
		background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
		color: white;
		border: none;
		margin: 1rem var(--padding);
	}

	.main-total {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.main-total .label {
		font-size: 0.9rem;
		opacity: 0.9;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.main-total .amount {
		font-size: 2.5rem;
		font-weight: 800;
	}

	.sub-total.rest {
		background: rgba(255, 255, 255, 0.1);
		padding: 0.75rem;
		border-radius: 8px;
		display: flex;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.breakdown {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		padding: 1rem;
		border-radius: 12px;
	}

	.item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 1rem;
		color: white;
	}

	.icon-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #ffffff;
	}

	.icon-label.bill :global(svg) {
		color: #58ff8c; /* Very bright green for icon contrast */
	}

	.icon-label.coin :global(svg) {
		color: #ffd700; /* Bright gold for icon contrast */
	}

	.item .value {
		font-weight: 700;
		font-size: 1.1rem;
		color: #ffffff;
	}

	.quantity {
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		margin-top: 0.5rem;
		padding-top: 0.5rem;
	}
</style>
