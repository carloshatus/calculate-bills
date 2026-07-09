<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Icon } from 'svelte-icons-pack';
	import { BsXLg, BsQrCode, BsCamera2 } from 'svelte-icons-pack/bs';
	import { fade, scale } from 'svelte/transition';
	import QRCode from 'qrcode';
	import jsQR from 'jsqr';
	import {
		encodePayload,
		decodePayload,
		mergeBills,
		mergeObservations,
		type MergeStrategy
	} from '$lib/utils/qrPayload';
	import type { Bill } from '$lib/types/bill';

	export let show = false;
	export let bills: Bill[] = [];
	export let pageName = '';
	export let observations: string[] = [];

	/** Called when the user confirms a merge. Provides merged bills, observations and backup name. */
	export let onMerge: (bills: Bill[], observations: string[], backupName: string) => void = () => {
		/* noop */
	};

	// ── State ────────────────────────────────────────────────────────────────

	type Tab = 'generate' | 'scan';
	let activeTab: Tab = 'generate';

	// Generate tab
	let qrCanvas: HTMLCanvasElement;
	let qrGenerated = false;

	// Scan tab
	let videoEl: HTMLVideoElement;
	let scanCanvas: HTMLCanvasElement;
	let stream: MediaStream | null = null;
	let scanning = false;
	let scanError = '';
	let animFrameId: number;

	// Merge dialog
	type MergeStep = 'idle' | 'choose';
	let mergeStep: MergeStep = 'idle';
	let incomingBills: Bill[] = [];
	let incomingPageName = '';
	let incomingObservations: string[] = [];

	// Previews computed per strategy
	type PreviewRow = { label: string; current: number | null; result: number; changed: boolean };
	type Preview = { rows: PreviewRow[]; total: number };

	function buildPreview(strategy: MergeStrategy): Preview {
		const merged = mergeBills(bills, incomingBills, strategy);
		const rows: PreviewRow[] = merged
			.map((bill, i) => {
				const current =
					bills[i]?.quantity !== null && bills[i]?.quantity !== ''
						? Number(bills[i].quantity)
						: null;
				const result = bill.quantity !== null && bill.quantity !== '' ? Number(bill.quantity) : 0;
				const changed = result !== (current ?? 0);
				const label =
					bill.value >= 1
						? `R$ ${bill.value.toFixed(0)}`
						: `R$ ${bill.value.toFixed(2).replace('.', ',')}`;
				return { label, current, result, changed };
			})
			.filter((r) => r.result > 0 || r.changed);
		const total = merged.reduce((s, b) => s + (b.total ?? 0), 0);
		return { rows, total };
	}

	$: previewSum = mergeStep === 'choose' ? buildPreview('sum') : null;
	$: previewOverwrite = mergeStep === 'choose' ? buildPreview('overwrite') : null;
	$: previewFill = mergeStep === 'choose' ? buildPreview('fill_empty') : null;

	function fmtCurrency(v: number): string {
		return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	}

	// ── Lifecycle ─────────────────────────────────────────────────────────────

	$: if (show && activeTab === 'generate' && qrCanvas) {
		generateQR();
	}

	$: if (!show) {
		stopCamera();
		mergeStep = 'idle';
	}

	onDestroy(() => {
		stopCamera();
	});

	// ── QR Generation ─────────────────────────────────────────────────────────

	async function generateQR() {
		qrGenerated = false;
		const payload = encodePayload(bills, pageName, observations);
		try {
			await QRCode.toCanvas(qrCanvas, payload, {
				width: 260,
				margin: 2,
				color: {
					dark: '#1e293b',
					light: '#f8fafc'
				},
				errorCorrectionLevel: 'M'
			});
			qrGenerated = true;
		} catch (e) {
			console.error('QR generation error', e);
		}
	}

	// ── Camera / Scan ─────────────────────────────────────────────────────────

	async function startCamera() {
		scanError = '';
		scanning = false;
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' }
			});
			videoEl.srcObject = stream;
			await videoEl.play();
			scanning = true;
			requestAnimationFrame(scanFrame);
		} catch (e: unknown) {
			const err = e as DOMException;
			if (err.name === 'NotAllowedError') {
				scanError = 'Permissão de câmera negada. Habilite nas configurações do navegador.';
			} else {
				scanError = 'Não foi possível acessar a câmera.';
			}
		}
	}

	function stopCamera() {
		scanning = false;
		if (animFrameId) cancelAnimationFrame(animFrameId);
		if (stream) {
			stream.getTracks().forEach((t) => t.stop());
			stream = null;
		}
	}

	function scanFrame() {
		if (!scanning || !videoEl || videoEl.readyState < videoEl.HAVE_ENOUGH_DATA) {
			if (scanning) animFrameId = requestAnimationFrame(scanFrame);
			return;
		}

		const ctx = scanCanvas.getContext('2d');
		if (!ctx) return;

		scanCanvas.width = videoEl.videoWidth;
		scanCanvas.height = videoEl.videoHeight;
		ctx.drawImage(videoEl, 0, 0, scanCanvas.width, scanCanvas.height);

		const imageData = ctx.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
		const code = jsQR(imageData.data, imageData.width, imageData.height, {
			inversionAttempts: 'dontInvert'
		});

		if (code?.data) {
			scanning = false;
			stopCamera();
			handleScanned(code.data);
		} else {
			animFrameId = requestAnimationFrame(scanFrame);
		}
	}

	function handleScanned(data: string) {
		const decoded = decodePayload(data);
		if (!decoded) {
			scanError = 'QR Code inválido ou não é um cálculo compatível.';
			return;
		}
		incomingBills = decoded.bills;
		incomingPageName = decoded.pageName;
		incomingObservations = decoded.observations;
		mergeStep = 'choose';
	}

	// ── Merge ─────────────────────────────────────────────────────────────────

	function applyMerge(strategy: MergeStrategy) {
		const now = new Date();
		const dd = String(now.getDate()).padStart(2, '0');
		const mm = String(now.getMonth() + 1).padStart(2, '0');
		const hh = String(now.getHours()).padStart(2, '0');
		const min = String(now.getMinutes()).padStart(2, '0');
		const ts = `${dd}/${mm} ${hh}:${min}`;
		const backupName = pageName ? `${pageName} (backup ${ts})` : `Backup ${ts}`;

		const merged = mergeBills(bills, incomingBills, strategy);
		const mergedObs = mergeObservations(observations, incomingObservations);
		onMerge(merged, mergedObs, backupName);

		mergeStep = 'idle';
		show = false;
	}

	function cancelMerge() {
		mergeStep = 'idle';
		scanError = '';
	}

	// ── Tab switching ──────────────────────────────────────────────────────────

	function switchTab(tab: Tab) {
		if (tab === activeTab) return;
		if (activeTab === 'scan') stopCamera();
		activeTab = tab;
		mergeStep = 'idle';
		scanError = '';
	}

	function handleClose() {
		stopCamera();
		mergeStep = 'idle';
		show = false;
	}

	// Re-generate QR when tab switches to generate and canvas is available
	function onGenerateTabMounted(node: HTMLCanvasElement) {
		qrCanvas = node;
		generateQR();
	}
</script>

{#if show}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="qr-backdrop noprint" on:click={handleClose} transition:fade={{ duration: 200 }}>
		<div
			class="qr-modal"
			on:click|stopPropagation
			transition:scale={{ duration: 250, start: 0.95 }}
		>
			<!-- Header -->
			<div class="qr-header">
				<h3>Compartilhar via QR Code</h3>
				<button class="close-btn" on:click={handleClose} aria-label="Fechar">
					<Icon src={BsXLg} />
				</button>
			</div>

			<!-- Tabs -->
			<div class="qr-tabs">
				<button
					class="tab-btn"
					class:active={activeTab === 'generate'}
					on:click={() => switchTab('generate')}
					id="tab-generate"
				>
					<Icon src={BsQrCode} />
					Gerar QR
				</button>
				<button
					class="tab-btn"
					class:active={activeTab === 'scan'}
					on:click={() => switchTab('scan')}
					id="tab-scan"
				>
					<Icon src={BsCamera2} />
					Escanear
				</button>
			</div>

			<!-- Body -->
			<div class="qr-body">
				<!-- ── Generate tab ── -->
				{#if activeTab === 'generate'}
					<div class="generate-tab">
						<p class="tab-hint">
							Mostre este QR Code para outro dispositivo escanear e receber o cálculo atual.
						</p>
						<div class="canvas-wrapper">
							<canvas
								use:onGenerateTabMounted
								class:ready={qrGenerated}
								aria-label="QR Code do cálculo"
							/>
							{#if !qrGenerated}
								<div class="qr-loading">Gerando…</div>
							{/if}
						</div>
						{#if pageName}
							<p class="qr-label">"{pageName}"</p>
						{/if}
					</div>

					<!-- ── Scan tab ── -->
				{:else if mergeStep === 'idle'}
					<div class="scan-tab">
						{#if !scanning && !scanError}
							<p class="tab-hint">Aponte a câmera para o QR Code gerado em outro dispositivo.</p>
							<button class="start-scan-btn" id="btn-start-scan" on:click={startCamera}>
								<Icon src={BsCamera2} />
								Abrir câmera
							</button>
						{/if}

						{#if scanError}
							<p class="scan-error">{scanError}</p>
							<button class="start-scan-btn" on:click={startCamera}>Tentar novamente</button>
						{/if}

						<div class="video-container" class:hidden={!scanning}>
							<!-- svelte-ignore a11y-media-has-caption -->
							<video bind:this={videoEl} playsinline class="scan-video" />
							<div class="scan-overlay">
								<div class="scan-frame" />
							</div>
						</div>

						<!-- hidden canvas for frame processing -->
						<canvas bind:this={scanCanvas} class="hidden-canvas" />
					</div>

					<!-- ── Merge dialog ── -->
				{:else if mergeStep === 'choose'}
					<div class="merge-dialog">
						<div class="merge-badge">✅ QR Code lido com sucesso</div>
						{#if incomingPageName}
							<p class="merge-source">Origem: <strong>"{incomingPageName}"</strong></p>
						{/if}
						<p class="merge-hint">Escolha como mesclar com seu cálculo atual:</p>
						<p class="backup-note">
							💾 Seu cálculo atual será salvo no histórico como backup antes do merge.
						</p>
						<div class="merge-options">
							<!-- SUM -->
							<div class="merge-card sum" id="btn-merge-sum">
								<div class="merge-card-header">
									<span class="merge-icon">🔁</span>
									<div class="merge-card-text">
										<strong>Somar</strong>
										<small>Soma as quantidades de cada cédula</small>
									</div>
									<span class="merge-total sum-total">{fmtCurrency(previewSum?.total ?? 0)}</span>
								</div>
								{#if previewSum && previewSum.rows.length > 0}
									<div class="preview-table">
										{#each previewSum.rows as row}
											<div class="preview-row" class:changed={row.changed}>
												<span class="preview-label">{row.label}</span>
												<span class="preview-arrow"
													>{row.current ?? 0} → <strong>{row.result}</strong></span
												>
											</div>
										{/each}
									</div>
								{/if}
								<button class="apply-btn sum-apply" on:click={() => applyMerge('sum')}
									>Aplicar Soma</button
								>
							</div>

							<!-- OVERWRITE -->
							<div class="merge-card overwrite" id="btn-merge-overwrite">
								<div class="merge-card-header">
									<span class="merge-icon">📋</span>
									<div class="merge-card-text">
										<strong>Sobrescrever</strong>
										<small>Substitui todas as quantidades</small>
									</div>
									<span class="merge-total overwrite-total"
										>{fmtCurrency(previewOverwrite?.total ?? 0)}</span
									>
								</div>
								{#if previewOverwrite && previewOverwrite.rows.length > 0}
									<div class="preview-table">
										{#each previewOverwrite.rows as row}
											<div class="preview-row" class:changed={row.changed}>
												<span class="preview-label">{row.label}</span>
												<span class="preview-arrow"
													>{row.current ?? 0} → <strong>{row.result}</strong></span
												>
											</div>
										{/each}
									</div>
								{/if}
								<button class="apply-btn overwrite-apply" on:click={() => applyMerge('overwrite')}
									>Aplicar Sobrescrita</button
								>
							</div>

							<!-- FILL EMPTY -->
							<div class="merge-card fill" id="btn-merge-fill">
								<div class="merge-card-header">
									<span class="merge-icon">✏️</span>
									<div class="merge-card-text">
										<strong>Preencher Vazios</strong>
										<small>Preenche apenas campos em branco</small>
									</div>
									<span class="merge-total fill-total">{fmtCurrency(previewFill?.total ?? 0)}</span>
								</div>
								{#if previewFill && previewFill.rows.length > 0}
									<div class="preview-table">
										{#each previewFill.rows as row}
											<div class="preview-row" class:changed={row.changed}>
												<span class="preview-label">{row.label}</span>
												<span class="preview-arrow"
													>{row.current ?? 0} → <strong>{row.result}</strong></span
												>
											</div>
										{/each}
									</div>
								{/if}
								<button class="apply-btn fill-apply" on:click={() => applyMerge('fill_empty')}
									>Aplicar Preenchimento</button
								>
							</div>
						</div>
						<button class="cancel-merge-btn" on:click={cancelMerge}>Cancelar</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	/* ── Backdrop & Modal ─────────────────────────────────────────── */
	.qr-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.55);
		backdrop-filter: blur(6px);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.25rem;
	}

	.qr-modal {
		background: var(--surface, #fff);
		width: 100%;
		max-width: 420px;
		max-height: 92vh;
		border-radius: 24px;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.08);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	/* ── Header ───────────────────────────────────────────────────── */
	.qr-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid var(--border, #e5e7eb);
	}

	.qr-header h3 {
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--text-main, #1e293b);
	}

	.close-btn {
		color: var(--text-muted, #94a3b8);
		padding: 0.4rem;
		border-radius: 8px;
		display: flex;
		align-items: center;
	}
	.close-btn:hover {
		background: var(--bg, #f1f5f9);
	}

	/* ── Tabs ─────────────────────────────────────────────────────── */
	.qr-tabs {
		display: flex;
		border-bottom: 1px solid var(--border, #e5e7eb);
	}

	.tab-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.85rem;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text-muted, #64748b);
		background: transparent !important;
		border-radius: 0 !important;
		border-bottom: 2px solid transparent;
		transition: all 0.2s;
	}

	.tab-btn.active {
		color: var(--primary, #6c47ff);
		border-bottom-color: var(--primary, #6c47ff);
	}

	/* ── Body ─────────────────────────────────────────────────────── */
	.qr-body {
		padding: 1.25rem 1.25rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		overflow-y: auto;
	}

	.tab-hint {
		font-size: 0.9rem;
		color: var(--text-muted, #64748b);
		text-align: center;
		line-height: 1.5;
	}

	/* ── Generate Tab ─────────────────────────────────────────────── */
	.generate-tab {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		width: 100%;
	}

	.canvas-wrapper {
		position: relative;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
		border: 2px solid var(--border, #e5e7eb);
	}

	.canvas-wrapper canvas {
		display: block;
		opacity: 0;
		transition: opacity 0.3s;
	}

	.canvas-wrapper canvas.ready {
		opacity: 1;
	}

	.qr-loading {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.9rem;
		color: var(--text-muted, #94a3b8);
	}

	.qr-label {
		font-size: 0.9rem;
		color: var(--text-muted, #64748b);
		font-style: italic;
	}

	/* ── Scan Tab ─────────────────────────────────────────────────── */
	.scan-tab {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		width: 100%;
	}

	.start-scan-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--primary, #6c47ff) !important;
		color: white !important;
		padding: 0.75rem 1.5rem !important;
		border-radius: 12px !important;
		font-size: 1rem !important;
		font-weight: 600 !important;
	}

	.scan-error {
		font-size: 0.9rem;
		color: var(--danger, #ef4444);
		text-align: center;
		background: var(--danger-light, #fef2f2);
		padding: 0.75rem 1rem;
		border-radius: 10px;
		width: 100%;
	}

	.video-container {
		position: relative;
		width: 100%;
		border-radius: 16px;
		overflow: hidden;
		background: #000;
		aspect-ratio: 1;
	}

	.video-container.hidden {
		display: none;
	}

	.scan-video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.scan-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.scan-frame {
		width: 60%;
		aspect-ratio: 1;
		border: 3px solid rgba(255, 255, 255, 0.9);
		border-radius: 16px;
		box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.35), 0 0 20px rgba(108, 71, 255, 0.5);
		animation: pulse-frame 2s ease-in-out infinite;
	}

	@keyframes pulse-frame {
		0%,
		100% {
			border-color: rgba(255, 255, 255, 0.9);
			box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.35), 0 0 20px rgba(108, 71, 255, 0.5);
		}
		50% {
			border-color: rgba(108, 71, 255, 0.95);
			box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.35), 0 0 30px rgba(108, 71, 255, 0.9);
		}
	}

	.hidden-canvas {
		display: none;
	}

	/* ── Merge Dialog ─────────────────────────────────────────────── */
	.merge-dialog {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
	}

	.merge-badge {
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--success, #22c55e);
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		padding: 0.5rem 1rem;
		border-radius: 999px;
	}

	.merge-source {
		font-size: 0.9rem;
		color: var(--text-muted, #64748b);
	}

	.merge-hint {
		font-size: 0.9rem;
		color: var(--text-main, #1e293b);
		text-align: center;
		font-weight: 600;
		margin-bottom: -0.2rem;
	}

	.backup-note {
		font-size: 0.8rem;
		color: var(--text-muted, #64748b);
		background: var(--bg, #f8fafc);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 10px;
		padding: 0.5rem 0.75rem;
		text-align: center;
		line-height: 1.4;
	}

	.merge-options {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		width: 100%;
	}

	/* ── Merge Card ───────────────────────────────────────────────── */
	.merge-card {
		border-radius: 14px;
		border: 2px solid transparent;
		overflow: hidden;
		transition: box-shadow 0.15s;
	}

	.merge-card:hover {
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
	}

	.merge-card-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 0.9rem;
	}

	.merge-card-text {
		flex: 1;
		min-width: 0;
	}

	.merge-card-text strong {
		display: block;
		font-size: 0.9rem;
		font-weight: 700;
	}

	.merge-card-text small {
		font-size: 0.75rem;
		opacity: 0.75;
	}

	.merge-icon {
		font-size: 1.25rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.merge-total {
		font-size: 0.85rem;
		font-weight: 800;
		white-space: nowrap;
		padding: 0.2rem 0.6rem;
		border-radius: 8px;
	}

	/* ── Preview Table ────────────────────────────────────────────── */
	.preview-table {
		margin: 0 0.9rem 0.6rem;
		border-radius: 10px;
		overflow: hidden;
		border: 1px solid rgba(0, 0, 0, 0.07);
	}

	.preview-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.3rem 0.65rem;
		font-size: 0.78rem;
		background: rgba(255, 255, 255, 0.6);
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.preview-row:last-child {
		border-bottom: none;
	}

	.preview-row.changed {
		background: rgba(255, 255, 255, 0.9);
		font-weight: 600;
	}

	.preview-label {
		color: inherit;
		opacity: 0.8;
		font-size: 0.76rem;
	}

	.preview-arrow {
		font-size: 0.78rem;
		opacity: 0.85;
	}

	.preview-arrow strong {
		font-size: 0.84rem;
	}

	/* ── Apply button ─────────────────────────────────────────────── */
	.apply-btn {
		display: block !important;
		width: calc(100% - 1.8rem) !important;
		margin: 0 0.9rem 0.75rem !important;
		padding: 0.5rem !important;
		border-radius: 9px !important;
		font-size: 0.82rem !important;
		font-weight: 700 !important;
		text-align: center !important;
		cursor: pointer;
		transition: opacity 0.15s !important;
	}

	.apply-btn:hover {
		opacity: 0.85;
	}

	/* ── Color themes per strategy ────────────────────────────────── */
	.merge-card.sum {
		background: #eff6ff;
		border-color: #bfdbfe;
		color: #1d4ed8;
	}
	.sum-total {
		background: #dbeafe;
		color: #1e40af;
	}
	.sum-apply {
		background: #1d4ed8 !important;
		color: white !important;
	}

	.merge-card.overwrite {
		background: #fdf4ff;
		border-color: #e9d5ff;
		color: #7e22ce;
	}
	.overwrite-total {
		background: #f3e8ff;
		color: #6b21a8;
	}
	.overwrite-apply {
		background: #7e22ce !important;
		color: white !important;
	}

	.merge-card.fill {
		background: #f0fdf4;
		border-color: #bbf7d0;
		color: #15803d;
	}
	.fill-total {
		background: #dcfce7;
		color: #166534;
	}
	.fill-apply {
		background: #15803d !important;
		color: white !important;
	}

	.cancel-merge-btn {
		background: transparent !important;
		color: var(--text-muted, #64748b) !important;
		font-size: 0.9rem !important;
		padding: 0.4rem 1rem !important;
	}

	.cancel-merge-btn:hover {
		color: var(--text-main) !important;
	}
</style>
