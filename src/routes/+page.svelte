<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import Storage from '$lib/services/storageService';
	import * as historyService from '$lib/services/historyService';
	import { type Bill, BillTypes } from '$lib/types/bill';
	import { Icon } from 'svelte-icons-pack';
	import {
		BsCurrencyExchange,
		BsPlusCircleFill,
		BsCardList,
		BsCheckLg,
		BsXLg,
		BsInfoCircleFill,
		BsDownload
	} from 'svelte-icons-pack/bs';
	import { BiSolidShareAlt, BiSolidCloudDownload } from 'svelte-icons-pack/bi';
	import { AiOutlineClear, AiOutlineDelete } from 'svelte-icons-pack/ai';
	import { share as shareImage, download as downloadImage } from '$lib/utils/share';
	import { refreshTime } from '$lib/utils/time';
	import Header from '$lib/components/Header.svelte';
	import BillRow from '$lib/components/BillRow.svelte';
	import Totals from '$lib/components/Totals.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { onMount } from 'svelte';

	const storage = new Storage(browser);

	let bills: Bill[] = [];
	let observations: string[] = [];
	let observation = '';
	let currentDate: string = refreshTime();
	let mainContent: HTMLElement;
	let isReady = false;

	let modalConfig = {
		show: false,
		title: '',
		message: '',
		type: 'info' as 'info' | 'danger' | 'success',
		confirmText: 'Confirmar',
		cancelText: 'Cancelar',
		extraActionText: '',
		linkText: '',
		linkUrl: '',
		showCancel: true,
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
			showCancel: true,
			type: 'info',
			confirmText: 'Confirmar',
			cancelText: 'Cancelar',
			extraActionText: '',
			linkText: '',
			linkUrl: '',
			onConfirm: () => {
				/* noop */
			},
			onExtraAction: () => {
				/* noop */
			},
			...config
		};
	}

	let edit = false;
	let pageName = '';
	let tempName = '';

	let inputs: HTMLInputElement[] = [];
	let pageNameInput: HTMLInputElement;

	onMount(() => {
		isReady = true;
		start();
	});

	setInterval(() => (currentDate = refreshTime()), 1000);

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

	function start(): void {
		const billsFound = storage.get<Bill[]>('billsSaved');
		const observationsFound = storage.get<string[]>('observationsSaved');
		const pageNameFound = storage.get<string>('pageName');
		if (billsFound) {
			bills = billsFound;
		}
		if (observationsFound) {
			observations = observationsFound;
		}
		if (pageNameFound) {
			pageName = pageNameFound;
		}
		if (!bills.length) {
			reset();
		}
	}

	function handleReset(): void {
		openModal({
			title: 'Limpar tudo?',
			message: 'Deseja salvar esta contagem no histórico antes de limpar tudo?',
			type: 'danger',
			confirmText: 'Limpar sem salvar',
			cancelText: 'Cancelar',
			extraActionText: 'Salvar e Limpar',
			onConfirm: reset,
			onExtraAction: saveAndReset
		});
	}

	function handleAbout(): void {
		openModal({
			title: 'Sobre o Aplicativo',
			message:
				'Calculadora de Cédulas v2.0\n\nDesenvolvido com SvelteKit por Carlos Hatus. Uma ferramenta rápida, segura e profissional para gerenciamento de contagens físicas.',
			type: 'info',
			confirmText: 'Entendido',
			showCancel: false,
			linkText: 'Ver outros projetos',
			linkUrl: 'https://carloshatus.github.io/'
		});
	}

	function saveAndReset(): void {
		saveCurrentCalculation(true);
		reset();
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
		pageName = '';
		storage.save('billsSaved', bills);
		storage.save('observationsSaved', observations);
		storage.delete('pageName');
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
			if (!isNaN(value)) {
				bill.total = value * bill.value;
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
		if (e.key === 'Enter') {
			e.preventDefault();
			addObs();
		}
	}

	function changeEdit(): void {
		tempName = pageName;
		edit = true;
		setTimeout(() => {
			pageNameInput?.focus();
		}, 100);
	}

	function confirmEdit(): void {
		pageName = tempName;
		edit = false;
		storage.save('pageName', pageName);
	}

	function cancelEdit(): void {
		edit = false;
	}

	function addObs(): void {
		if (observation) {
			observations = [...observations, observation];
			observation = '';
			storage.save('observationsSaved', observations);
		}
	}

	function clear(index: number): void {
		observations = observations.filter((_, i) => i !== index);
		storage.save('observationsSaved', observations);
	}

	function saveCurrentCalculation(silent = false): void {
		const newCalc = historyService.createSavedCalculation(bills, observations, pageName, total);
		historyService.saveToHistory(storage, newCalc);

		if (!silent) {
			openModal({
				title: 'Salvo!',
				message: 'Cálculo salvo no seu histórico com sucesso.',
				type: 'success',
				showCancel: false,
				confirmText: 'Entendido'
			});
		}
	}
</script>

<svelte:head>
	<title>{`${pageName || 'Calculadora de cédulas'}`}</title>
</svelte:head>

<div class="main-content" bind:this={mainContent} data-ready={isReady}>
	<Header>
		<div slot="title" class="title-container" class:editing={edit}>
			{#if edit}
				<div class="edit-title-group">
					<input
						type="text"
						class="page-title-input"
						placeholder="Nome do cálculo"
						bind:value={tempName}
						bind:this={pageNameInput}
						on:keydown={(e) => e.key === 'Enter' && confirmEdit()}
					/>
					<div class="edit-title-actions">
						<button class="confirm-btn-title" on:click={confirmEdit} aria-label="Confirmar">
							<Icon src={BsCheckLg} />
						</button>
						<button class="cancel-btn-title" on:click={cancelEdit} aria-label="Cancelar">
							<Icon src={BsXLg} />
						</button>
					</div>
				</div>
			{:else}
				<button class="title-btn" on:click={changeEdit} aria-label="Editar nome">
					<h1>{pageName || 'Calculadora'}</h1>
				</button>
			{/if}
			<p class="dateStamp">{currentDate.split(' ')[1]}</p>
		</div>

		<div slot="buttons">
			<button class="action-btn" title="Trocar Notas" on:click={() => goto(`${base}/trocar-notas`)}>
				<Icon src={BsCurrencyExchange} />
				<span>Trocar Notas</span>
			</button>
			<button
				class="action-btn save"
				title="Salvar Cálculo"
				on:click={() => saveCurrentCalculation()}
			>
				<Icon src={BiSolidCloudDownload} />
				<span>Salvar Cálculo</span>
			</button>
			<button
				class="action-btn history"
				title="Ver Histórico"
				on:click={() => goto(`${base}/historico`)}
			>
				<Icon src={BsCardList} />
				<span>Ver Histórico</span>
			</button>
			<button
				class="action-btn share"
				title="Compartilhar"
				on:click={() =>
					shareImage(
						mainContent,
						pageName || 'Minha Contagem',
						'Confira esta contagem de cédulas!'
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
						(pageName ? pageName.replace(/\s+/g, '-').toLowerCase() : 'contagem') + '.png'
					)}
			>
				<Icon src={BsDownload} />
				<span>Baixar Imagem</span>
			</button>
			<button class="action-btn" title="Sobre" on:click={handleAbout}>
				<Icon src={BsInfoCircleFill} />
				<span>Sobre</span>
			</button>
			<div class="menu-separator" />
			<button class="action-btn reset" title="Limpar tudo" on:click={handleReset}>
				<Icon src={AiOutlineClear} />
				<span>Limpar Tudo</span>
			</button>
		</div>
	</Header>

	<div class="bills-list">
		{#each bills as bill, i}
			<BillRow {bill} index={i}>
				<input
					type="text"
					inputmode="numeric"
					name="bill-quantity"
					id={`bill-quantity-${i}`}
					class="bill-quantity-input"
					placeholder="0"
					bind:value={bill.quantity}
					bind:this={inputs[i]}
					on:input={() => updateBills()}
					on:keydown={(e) => goToNext(e, i)}
				/>
			</BillRow>
		{/each}
	</div>

	<Totals {total} {totalBills} {totalCoins} {totalQuantity} />

	<div class="card observations-section" class:noprint={observations.length === 0}>
		<div class="section-header">
			<h2>Observações</h2>
		</div>

		<div class="obs-input-group noprint">
			<input
				type="text"
				placeholder="Adicionar observação..."
				bind:value={observation}
				on:keydown={(e) => goToConfirm(e)}
			/>
			<button class="add-obs-btn" on:click={addObs}>
				<Icon src={BsPlusCircleFill} />
			</button>
		</div>

		{#if observations.length > 0}
			<div class="obs-list">
				{#each observations as obs, i}
					<div class="obs-item">
						<span class="obs-text">{obs}</span>
						<button class="delete-obs noprint" on:click={() => clear(i)}>
							<Icon src={AiOutlineDelete} />
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<footer class="onlyprint footer-print">
		<p>Gerado em: {currentDate}</p>
	</footer>

	<Modal
		bind:show={modalConfig.show}
		title={modalConfig.title}
		message={modalConfig.message}
		type={modalConfig.type}
		confirmText={modalConfig.confirmText}
		cancelText={modalConfig.cancelText}
		extraActionText={modalConfig.extraActionText}
		linkText={modalConfig.linkText}
		linkUrl={modalConfig.linkUrl}
		showCancel={modalConfig.showCancel}
		onConfirm={modalConfig.onConfirm}
		onExtraAction={modalConfig.onExtraAction}
	/>
</div>

<style>
	.title-btn {
		background: transparent !important;
		padding: 0 !important;
		margin: 0 !important;
		text-align: left;
		cursor: pointer;
		display: block;
		width: fit-content;
	}

	.title-btn:hover h1 {
		color: var(--primary);
	}

	.title-container {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.edit-title-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
	}

	.edit-title-actions {
		display: flex;
		gap: 0.25rem;
	}

	.confirm-btn-title {
		background: var(--success) !important;
		color: white !important;
		width: 32px;
		height: 32px;
		border-radius: 8px !important;
		font-size: 0.9rem !important;
	}

	.cancel-btn-title {
		background: var(--border) !important;
		color: var(--text-muted) !important;
		width: 32px;
		height: 32px;
		border-radius: 8px !important;
		font-size: 0.9rem !important;
	}

	.page-title-input {
		font-size: 1.1rem !important;
		font-weight: 700 !important;
		padding: 0.4rem 0.6rem !important;
		border: 1px solid var(--primary) !important;
		background: var(--primary-light) !important;
		flex: 1;
		min-width: 0;
	}

	.bills-list {
		padding: var(--padding);
	}

	.bill-quantity-input {
		text-align: center;
		font-weight: 700;
		font-size: 1.2rem !important;
		width: 80px !important;
		padding: 0.4rem !important;
		border: 2px solid var(--border) !important;
	}

	.bill-quantity-input:focus {
		border-color: var(--primary) !important;
		background: var(--primary-light) !important;
	}

	.observations-section {
		margin: var(--padding);
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		background: var(--surface);
	}

	.section-header h2 {
		font-size: 1.1rem;
		color: var(--text-main);
		font-weight: 700;
	}

	.obs-input-group {
		display: flex;
		gap: 0.5rem;
		width: 100%;
	}

	.obs-input-group input {
		flex: 1;
		min-width: 0;
	}

	.add-obs-btn {
		background: var(--primary) !important;
		color: white !important;
		padding: 0 1rem !important;
		height: 46px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem !important;
	}

	.obs-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
	}

	.obs-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.85rem 1rem;
		background: var(--bg);
		border-radius: 10px;
		font-size: 0.95rem;
		border: 1px solid var(--border);
		animation: slideIn 0.2s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.obs-text {
		flex: 1;
		color: var(--text-main);
		word-break: break-all;
	}

	.delete-obs {
		color: var(--danger);
		padding: 8px;
		background: var(--danger-light) !important;
		border-radius: 6px;
		margin-left: 0.75rem;
	}

	.action-btn.save {
		color: var(--success);
	}
	.action-btn.history {
		color: #2563eb;
	}
	.action-btn.share {
		color: #4f46e5;
	}
	.action-btn.reset {
		color: var(--danger);
	}

	.footer-print {
		padding: 2rem;
		text-align: center;
		border-top: 1px solid #eee;
		margin-top: 2rem;
	}

	.menu-separator {
		height: 1px;
		background-color: var(--border);
		margin: 0.5rem 0;
		width: 100%;
	}

	@media (max-width: 480px) {
		.bill-quantity-input {
			width: 60px !important;
			font-size: 1.1rem !important;
		}
	}
</style>
