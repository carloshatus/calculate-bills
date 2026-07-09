<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import Storage from '$lib/services/storageService';
	import * as historyService from '$lib/services/historyService';
	import { BillTypes, type SavedCalculation } from '$lib/types/bill';
	import { Icon } from 'svelte-icons-pack';
	import { BsArrowLeft, BsArrowCounterclockwise, BsDownload } from 'svelte-icons-pack/bs';
	import { BiSolidShareAlt } from 'svelte-icons-pack/bi';
	import { share as shareImage, download as downloadImage } from '$lib/utils/share';
	import { formatDate } from '$lib/utils/time';
	import { parseToCurrency } from '$lib/utils/currency';
	import Header from '$lib/components/Header.svelte';
	import BillRow from '$lib/components/BillRow.svelte';
	import Totals from '$lib/components/Totals.svelte';
	import Modal from '$lib/components/Modal.svelte';

	const storage = new Storage(browser);
	let calculation: SavedCalculation | null = null;
	let mainContent: HTMLElement;

	let modalConfig = {
		show: false,
		title: '',
		message: '',
		type: 'info' as 'info' | 'danger' | 'success',
		confirmText: 'Confirmar',
		cancelText: 'Cancelar',
		showCancel: true,
		extraActionText: '',
		onConfirm: () => {
			/* noop */
		},
		onExtraAction: () => {
			/* noop */
		}
	};

	function openModal(config: Partial<typeof modalConfig>) {
		modalConfig = {
			...modalConfig,
			show: true,
			type: 'info',
			confirmText: 'Confirmar',
			onConfirm: () => {
				/* noop */
			},
			...config
		};
	}

	onMount(() => {
		const id = $page.params.id;
		const history = historyService.getHistory(storage);
		calculation = history.find((c) => c.id === id) || null;

		if (!calculation) {
			openModal({
				title: 'Erro',
				message: 'Contagem não encontrada no seu histórico.',
				type: 'danger',
				onConfirm: () => goto(`${base}/historico`)
			});
		}
	});

	function restoreCalculation() {
		if (!calculation) return;
		const calc = calculation;

		openModal({
			title: 'Restaurar contagem?',
			message:
				'Deseja restaurar esta contagem? Isso sobrescreverá a contagem atual da calculadora.',
			type: 'info',
			confirmText: 'Restaurar sem salvar',
			extraActionText: 'Salvar atual e Restaurar',
			onConfirm: () => {
				historyService.restore(storage, calc);
				goto(`${base}/`);
			},
			onExtraAction: () => {
				historyService.saveCurrentAndRestore(storage, calc);
				goto(`${base}/`);
			}
		});
	}

	$: totalBills =
		calculation?.bills.reduce(
			(sum, { type, total }) => (sum += type === BillTypes.BILL ? total : 0),
			0
		) || 0;
	$: totalCoins =
		calculation?.bills.reduce(
			(sum, { type, total }) => (sum += type === BillTypes.COIN ? total : 0),
			0
		) || 0;
	$: totalQuantity =
		calculation?.bills.reduce((sum, { quantity }) => (sum += Number(quantity) || 0), 0) || 0;
</script>

<svelte:head>
	<title>{calculation ? `Visualizando: ${calculation.name}` : 'Carregando...'}</title>
</svelte:head>

{#if calculation}
	<div class="main-content" bind:this={mainContent}>
		<Header>
			<div slot="title" class="title-container">
				<div class="header-left">
					<button class="back-btn" title="Voltar" on:click={() => goto(`${base}/historico`)}>
						<Icon src={BsArrowLeft} />
					</button>
					<h1>{calculation.name}</h1>
				</div>
				<div class="dates-container">
					{#if calculation.createdAt}
						<p class="dateStamp">Criado: {formatDate(calculation.createdAt)}</p>
					{/if}
					<p class="dateStamp">Salvo: {formatDate(calculation.date)}</p>
				</div>
			</div>
			<div slot="buttons">
				<button class="action-btn restore" title="Restaurar" on:click={restoreCalculation}>
					<Icon src={BsArrowCounterclockwise} />
					<span>Restaurar</span>
				</button>
				<button
					class="action-btn share"
					title="Compartilhar"
					on:click={() =>
						shareImage(
							mainContent,
							`Histórico: ${calculation?.name || 'Contagem'}`,
							'Confira esta contagem salva no meu histórico!'
						)}
				>
					<Icon src={BiSolidShareAlt} />
					<span>Compartilhar</span>
				</button>
				<button
					class="action-btn download"
					title="Baixar Imagem"
					on:click={() =>
						downloadImage(
							mainContent,
							(calculation?.name ? calculation.name.replace(/\s+/g, '-').toLowerCase() : 'contagem') + '.png'
						)}
				>
					<Icon src={BsDownload} />
					<span>Baixar Imagem</span>
				</button>
			</div>
		</Header>

		<div class="bills-list">
			{#each calculation.bills as bill, i}
				{#if Number(bill.quantity) > 0}
					<BillRow {bill} readonly={true} index={i} />
				{/if}
			{/each}
		</div>

		<Totals total={calculation.total} {totalBills} {totalCoins} {totalQuantity} />

		{#if calculation.exchangeAmount}
			<div class="card exchange-section">
				<div class="section-header">
					<h2>Troca Registrada</h2>
				</div>
				<div class="exchange-info-container">
					<div class="exchange-info">
						<span class="info-label">Valor solicitado:</span>
						<span class="amount-value">{parseToCurrency(calculation.exchangeAmount)}</span>
					</div>
					{#if calculation.exchangeRest !== undefined && calculation.exchangeRest !== null}
						<div class="exchange-info rest-info">
							<span class="info-label">Sobra (resto):</span>
							<span class="amount-value rest-value">{parseToCurrency(calculation.exchangeRest)}</span>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		{#if calculation.observations.length > 0}
			<div class="card observations-section">
				<div class="section-header">
					<h2>Observações</h2>
				</div>
				<div class="obs-list">
					{#each calculation.observations as obs}
						<div class="obs-item">
							<span class="obs-text">{obs}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<footer class="onlyprint footer-print">
			<p>Contagem gerada em: {new Date(calculation.date).toLocaleString('pt-BR')}</p>
		</footer>

		<Modal
			bind:show={modalConfig.show}
			title={modalConfig.title}
			message={modalConfig.message}
			type={modalConfig.type}
			confirmText={modalConfig.confirmText}
			cancelText={modalConfig.cancelText}
			extraActionText={modalConfig.extraActionText}
			showCancel={modalConfig.showCancel}
			onConfirm={modalConfig.onConfirm}
			onExtraAction={modalConfig.onExtraAction}
		/>
	</div>
{:else}
	<div class="main-content loading-state">
		<div class="loader" />
		<p>Carregando contagem...</p>
	</div>
{/if}

<style>
	.title-container {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.dates-container {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		margin-top: 0.2rem;
	}

	.bills-list {
		padding: var(--padding);
	}

	.observations-section,
	.exchange-section {
		margin: var(--padding);
		padding: 1rem;
	}

	.section-header {
		margin-bottom: 1rem;
	}

	.exchange-info-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.exchange-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background: var(--bg);
		border-radius: 8px;
	}

	.rest-info {
		background: var(--warning-light, #fff3cd);
		border: 1px solid var(--warning, #ffc107);
	}

	.exchange-info .info-label {
		color: var(--text-muted);
		font-weight: 600;
	}

	.exchange-info .amount-value {
		font-weight: 700;
		color: var(--primary);
		font-size: 1.1rem;
	}

	.rest-info .info-label {
		color: #856404;
	}

	.rest-info .rest-value {
		color: #856404;
	}

	.obs-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.obs-item {
		padding: 0.75rem;
		background: var(--bg);
		border-radius: 8px;
		font-size: 0.95rem;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 60vh;
		color: var(--text-muted);
	}

	.loader {
		width: 40px;
		height: 40px;
		border: 4px solid var(--border);
		border-top-color: var(--primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.action-btn.share {
		color: #4f46e5;
	}

	.action-btn.restore {
		color: var(--success);
	}

	.footer-print {
		padding: 2rem;
		text-align: center;
		border-top: 1px solid #eee;
		margin-top: 2rem;
	}
</style>
