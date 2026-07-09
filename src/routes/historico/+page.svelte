<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import Storage from '$lib/services/storageService';
	import type { SavedCalculation } from '$lib/types/bill';
	import * as historyService from '$lib/services/historyService';
	import { formatDate } from '$lib/utils/time';
	import { Icon } from 'svelte-icons-pack';
	import {
		BsArrowLeft,
		BsEye,
		BsTrash,
		BsPencil,
		BsCheckLg,
		BsXLg,
		BsArrowCounterclockwise
	} from 'svelte-icons-pack/bs';
	import { parseToCurrency } from '$lib/utils/currency';
	import Header from '$lib/components/Header.svelte';
	import Modal from '$lib/components/Modal.svelte';

	const storage = new Storage(browser);
	let history: SavedCalculation[] = [];

	if (browser) {
		history = historyService.getHistory(storage);
	}

	let modalConfig = {
		show: false,
		title: '',
		message: '',
		type: 'info' as 'info' | 'danger' | 'success',
		confirmText: 'Confirmar',
		cancelText: 'Cancelar',
		extraActionText: '',
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
			onConfirm: () => {
				/* noop */
			},
			onExtraAction: () => {
				/* noop */
			},
			...config
		};
	}

	let editingId: string | null = null;
	let newName = '';

	function startEdit(calc: SavedCalculation) {
		editingId = calc.id;
		newName = calc.name;
	}

	function saveName(id: string) {
		history = historyService.updateCalculationName(storage, id, newName);
		editingId = null;
	}

	function cancelEdit() {
		editingId = null;
	}

	function deleteCalculation(id: string) {
		openModal({
			title: 'Excluir contagem?',
			message: 'Tem certeza que deseja excluir esta contagem permanentemente?',
			type: 'danger',
			confirmText: 'Excluir',
			onConfirm: () => {
				history = historyService.deleteFromHistory(storage, id);
			}
		});
	}

	function clearHistory() {
		openModal({
			title: 'Limpar histórico?',
			message:
				'Tem certeza que deseja apagar todas as contagens salvas? Esta ação não pode ser desfeita.',
			type: 'danger',
			confirmText: 'Limpar tudo',
			onConfirm: () => {
				historyService.clearHistory(storage);
				history = [];
			}
		});
	}

	function viewCalculation(id: string) {
		goto(`${base}/historico/${id}`);
	}

	function restoreCalculation(calc: SavedCalculation) {
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
</script>

<svelte:head>
	<title>Histórico de Contagens</title>
</svelte:head>

<div class="main-content">
	<Header>
		<div slot="title" class="title-container">
			<div class="header-left">
				<button class="back-btn" title="Voltar" on:click={() => goto(`${base}/`)}>
					<Icon src={BsArrowLeft} />
				</button>
				<h1>Histórico</h1>
			</div>
			<p class="dateStamp">{history.length} contagens salvas</p>
		</div>

		<div slot="buttons">
			{#if history.length > 0}
				<button class="action-btn delete-all" title="Limpar Histórico" on:click={clearHistory}>
					<Icon src={BsTrash} />
					<span>Limpar</span>
				</button>
			{/if}
		</div>
	</Header>

	<div class="history-list">
		{#if history.length === 0}
			<div class="empty-state card">
				<p>Nenhuma contagem salva.</p>
			</div>
		{:else}
			{#each history as calc}
				<div class="card history-item">
					<div class="history-info">
						{#if editingId === calc.id}
							<div class="edit-name-container">
								<input
									type="text"
									bind:value={newName}
									class="edit-name-input"
									on:keydown={(e) => e.key === 'Enter' && saveName(calc.id)}
									on:blur={() => saveName(calc.id)}
								/>
								<div class="edit-actions">
									<button class="confirm-btn" on:click={() => saveName(calc.id)}>
										<Icon src={BsCheckLg} />
									</button>
									<button class="cancel-btn" on:click={cancelEdit}>
										<Icon src={BsXLg} />
									</button>
								</div>
							</div>
						{:else}
							<div class="title-row">
								<button
									class="title-btn-list"
									on:click={() => startEdit(calc)}
									aria-label="Editar nome"
								>
									<h3>{calc.name}</h3>
								</button>
								<button
									class="edit-trigger"
									on:click={() => startEdit(calc)}
									aria-label="Editar nome"
								>
									<Icon src={BsPencil} />
								</button>
							</div>
						{/if}
						<div class="meta-row">
							<div class="dates-column">
								{#if calc.createdAt}
									<span class="date">Criado em {formatDate(calc.createdAt)}</span>
								{/if}
								<span class="date">Salvo em {formatDate(calc.date)}</span>
							</div>
							<span class="amount">{parseToCurrency(calc.total)}</span>
						</div>
					</div>

					<div class="history-actions">
						<button
							class="action-btn view"
							title="Visualizar"
							on:click={() => viewCalculation(calc.id)}
						>
							<Icon src={BsEye} />
						</button>
						<button
							class="action-btn restore"
							title="Restaurar"
							on:click={() => restoreCalculation(calc)}
						>
							<Icon src={BsArrowCounterclockwise} />
						</button>
						<button
							class="action-btn delete"
							title="Excluir"
							on:click={() => deleteCalculation(calc.id)}
						>
							<Icon src={BsTrash} />
						</button>
					</div>
				</div>
			{/each}
		{/if}
	</div>

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

<style>
	.title-container {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.title-btn-list {
		background: transparent !important;
		padding: 0 !important;
		margin: 0 !important;
		text-align: left;
		cursor: pointer;
	}

	.title-btn-list:hover h3 {
		color: var(--primary);
	}

	.history-list {
		padding: var(--padding);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.history-item {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.history-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.title-row h3 {
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--text-main);
		margin: 0;
	}

	.edit-trigger {
		opacity: 0.3;
		padding: 4px;
		font-size: 0.8rem;
	}

	.meta-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.dates-column {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.date {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.amount {
		font-weight: 700;
		color: var(--primary);
		font-size: 1.1rem;
	}

	.history-actions {
		display: flex;
		gap: 0.5rem;
		border-top: 1px solid var(--border);
		padding-top: 0.75rem;
		justify-content: flex-end;
	}

	.action-btn {
		flex: 1;
		max-width: 80px;
		background: var(--bg) !important;
		border-radius: 8px !important;
		padding: 0.5rem !important;
		font-size: 1.2rem !important;
	}

	.action-btn.view {
		color: var(--primary);
	}
	.action-btn.restore {
		color: var(--success);
	}
	.action-btn.delete,
	.action-btn.delete-all {
		color: var(--danger);
	}

	.action-btn.delete-all {
		background: var(--danger-light) !important;
		border: 1px solid var(--danger) !important;
		padding: 0.4rem 0.8rem !important;
		font-size: 0.9rem !important;
		max-width: none;
		height: 38px;
	}

	.action-btn.delete-all span {
		margin-left: 0.4rem;
		font-weight: 600;
	}

	.edit-name-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
	}

	.edit-name-input {
		width: 100% !important;
	}

	.edit-actions {
		display: flex;
		gap: 0.5rem;
	}

	.confirm-btn {
		background: var(--success) !important;
		color: white !important;
		flex: 1;
	}
	.cancel-btn {
		background: #eee !important;
		color: #666 !important;
		flex: 1;
	}

	.empty-state {
		padding: 3rem 2rem;
		text-align: center;
		color: var(--text-muted);
	}
</style>
