<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import Storage from '$lib/services/storageService';
	import { type Bill, BillTypes } from '$lib/types/bill';
	import { parseToCurrency } from '$lib/utils/currency';
	import html2canvas from 'html2canvas';
	import { Icon } from 'svelte-icons-pack';
	import { BsCurrencyExchange } from 'svelte-icons-pack/bs';
	import { BiSolidShareAlt } from 'svelte-icons-pack/bi';

	const storage = new Storage(browser);

	let bills: Bill[] = [];
	let observations: string[] = [];
	let observation = '';
	let currentDate = '';
	let mainContent: HTMLElement;

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

	function refreshTime() {
		currentDate = new Date().toLocaleString('pt-BR');
	}

	function start(): void {
		const billsFound = storage.get<Bill[]>('billsSaved');
		const observationsFound = storage.get<string[]>('observationsSaved');
		if (billsFound) {
			bills = billsFound;
		}
		if (observationsFound) {
			observations = observationsFound;
		}
		storage.save('bills', bills);
		storage.save('observations', observations);
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
		storage.save('billsSaved', bills);
		storage.save('observationsSaved', observations);

		storage.delete('amountSaved');
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
		storage.save('billsSaved', bills);
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
			setTimeout(() => {
				pageNameInput.focus();
			}, 100);
		}
	}

	function addObs(): void {
		if (observation) {
			observations = [...observations, observation];
			observation = '';
			storage.save('observationsSaved', observations);
		}
	}

	function clear(index: number): void {
		if (index >= 0) {
			observations.splice(index, 1);
			observations = observations;
			storage.save('observationsSaved', observations);
		}
	}
</script>

<svelte:head>
	<title>{`${pageName || 'Calculadora de cédulas'} ${currentDate}`}</title>
</svelte:head>

<div class="main-content" bind:this={mainContent}>
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
				title="Trocar Notas"
				on:click={() => {
					goto(`${base}/trocar-notas`);
				}}
			>
				<Icon src={BsCurrencyExchange} />
			</button>
			<button
				class="transparent noprint"
				title="Compartilhar"
				on:click={() => {
					share();
				}}
			>
				<Icon src={BiSolidShareAlt} />
			</button>
		</div>
	</header>
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
		<h2><i>{'💵'}</i>Cédulas: {parseToCurrency(totalBills)}</h2>
		<h2><i>{'🪙'}</i>Moedas: {parseToCurrency(totalCoins)}</h2>
		<h2><i>{'💵 + 🪙 #'}</i>Total: {totalQuantity}</h2>
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
