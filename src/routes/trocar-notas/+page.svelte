<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import Storage from '$lib/services/storageService';
	import { type Bill, BillTypes } from '$lib/types/bill';
	import { parseToCurrency } from '$lib/utils/currency';

	const storage = new Storage(browser);

	let availableBills: Bill[] = storage.get<Bill[]>('billsSaved') || [];
	let amount: number | null = storage.get<number>('amountSaved') || null;
	let result: Bill[] = [];
	let total: number = 0;
	let rest: number = 0;
	let totalBills: number = 0;
	let totalCoins: number = 0;

	if (amount) {
		exchange();
	}

	function exchange() {
		total = 0;
		result = [];

		const target = Number(amount || '0');

		if (!target) {
			return [];
		}

		let remainingAmount = target;

		const billsToConsider = [...availableBills]
			.filter((bill) => bill.value <= 20)
			.filter((bill) => bill.quantity && Number(bill.quantity) > 0)
			.sort((a, b) => a.value - b.value);

		for (const bill of billsToConsider) {
			const billValue = bill.value;
			const billQuantity = Number(bill.quantity);
			let count = 0;

			if (total < target) {
				count = Math.floor(remainingAmount / billValue) + 1;
				if (count > billQuantity) {
					count = billQuantity;
				}
				remainingAmount -= count * billValue;
				remainingAmount = Number(remainingAmount.toFixed(2));
			}

			if (count > 0) {
				result.push({
					value: billValue,
					quantity: count,
					total: count * billValue,
					type: bill.type
				});
			}
			if (result.length) {
				total = result.reduce((sum, { total }) => (sum += total), 0);
				rest = total - target;
				totalCoins = result.reduce(
					(sum, { type, total }) => (sum += type === BillTypes.COIN ? total : 0),
					0
				);
				totalBills = result.reduce(
					(sum, { type, total }) => (sum += type === BillTypes.BILL ? total : 0),
					0
				);
			}
		}
	}

	function enterAction(e: KeyboardEvent): void {
		const { key } = e;
		if (key === 'Enter') {
			e.preventDefault();
			exchange();
		}
	}
</script>

<div class="main-content">
	<header class="container">
		<h1>Trocar Notas</h1>
		<div class="container">
			<button
				class="transparent noprint"
				title="Trocar Notas"
				on:click={() => {
					goto(base);
				}}
			>
				<i>{'🔄'}</i>
			</button>
			<button
				class="transparent noprint"
				title="Imprimir"
				on:click={() => {
					window.print();
				}}
			>
				<i>{'📥'}</i>
			</button>
		</div>
	</header>

	<div class="container">
		<label for="amount">Valor a ser trocado:</label>
		<input
			type="number"
			id="amount"
			placeholder="0"
			bind:value={amount}
			on:change={() => storage.save('amountSaved', amount)}
			on:keydown={(e) => enterAction(e)}
		/>
		<button class="noprint" on:click={exchange}>Trocar</button>
	</div>

	{#if result.length > 0}
		<div class="container total">
			<h1>Resultado:</h1>
		</div>
		{#each result as bill, i}
			<div class="container">
				<p class="value">
					<i>{bill.type === BillTypes.COIN ? '🪙' : '💵'}</i>
					{parseToCurrency(bill.value)}
				</p>
				<i class="bill-quantity">{bill.quantity}</i>
				<i class="total-label">{parseToCurrency(bill.total)}</i>
			</div>
		{/each}
	{/if}
	<div class="container total">
		<h1><i>{'💵 + 🪙'}</i>Total: {parseToCurrency(total)}</h1>
		<h1><i>{'💵 + 🪙'}</i>Sobra: {parseToCurrency(rest)}</h1>
		<h2><i>{'💵'}</i>Cédulas: {parseToCurrency(totalBills)}</h2>
		<h2><i>{'🪙'}</i>Moedas: {parseToCurrency(totalCoins)}</h2>
	</div>
	<botton class="container">
		<p class="onlyprint">{new Date().toLocaleString('pt-BR')}</p>
	</botton>
</div>

<style>
	h1 {
		font-size: 1.6em;
	}

	.container {
		font-family: sans-serif;
		font-size: 0.8em;
		display: flex;
		flex-direction: row;
		flex-flow: wrap;
		justify-content: space-between;
		align-content: space-between;
		padding: 10px 50px;
	}

	.value {
		width: 30%;
		max-width: 100px;
	}

	.total-label {
		width: 25%;
	}

	.bill-quantity {
		width: 25%;
	}

	.total {
		margin-top: 25px;
		padding-right: 70px;
	}

	.total > h1 {
		font-family: sans-serif;
		font-size: 1.6em;
		margin-bottom: 15px;
	}

	.total > h1 > i {
		font-size: 0.7em;
	}

	.total > h2 {
		font-family: sans-serif;
		font-size: 1.2em;
		margin-bottom: 15px;
	}

	header .container {
		padding: 0px;
	}

	.transparent {
		border: none;
		background-color: transparent;
	}

	.onlyprint {
		visibility: hidden;
	}

	.main-content {
		max-width: 1200px;
		margin: 0 auto;
	}

	@media print {
		input {
			border: none;
		}
		.noprint {
			display: none;
		}
		.onlyprint {
			visibility: visible;
		}
		.container {
			break-after: always;
			/* for firefox */
			page-break-after: always;
			/* for webkit */
			-webkit-column-break-after: always;
		}
	}
</style>
