<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import Storage from '$lib/services/storageService';
	import { type Bill, BillTypes } from '$lib/types/bill';
	import { Icon } from 'svelte-icons-pack';
	import { BsCurrencyExchange, BsPlusCircleFill, BsPencil, BsSave } from 'svelte-icons-pack/bs';
	import { BiSolidShareAlt } from 'svelte-icons-pack/bi';
	import { AiOutlineClear, AiOutlineDelete } from 'svelte-icons-pack/ai';
	import { share as shareImage } from '$lib/utils/share';
	import Header from '$lib/components/Header.svelte';
	import BillRow from '$lib/components/BillRow.svelte';
	import Totals from '$lib/components/Totals.svelte';

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
			bill.quantity = String(bill.quantity).replaceAll(/[^0-9+\-*/]/g, '');
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
	<Header>
		<div slot="title" class="container">
			<button
				class="transparent noprint"
				title="Editar nome"
				on:click={() => {
					changeEdit();
				}}
			>
				<Icon src={edit ? BsSave : BsPencil} />
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
		<div slot="buttons" class="container">
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
					shareImage(mainContent);
				}}
			>
				<Icon src={BiSolidShareAlt} color="darkblue" />
			</button>
		</div>
	</Header>
	{#each bills as bill, i}
		<BillRow {bill} index={i}>
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
		</BillRow>
	{/each}
	<Totals {total} {totalBills} {totalCoins} {totalQuantity} />
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
					<Icon src={AiOutlineDelete} />
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
		<button class="transparent noprint" title="Adicionar" on:click={() => addObs()}>
			<Icon src={BsPlusCircleFill} />
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
			<Icon src={AiOutlineClear} color="darkred" />
		</button>
	</botton>
</div>
