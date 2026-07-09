import html2canvas from 'html2canvas';

export async function share(
	mainContent: HTMLElement,
	title = 'Calculadora de Cédulas',
	text = 'Confira o cálculo'
): Promise<void> {
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
	canvas.toBlob(async (blob) => {
		if (!blob) {
			return;
		}
		if (navigator.share) {
			const file = new File([blob], 'calculadora-de-cedulas.png', { type: 'image/png' });
			await navigator.share({
				files: [file],
				title,
				text
			});
		} else {
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = 'calculadora-de-cedulas.png';
			a.click();
		}
	});
}
