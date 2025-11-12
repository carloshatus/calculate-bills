import html2canvas from 'html2canvas';

export async function share(mainContent: HTMLElement): Promise<void> {
	const canvas = await html2canvas(mainContent);
	canvas.toBlob(async (blob) => {
		if (!blob) {
			return;
		}
		if (navigator.share) {
			const file = new File([blob], 'calculadora-de-cedulas.png', { type: 'image/png' });
			await navigator.share({
				files: [file],
				title: 'Calculadora de Cédulas',
				text: 'Confira o cálculo'
			});
		} else {
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = 'calculadora-de-cedulas.png';
			a.click();
		}
	});
}
