<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import Storage from '$lib/services/storageService';
	import { type Bill, BillTypes } from '$lib/types/bill';
	import { Icon } from 'svelte-icons-pack';
	import { BsArrowLeft, BsDownload } from 'svelte-icons-pack/bs';
	import { BiSolidShareAlt } from 'svelte-icons-pack/bi';
	import { share as shareImage, download as downloadImage } from '$lib/utils/share';
	import { refreshTime } from '$lib/utils/time';
	import Header from '$lib/components/Header.svelte';
	import BillRow from '$lib/components/BillRow.svelte';
	import Totals from '$lib/components/Totals.svelte';
	import { parseToCurrency } from '$lib/utils/currency';
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
	$: totalAvailable = availableBills
		.filter((bill) => bill.value <= 20)
		.reduce((sum, bill) => sum + (Number(bill.quantity) || 0) * bill.value, 0);

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
					type: bill.type,
					originalQuantity: billQuantity
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
		<div slot="title" class="title-container">
			<div class="header-left">
				<button class="back-btn" title="Voltar" on:click={() => goto(base)}>
					<Icon src={BsArrowLeft} />
				</button>
				<h1>Trocar Notas</h1>
			</div>
			<p class="dateStamp">{currentDate.split(' ')[1]}</p>
		</div>

		<div slot="buttons">
			<button
				class="action-btn share"
				title="Compartilhar"
				on:click={() =>
					shareImage(
						mainContent,
						'Sugestão de Troca de Notas',
						`Confira esta sugestão de troca no valor de ${parseToCurrency(amount || 0)}`
					)}
			>
				<Icon src={BiSolidShareAlt} />
				<span>Compartilhar</span>
			</button>
			<button
				class="action-btn download"
				title="Baixar Imagem"
				on:click={() => downloadImage(mainContent, 'sugestao-troca-notas.png')}
			>
				<Icon src={BsDownload} />
				<span>Baixar Imagem</span>
			</button>
		</div>
	</Header>

	<div class="card exchange-input-section">
		<div class="container input-group">
			<div class="field">
				<label for="amount">Valor para trocar</label>
				<div class="input-with-button">
					<input
						type="number"
						id="amount"
						inputmode="decimal"
						placeholder="0,00"
						bind:value={amount}
						on:change={() => storage.save('amountSaved', amount)}
						on:keydown={(e) => enterAction(e)}
					/>
					<button class="primary-btn" on:click={exchange}>Trocar</button>
				</div>
			</div>
		</div>
		<div class="available-info-row">
			<span class="info-label">Disponível para troca:</span>
			<span class="info-value">{parseToCurrency(totalAvailable)}</span>
		</div>
	</div>

	{#if result.length > 0}
		<div class="results-header">
			<h2>Resultado da Troca</h2>
		</div>
		<div class="bills-list">
			{#each result as bill, i}
				<BillRow {bill} readonly={true} index={i} originalQuantity={bill.originalQuantity} />
			{/each}
		</div>
		<Totals {total} {totalBills} {totalCoins} {rest} />
	{:else if amount && amount > 0}
		<div class="empty-state card">
			<p>Não há notas suficientes para realizar esta troca.</p>
		</div>
	{/if}

	<footer class="onlyprint footer-print">
		<p>Troca gerada em: {currentDate}</p>
	</footer>
</div>

<style>
	.title-container {
		display: flex;
		flex-direction: column;
	}

	.exchange-input-section {
		margin: var(--padding);
		padding-top: 0.5rem;
	}

	.input-group {
		flex-direction: column;
		align-items: stretch;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.field label {
		font-weight: 600;
		color: var(--text-muted);
		font-size: 0.85rem;
		text-transform: uppercase;
	}

	.input-with-button {
		display: flex;
		gap: 0.5rem;
	}

	.primary-btn {
		background: var(--primary);
		color: white;
		padding: 0 1.5rem;
		font-weight: 600;
	}

	.available-info-row {
		padding: 1rem var(--padding);
		border-top: 1px solid var(--border);
		display: flex;
		justify-content: space-between;
		background: var(--primary-light);
		border-bottom-left-radius: var(--radius);
		border-bottom-right-radius: var(--radius);
	}

	.info-label {
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.info-value {
		font-weight: 700;
		color: var(--primary);
	}

	.results-header {
		padding: 0.5rem var(--padding);
	}

	.bills-list {
		padding: 0 var(--padding);
	}

	.empty-state {
		margin: var(--padding);
		padding: 2rem;
		text-align: center;
		color: var(--text-muted);
	}

	.action-btn.share {
		color: #4f46e5;
	}

	.footer-print {
		padding: 2rem;
		text-align: center;
		border-top: 1px solid #eee;
		margin-top: 2rem;
	}
</style>
