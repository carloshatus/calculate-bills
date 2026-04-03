<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import Storage from '$lib/services/storageService';
	import { type SavedCalculation, BillTypes } from '$lib/types/bill';
	import { Icon } from 'svelte-icons-pack';
	import { BsArrowLeft } from 'svelte-icons-pack/bs';
	import { BiSolidShareAlt } from 'svelte-icons-pack/bi';
	import { share as shareImage } from '$lib/utils/share';
	import Header from '$lib/components/Header.svelte';
	import BillRow from '$lib/components/BillRow.svelte';
	import Totals from '$lib/components/Totals.svelte';

	const storage = new Storage(browser);
	let calculation: SavedCalculation | null = null;
	let mainContent: HTMLElement;

	onMount(() => {
		const id = $page.params.id;
		const history = storage.get<SavedCalculation[]>('history') || [];
		calculation = history.find((c) => c.id === id) || null;

		if (!calculation) {
			alert('Contagem não encontrada.');
			goto(`${base}/historico`);
		}
	});

	$: totalBills = calculation?.bills.reduce((sum, { type, total }) => (sum += type === BillTypes.BILL ? total : 0), 0) || 0;
	$: totalCoins = calculation?.bills.reduce((sum, { type, total }) => (sum += type === BillTypes.COIN ? total : 0), 0) || 0;
	$: totalQuantity = calculation?.bills.reduce((sum, { quantity }) => (sum += Number(quantity) || 0), 0) || 0;

</script>

<svelte:head>
	<title>{calculation ? `Visualizando: ${calculation.name}` : 'Carregando...'}</title>
</svelte:head>

{#if calculation}
<div class="main-content" bind:this={mainContent}>
	<Header>
		<div slot="title" class="container">
			<button
				class="transparent noprint"
				title="Voltar"
				on:click={() => {
					goto(`${base}/historico`);
				}}
			>
				<Icon src={BsArrowLeft} />
			</button>
			<h1>{calculation.name}</h1>
		</div>
		<div slot="buttons" class="container">
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

	<div class="info-container noprint">
		<p><strong>Data:</strong> {new Date(calculation.date).toLocaleString('pt-BR')}</p>
	</div>

	{#each calculation.bills as bill, i}
		{#if Number(bill.quantity) > 0}
			<BillRow {bill} readonly={true} index={i} />
		{/if}
	{/each}

	<Totals total={calculation.total} {totalBills} {totalCoins} {totalQuantity} />

	{#if calculation.observations.length > 0}
		<div class="observations container">
			{#each calculation.observations as observation, i}
				<div class="side-button container">
					<h2>{`${i + 1}. ${observation}`}</h2>
				</div>
			{/each}
		</div>
	{/if}

	<div class="container onlyprint">
		<p class="dateStamp">{new Date(calculation.date).toLocaleString('pt-BR')}</p>
	</div>
</div>
{:else}
<div class="main-content">
	<p>Carregando...</p>
</div>
{/if}

<style>
	.info-container {
		padding: 0.5rem 1rem;
		border-bottom: 1px solid #eee;
		margin-bottom: 1rem;
	}
	
	.info-container p {
		margin: 0;
		font-size: 0.9rem;
		color: #666;
	}

	@media print {
		.noprint {
			display: none;
		}
		.onlyprint {
			display: block;
		}
	}

	.onlyprint {
		display: none;
	}
</style>
