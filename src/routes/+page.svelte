<script lang="ts">
	enum BillTypes {
		BILL = 'bill',
		COIN = 'coin'
	}

	type Bill = {
		value: number;
		quantity: number | null;
		total: number;
		type: BillTypes;
	};

	let bills: Bill[] = [];
	reset();
	let currentDate = '';
	setInterval(refreshTime, 1000);

	let edit = false;
	let pageName = '';

	let inputs: HTMLInputElement[] = [];
	let pageNameInput: HTMLInputElement;

	$: total = bills.reduce((sum, { total }) => (sum += total), 0);
	$: totalQuantity = bills.reduce((sum, { quantity }) => (sum += quantity || 0), 0);

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

	function reset() {
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
	}

	function parseToCurrency(value: number) {
		return value.toLocaleString('pt-BR', {
			style: 'currency',
			currency: 'BRL'
		});
	}

	function goToNext(e: KeyboardEvent, index: number) {
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

	function changeEdit() {
		edit = !edit;
		if (edit) {
			setInterval(() => {
				pageNameInput.focus();
			}, 1000);
		}
	}
</script>

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
			type="number"
			name="bill-quantity"
			id={`bill-quantity-${i}`}
			class="bill-quantity"
			placeholder="0"
			bind:value={bill.quantity}
			bind:this={inputs[i]}
			on:change={() => (bill.total = (bill.quantity || 0) * bill.value)}
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
<div class="container">
	<p>{currentDate}</p>
	<button
		class="transparent noprint"
		title="Limpar"
		on:click={() => {
			reset();
		}}
	>
		<i>{'🗑️'}</i>
	</button>
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
		padding: 10px;
	}

	.value {
		width: 20vw;
	}

	.total-label {
		width: 25vw;
	}

	.bill-quantity {
		width: 20vw;
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

	header h1,
	.name-page {
		font-family: sans-serif;
		padding: 10px 0px;
		font-size: 1.6em;
	}

	.name-page {
		max-width: 80vw;
	}

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

	@media print {
		.noprint {
			display: none;
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
