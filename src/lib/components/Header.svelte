<script lang="ts">
	import { Icon } from 'svelte-icons-pack';
	import { BsList, BsXLg } from 'svelte-icons-pack/bs';
	import { onMount } from 'svelte';

	let menuOpen = false;

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}

	function handleOutsideClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (menuOpen && !target.closest('.menu-container')) {
			closeMenu();
		}
	}

	onMount(() => {
		window.addEventListener('click', handleOutsideClick);
		return () => window.removeEventListener('click', handleOutsideClick);
	});
</script>

<header class="main-header noprint">
	<div class="header-container">
		<div class="header-left">
			<slot name="title" />
		</div>
		
		{#if $$slots.buttons}
			<div class="menu-container">
				<button 
					class="menu-toggle-btn" 
					class:active={menuOpen}
					on:click|stopPropagation={toggleMenu}
					aria-label="Menu"
				>
					<Icon src={menuOpen ? BsXLg : BsList} />
				</button>

				{#if menuOpen}
					<div class="dropdown-menu shadow" on:click={closeMenu} on:keydown={() => {}}>
						<div class="menu-items">
							<slot name="buttons" />
						</div>
					</div>
				{/if}
			</div>
		{/if}

	</div>
</header>

<style>
	.main-header {
		position: sticky;
		top: 0;
		z-index: 1000;
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--border);
		padding: 0.75rem var(--padding);
	}

	.header-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 600px;
		margin: 0 auto;
		width: 100%;
	}

	.header-left {
		flex: 1;
		min-width: 0;
	}

	.header-container:has(.editing) .menu-container {
		display: none;
	}

	.menu-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	.menu-toggle-btn {
		width: 44px;
		height: 44px;
		background: var(--primary-light) !important;
		color: var(--primary) !important;
		border-radius: 12px;
		font-size: 1.5rem !important;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.menu-toggle-btn.active {
		background: var(--danger-light) !important;
		color: var(--danger) !important;
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 10px);
		right: 0;
		background: white;
		border-radius: 16px;
		border: 1px solid var(--border);
		width: 220px;
		padding: 0.5rem;
		transform-origin: top right;
		animation: popIn 0.2s ease-out;
		z-index: 2000;
	}

	@keyframes popIn {
		from { opacity: 0; transform: scale(0.95) translateY(-10px); }
		to { opacity: 1; transform: scale(1) translateY(0); }
	}

	.menu-items {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	/* Menu Button Refinements */
	:global(.dropdown-menu button), :global(.dropdown-menu .action-btn) {
		width: 100% !important;
		justify-content: flex-start !important;
		padding: 0.75rem 1rem !important;
		background: transparent !important;
		color: var(--text-main) !important;
		border-radius: 10px !important;
		font-size: 1rem !important;
		gap: 1rem !important;
	}

	:global(.dropdown-menu button:hover) {
		background: var(--bg) !important;
	}

	/* Support for adding labels via data-label if we want, but let's see current buttons */
	:global(.main-header h1) {
		font-size: 1.1rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>


