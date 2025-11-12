<script lang="ts">
	import { parseToCurrency } from '$lib/utils/currency';
	import { Icon } from 'svelte-icons-pack';
	import { BsPlus } from 'svelte-icons-pack/bs';
	import { BiCoin } from 'svelte-icons-pack/bi';
	import { FaSolidMoneyBill1Wave } from 'svelte-icons-pack/fa';
	import { billColor, coinColor } from '$lib/constants';

	export let total = 0;
	export let totalBills = 0;
	export let totalCoins = 0;
	export let totalQuantity: number | null = null;
	export let rest: number | null = null;
</script>

<div class="container total">
	<h1>
		<Icon src={FaSolidMoneyBill1Wave} color={billColor} /><Icon src={BsPlus} /><Icon
			src={BiCoin}
			color={coinColor}
		/> Total: {parseToCurrency(total)}
	</h1>
	{#if rest !== null}
		<h1>
			<Icon src={FaSolidMoneyBill1Wave} color={billColor} /><Icon src={BsPlus} /><Icon
				src={BiCoin}
				color={coinColor}
			/> Sobra: {parseToCurrency(rest)}
		</h1>
	{/if}
	<h2 class="bill">
		<Icon src={FaSolidMoneyBill1Wave} /> Cédulas: {parseToCurrency(totalBills)}
	</h2>
	<h2 class="coin"><Icon src={BiCoin} /> Moedas: {parseToCurrency(totalCoins)}</h2>
	{#if totalQuantity !== null}
		<h2>
			<Icon src={FaSolidMoneyBill1Wave} color={billColor} /><Icon src={BsPlus} /><Icon
				src={BiCoin}
				color={coinColor}
			/> Quantidade Total:
			{totalQuantity}
		</h2>
	{/if}
</div>
