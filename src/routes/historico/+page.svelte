<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import Storage from '$lib/services/storageService';
	import { type SavedCalculation } from '$lib/types/bill';
	import { Icon } from 'svelte-icons-pack';
	import { BsArrowLeft, BsEye, BsTrash, BsPencil, BsCheckLg, BsXLg } from 'svelte-icons-pack/bs';
	import { parseToCurrency } from '$lib/utils/currency';
	import Header from '$lib/components/Header.svelte';

	const storage = new Storage(browser);
	let history: SavedCalculation[] = [];

	if (browser) {
		history = storage.get<SavedCalculation[]>('history') || [];
	}

	let editingId: string | null = null;
	let newName = '';

	function startEdit(calc: SavedCalculation) {
		editingId = calc.id;
		newName = calc.name;
	}

	function saveName(id: string) {
		history = history.map((c) => (c.id === id ? { ...c, name: newName } : c));
		storage.save('history', history);
		editingId = null;
	}

	function cancelEdit() {
		editingId = null;
	}

	function deleteCalculation(id: string) {
		if (confirm('Tem certeza que deseja excluir esta contagem?')) {
			history = history.filter((c) => c.id !== id);
			storage.save('history', history);
		}
	}

	function viewCalculation(id: string) {
		goto(`${base}/historico/${id}`);
	}

	function restoreCalculation(calc: SavedCalculation) {
		if (confirm('Deseja restaurar esta contagem? Isso sobrescreverá a contagem atual.')) {
			storage.save('billsSaved', calc.bills);
			storage.save('observationsSaved', calc.observations);
			goto(`${base}/`);
		}
	}

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleString('pt-BR');
	}
</script>

<svelte:head>
	<title>Histórico de Contagens</title>
</svelte:head>

<div class="main-content">
	<Header>
		<div slot="title" class="container">
			<button
				class="transparent noprint"
				title="Voltar"
				on:click={() => {
					goto(`${base}/`);
				}}
			>
				<Icon src={BsArrowLeft} />
			</button>
			<h1>Histórico</h1>
		</div>
	</Header>

	<div class="history-list">
		{#if history.length === 0}
			<div class="container empty-msg">
				<p>Nenhuma contagem salva.</p>
			</div>
		{:else}
			{#each history as calc}
				<div class="history-item container">
					<div class="history-info">
						{#if editingId === calc.id}
							<div class="edit-name-container">
								<input
									type="text"
									bind:value={newName}
									class="edit-name-input"
									on:keydown={(e) => e.key === 'Enter' && saveName(calc.id)}
								/>
								<button
									class="transparent icon-btn"
									title="Confirmar"
									on:click={() => saveName(calc.id)}
								>
									<Icon src={BsCheckLg} color="green" />
								</button>
								<button class="transparent icon-btn" title="Cancelar" on:click={cancelEdit}>
									<Icon src={BsXLg} color="red" />
								</button>
							</div>
						{:else}
							<div class="title-container">
								<h3>{calc.name}</h3>
								<button
									class="transparent icon-btn edit-btn"
									title="Editar nome"
									on:click={() => startEdit(calc)}
								>
									<Icon src={BsPencil} size="12" color="#666" />
								</button>
							</div>
						{/if}
						<p>{formatDate(calc.date)}</p>
						<p class="total-text">{parseToCurrency(calc.total)}</p>
					</div>
					<div class="history-actions">
						<button
							class="transparent icon-btn"
							title="Visualizar"
							on:click={() => viewCalculation(calc.id)}
						>
							<Icon src={BsEye} color="blue" />
						</button>
						<button
							class="transparent icon-btn"
							title="Restaurar"
							on:click={() => restoreCalculation(calc)}
						>
							<Icon src={BsArrowLeft} color="green" />
						</button>
						<button
							class="transparent icon-btn"
							title="Excluir"
							on:click={() => deleteCalculation(calc.id)}
						>
							<Icon src={BsTrash} color="red" />
						</button>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.history-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
	}

	.history-item {
		background: #fff;
		border-radius: 8px;
		padding: 1rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
		border: 1px solid #eee;
	}

	.history-info h3 {
		margin: 0;
		font-size: 1.1rem;
		color: #333;
	}

	.history-info p {
		margin: 0.2rem 0;
		font-size: 0.85rem;
		color: #666;
	}

	.total-text {
		font-weight: bold;
		color: #000;
	}

	.history-actions {
		display: flex;
		gap: 0.5rem;
	}

	.icon-btn {
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border-radius: 50%;
		transition: background 0.2s;
	}

	.icon-btn:hover {
		background: #f5f5f5;
	}

	.empty-msg {
		text-align: center;
		color: #888;
		margin-top: 2rem;
	}

	.title-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.edit-btn {
		padding: 0;
		opacity: 0.5;
	}

	.edit-btn:hover {
		opacity: 1;
	}

	.edit-name-container {
		display: flex;
		align-items: center;
		gap: 0.2rem;
	}

	.edit-name-input {
		font-size: 1rem;
		padding: 2px 5px;
		border: 1px solid #ccc;
		border-radius: 4px;
		width: 150px;
	}
</style>
