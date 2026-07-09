import html2canvas from 'html2canvas';

async function generateImageBlob(mainContent: HTMLElement): Promise<Blob | null> {
	// PWA/Mobile experience: Add a tiny delay to ensure smooth transition
	await new Promise((r) => setTimeout(r, 100));

	const canvas = await html2canvas(mainContent, {
		ignoreElements: (element) => element.classList.contains('noprint'),
		scale: 2, // High resolution
		backgroundColor: '#ffffff', // Clean white background for sharing
		logging: false,
		useCORS: true,
		onclone: (clonedDoc) => {
			const style = clonedDoc.createElement('style');
			let cssText = '';
			for (const sheet of Array.from(document.styleSheets)) {
				try {
					for (const rule of Array.from(sheet.cssRules || [])) {
						cssText += rule.cssText;
					}
				} catch (e) {
					// Ignore cross-origin stylesheet errors
				}
			}
			style.appendChild(clonedDoc.createTextNode(cssText));
			clonedDoc.head.appendChild(style);
		}
	});

	return new Promise((resolve) => {
		canvas.toBlob((blob) => resolve(blob));
	});
}

function formatFilename(base: string): string {
	const now = new Date();
	const day = String(now.getDate()).padStart(2, '0');
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const year = now.getFullYear();
	const hours = String(now.getHours()).padStart(2, '0');
	const mins = String(now.getMinutes()).padStart(2, '0');
	const dateStr = `${day}-${month}-${year}_${hours}h${mins}`;

	if (base.endsWith('.png')) {
		return base.replace('.png', `_${dateStr}.png`);
	}
	return `${base}_${dateStr}.png`;
}

export async function share(
	mainContent: HTMLElement,
	title = 'Calculadora de Cédulas',
	text = 'Confira o cálculo'
): Promise<void> {
	const blob = await generateImageBlob(mainContent);
	if (!blob) return;

	const filename = formatFilename('calculadora-de-cedulas.png');

	if (navigator.share) {
		const file = new File([blob], filename, { type: 'image/png' });
		try {
			await navigator.share({
				files: [file],
				title,
				text
			});
		} catch (e) {
			console.error('Error sharing', e);
		}
	} else {
		downloadBlob(blob, filename);
	}
}

export async function download(
	mainContent: HTMLElement,
	filename = 'calculadora-de-cedulas.png'
): Promise<void> {
	const blob = await generateImageBlob(mainContent);
	if (!blob) return;
	downloadBlob(blob, formatFilename(filename));
}

function downloadBlob(blob: Blob, filename: string) {
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = filename;
	a.click();
	setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
