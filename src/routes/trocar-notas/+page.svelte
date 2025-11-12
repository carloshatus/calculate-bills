<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import Storage from '$lib/services/storageService';
	import { type Bill, BillTypes } from '$lib/types/bill';
	import { Icon } from 'svelte-icons-pack';
	import { BsCurrencyExchange } from 'svelte-icons-pack/bs';
	import { BiSolidShareAlt } from 'svelte-icons-pack/bi';
	import { share as shareImage } from '$lib/utils/share';
	import { refreshTime } from '$lib/utils/time';
	import Header from '$lib/components/Header.svelte';
	import BillRow from '$lib/components/BillRow.svelte';
	import Totals from '$lib/components/Totals.svelte';
	const storage = new Storage(browser);

	let mainContent: HTMLElement;
	let availableBills: Bill[] = storage.get<Bill[]>('billsSaved') || [];
	let amount: number | null = storage.get<number>('amountSaved') || null;
	let result: Bill[] = [];
	let total = 0;
	let rest = 0;
	let totalBills = 0;
	let totalCoins = 0;
	let currentDate: string = refreshTime();

	if (amount) {
		exchange();
	}

	setInterval(() => (currentDate = refreshTime()), 1000);

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
				count = Math.ceil(remainingAmount / billValue);
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

<svelte:head>
	<title>Trocar Notas</title>
</svelte:head>

<div class="main-content" bind:this={mainContent}>
	<Header>
		<h1 slot="title">Trocar Notas</h1>
		<div slot="buttons" class="container">
			<button
				class="transparent noprint"
				title="Calculadora"
				on:click={() => {
					goto(base);
				}}
			>
				<Icon src={BsCurrencyExchange} />
			</button>
			<button
				class="transparent noprint"
				title="Compartilhar"
				on:click={() => {
					shareImage(mainContent);
				}}
			>
				<Icon src={BiSolidShareAlt} color="darkblue" />
			</button>
		</div>
	</Header>

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
			<BillRow {bill} readonly={true} index={i} />
		{/each}
	{/if}
	<Totals {total} {totalBills} {totalCoins} {rest} />
	<botton class="container">
		<p class="dateStamp">{currentDate}</p>
	</botton>
</div>
