export function refreshTime(): string {
	return new Date().toLocaleString('pt-BR');
}

export function formatDate(date: string | Date): string {
	return new Date(date).toLocaleString('pt-BR');
}
