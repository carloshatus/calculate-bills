<script lang="ts">
	import { Icon } from 'svelte-icons-pack';
	import { BsXLg } from 'svelte-icons-pack/bs';
	import { fade, scale } from 'svelte/transition';

	export let show = false;
	export let title = '';
	export let message = '';
	export let confirmText = 'Confirmar';
	export let cancelText = 'Cancelar';
	export let type: 'info' | 'danger' | 'success' = 'info';
	export let showCancel = true;

	export let onConfirm: () => void = () => {
		/* noop */
	};
	export let onClose: () => void = () => {
		/* noop */
	};

	export let extraActionText = '';
	export let onExtraAction: () => void = () => {
		/* noop */
	};
	export let linkText = '';
	export let linkUrl = '';

	function handleConfirm() {
		onConfirm();
		show = false;
	}

	function handleExtraAction() {
		onExtraAction();
		show = false;
	}

	function handleClose() {
		onClose();
		show = false;
	}
</script>

{#if show}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="modal-backdrop noprint" on:click={handleClose} transition:fade={{ duration: 200 }}>
		<div
			class="modal-content"
			on:click|stopPropagation
			transition:scale={{ duration: 250, start: 0.95 }}
		>
			<div class="modal-header">
				<h3>{title}</h3>
				<button class="close-btn" on:click={handleClose}>
					<Icon src={BsXLg} />
				</button>
			</div>

			<div class="modal-body">
				<p>{message}</p>
				{#if linkUrl && linkText}
					<a href={linkUrl} target="_blank" rel="noopener noreferrer" class="modal-link">
						{linkText}
					</a>
				{/if}
			</div>

			<div class="modal-footer">
				{#if showCancel}
					<button class="btn-cancel" on:click={handleClose}>
						{cancelText}
					</button>
				{/if}
				{#if extraActionText}
					<button class="btn-extra" on:click={handleExtraAction}>
						{extraActionText}
					</button>
				{/if}
				<button
					class="btn-confirm"
					class:danger={type === 'danger'}
					class:success={type === 'success'}
					on:click={handleConfirm}
				>
					{confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(4px);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
	}

	.modal-content {
		background: white;
		width: 100%;
		max-width: 400px;
		border-radius: 20px;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
		overflow: hidden;
	}

	.modal-header {
		padding: 1.25rem 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--border);
	}

	.modal-header h3 {
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--text-main);
	}

	.close-btn {
		color: var(--text-muted);
		padding: 0.5rem;
		font-size: 1rem;
	}

	.modal-body {
		padding: 1.5rem;
		font-size: 1rem;
		color: var(--text-main);
		line-height: 1.6;
		white-space: pre-line;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.modal-link {
		color: var(--primary);
		text-decoration: underline;
		font-weight: 600;
		font-size: 0.95rem;
		width: fit-content;
	}

	.modal-footer {
		padding: 1rem 1.5rem;
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		background: var(--bg);
	}

	.modal-footer button {
		padding: 0.6rem 1.25rem;
		font-size: 0.95rem;
		font-weight: 600;
	}

	.btn-cancel {
		background: white !important;
		border: 1px solid var(--border) !important;
		color: var(--text-main) !important;
	}

	.btn-extra {
		background: var(--primary-light) !important;
		color: var(--primary) !important;
		border: 1px solid var(--primary) !important;
	}

	.btn-confirm {
		background: var(--primary) !important;
		color: white !important;
	}

	.btn-confirm.danger {
		background: var(--danger) !important;
	}

	.btn-confirm.success {
		background: var(--success) !important;
	}
</style>
