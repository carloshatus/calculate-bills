<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import Storage from '$lib/services/storageService';
	import { type Bill, BillTypes } from '$lib/types/bill';
	import { parseToCurrency } from '$lib/utils/currency';
	import html2canvas from 'html2canvas';

	const storage = new Storage(browser);

	let mainContent: HTMLElement;
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

	async function share(): Promise<void> {
		const canvas = await html2canvas(mainContent);
		canvas.toBlob(async (blob) => {
			if (!blob) {
				return;
			}
			if (navigator.share) {
				const file = new File([blob], 'calculadora-de-cedulas.png', { type: 'image/png' });
				await navigator.share({
					files: [file],
					title: 'Calculadora de Cédulas',
					text: 'Confira o cálculo'
				});
			} else {
				const a = document.createElement('a');
				a.href = URL.createObjectURL(blob);
				a.download = 'calculadora-de-cedulas.png';
				a.click();
			}
		});
	}
</script>

<div class="main-content" bind:this={mainContent}>
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
				title="Compartilhar"
				on:click={() => {
					share();
				}}
			>
				<i>{'🔗'}</i>
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
