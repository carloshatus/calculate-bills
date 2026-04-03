<script>
	import '../app.css';
	import { onMount } from 'svelte';

	onMount(async () => {
		if (navigator.storage && navigator.storage.persist) {
			const isPersisted = await navigator.storage.persisted();
			if (!isPersisted) {
				const persistent = await navigator.storage.persist();
				if (persistent) {
					console.log('📦 Armazenamento persistente ativado!');
				}
			}
		}
	});
</script>

<slot />
