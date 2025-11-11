<script lang="ts">
	import { browser } from '$app/environment';

	enum BillTypes {
		BILL = 'bill',
		COIN = 'coin'
	}

	type Bill = {
		value: number;
		quantity: number | null | string;
		total: number;
		type: BillTypes;
	};

	let bills: Bill[] = [];
	let observations: string[] = [];
	let observation = '';
	let currentDate = '';

	let edit = false;
	let pageName = '';

	let inputs: HTMLInputElement[] = [];
	let pageNameInput: HTMLInputElement;

	start();
	setInterval(refreshTime, 1000);

	$: total = bills.reduce((sum, { total }) => (sum += total), 0);
	$: totalQuantity = bills.reduce((sum, { quantity }) => (sum += Number(quantity) || 0), 0);
	$: totalCoins = bills.reduce(
		(sum, { type, total }) => (sum += type === BillTypes.COIN ? total : 0),
		0
	);
	$: totalBills = bills.reduce(
		(sum, { type, total }) => (sum += type === BillTypes.BILL ? total : 0),
		0
	);

	function refreshTime() {
		currentDate = new Date().toLocaleString('pt-BR');
	}

	function start(): void {
		if (browser) {
			const billsFinded = window.localStorage.getItem('billsSaved');
			const observationsFinded = window.localStorage.getItem('observationsSaved');
			if (billsFinded) {
				bills = JSON.parse(billsFinded);
			}
			if (observationsFinded) {
				observations = JSON.parse(observationsFinded);
			}
			window.localStorage.setItem('billsSaved', JSON.stringify(bills));
			window.localStorage.setItem('observationsSaved', JSON.stringify(observations));
		}
		if (!bills.length) {
			reset();
		}
	}

	function reset(): void {
		bills = [
			{ value: 200, quantity: null, total: 0, type: BillTypes.BILL },
			{ value: 100, quantity: null, total: 0, type: BillTypes.BILL },
			{ value: 50, quantity: null, total: 0, type: BillTypes.BILL },
			{ value: 20, quantity: null, total: 0, type: BillTypes.BILL },
			{ value: 10, quantity: null, total: 0, type: BillTypes.BILL },
			{ value: 5, quantity: null, total: 0, type: BillTypes.BILL },
			{ value: 2, quantity: null, total: 0, type: BillTypes.BILL },
			{ value: 1, quantity: null, total: 0, type: BillTypes.COIN },
			{ value: 0.5, quantity: null, total: 0, type: BillTypes.COIN },
			{ value: 0.25, quantity: null, total: 0, type: BillTypes.COIN },
			{ value: 0.1, quantity: null, total: 0, type: BillTypes.COIN },
			{ value: 0.05, quantity: null, total: 0, type: BillTypes.COIN },
			{ value: 0.01, quantity: null, total: 0, type: BillTypes.COIN }
		];
		observations = [];
		updateBills();
	}

	function getValueExpr(expr: number | null | string): number {
		try {
			const value = eval(String(expr));
			return value ? Number(value) : 0;
		} catch (e) {
			return 0;
		}
	}

	function updateBills(): void {
		bills = bills.map((bill) => {
			bill.quantity = String(bill.quantity).replaceAll(/[^0-9\+\-\*\/]/g, '');
			const value = getValueExpr(bill.quantity);
			const quantity = Number(value);
			if (!isNaN(quantity)) {
				bill.total = quantity * bill.value;
			}
			return bill;
		});
		if (browser) {
			window.localStorage.setItem('billsSaved', JSON.stringify(bills));
		}
	}

	function parseToCurrency(value: number): string {
		return value.toLocaleString('pt-BR', {
			style: 'currency',
			currency: 'BRL'
		});
	}

	function goToNext(e: KeyboardEvent, index: number): void {
		const { key } = e;
		if (['Enter', 'ArrowDown', 'ArrowUp'].includes(key)) {
			e.preventDefault();
		}
		if ((key === 'Enter' || key === 'ArrowDown') && index < inputs.length - 1) {
			inputs[index + 1].focus();
		}
		if (key === 'ArrowUp' && index > 0) {
			inputs[index - 1].focus();
		}
	}

	function goToConfirm(e: KeyboardEvent): void {
		const { key } = e;
		if (['Enter', 'ArrowDown', 'ArrowUp'].includes(key)) {
			e.preventDefault();
		}
		if (key === 'Enter') {
			addObs();
		}
	}

	function changeEdit(): void {
		edit = !edit;
		if (edit) {
			setInterval(() => {
				pageNameInput.focus();
			}, 1000);
		}
	}

	function addObs(): void {
		if (observation) {
			observations = [...observations, observation];
			observation = '';
			if (browser) {
				window.localStorage.setItem('observationsSaved', JSON.stringify(observations));
			}
		}
	}

	function clear(index: number): void {
		if (index >= 0) {
			observations.splice(index, 1);
			observations = observations;
			window.localStorage.setItem('observationsSaved', JSON.stringify(observations));
		}
	}
</script>

<svelte:head>
	<title>{`${pageName || 'Calculadora de cédulas'} ${currentDate}`}</title>
</svelte:head>

<div class="main-content">
	<header class="container">
		<div class="container">
			<button
				class="transparent noprint"
				title="Editar nome"
				on:click={() => {
					changeEdit();
				}}
			>
				<i>{edit ? '💾' : '✏️'}</i>
			</button>
			{#if edit}
				<input
					type="text"
					class="name-page"
					name="name-page"
					placeholder={pageName}
					bind:value={pageName}
					bind:this={pageNameInput}
				/>
			{:else}
				<h1>{pageName || 'Calculadora de cédulas'}</h1>
			{/if}
		</div>
		<div class="container">
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
	<div class="container" />
	{#each bills as bill, i}
		<div class="container">
			<label class="value" for={`bill-quantity-${i}`}>
				<i>{bill.type === BillTypes.COIN ? '🪙' : '💵'}</i>
				{parseToCurrency(bill.value)}
			</label>
			<input
				type="text"
				inputmode="numeric"
				name="bill-quantity"
				id={`bill-quantity-${i}`}
				class="bill-quantity"
				placeholder="0"
				bind:value={bill.quantity}
				bind:this={inputs[i]}
				on:keyup={() => updateBills()}
				on:change={() => updateBills()}
				on:keydown={(e) => goToNext(e, i)}
			/>
			<label class="total-label" for={`bill-quantity-${i}`}>{parseToCurrency(bill.total)}</label>
		</div>
	{/each}
	<div class="container total">
		<h1><i>{'💵 + 🪙'}</i>Total: {parseToCurrency(total)}</h1>
		<h2><i>{'💵 + 🪙 #'}</i>Total: {totalQuantity}</h2>
		<h2><i>{'💵'}</i>Cédulas: {parseToCurrency(totalBills)}</h2>
		<h2><i>{'🪙'}</i>Moedas: {parseToCurrency(totalCoins)}</h2>
	</div>
	<div class="observations container">
		{#each observations as observation, i}
			<div class="side-button container">
				<button
					class="transparent noprint"
					title="Limpar"
					on:click={() => {
						clear(i);
					}}
				>
					<i>{'🗑️'}</i>
				</button>
				<h2>{`${i + 1}. ${observation}`}</h2>
			</div>
		{/each}
	</div>
	<div class="container">
		<input
			type="text"
			name="obs"
			id="obs"
			class="noprint observation"
			placeholder="Observação"
			bind:value={observation}
			on:keydown={(e) => goToConfirm(e)}
		/>
		<button class="noprint" title="Adicionar" on:click={() => addObs()}>
			<i>{'➕'}</i>
		</button>
	</div>

	<botton class="container">
		<p class="onlyprint">{currentDate}</p>
		<button
			class="transparent noprint"
			title="Limpar"
			on:click={() => {
				reset();
			}}
		>
			<i>{'🗑️'}</i>
		</button>
	</botton>
</div>

<style>
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
		width: 25%;
		max-width: 100px;
	}

	.total-label {
		width: 25%;
	}

	.bill-quantity {
		min-width: 40%;
		width: auto;
	}

	.total {
		margin-top: 25px;
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

	.observations h2 {
		font-family: sans-serif;
		font-size: 1.2em;
	}

	header h1,
	.name-page {
		font-family: sans-serif;
		padding: 10px 0px;
		font-size: 1.6em;
	}

	.name-page {
		max-width: 80em;
	}

	botton button,
	header button {
		padding: 15px;
	}

	header .container {
		padding: 0px;
	}

	.transparent {
		border: none;
		background-color: transparent;
	}

	.observation {
		width: 80%;
	}

	.observations {
		justify-content: flex-start;
	}

	.observations > div {
		flex-grow: 1;
	}

	.side-button {
		justify-content: flex-start;
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
