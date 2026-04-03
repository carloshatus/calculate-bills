import type Storage from './storageService';
import type { Bill, SavedCalculation } from '../types/bill';

export function getHistory(storage: Storage): SavedCalculation[] {
	return storage.get<SavedCalculation[]>('history') || [];
}

export function saveToHistory(storage: Storage, calculation: SavedCalculation): void {
	const currentHistory = getHistory(storage);
	const updatedHistory = [calculation, ...currentHistory];
	storage.save('history', updatedHistory);
}

export function createSavedCalculation(
	bills: Bill[],
	observations: string[],
	name: string,
	total: number
): SavedCalculation {
	return {
		id: crypto.randomUUID(),
		name: name || 'Sem título',
		date: new Date().toISOString(),
		bills: JSON.parse(JSON.stringify(bills)),
		observations: [...observations],
		total: total
	};
}

export function saveCurrentAndRestore(storage: Storage, calcToRestore: SavedCalculation): void {
	const currentBills = storage.get<Bill[]>('billsSaved') || [];
	const currentObs = storage.get<string[]>('observationsSaved') || [];
	const currentName = storage.get<string>('pageName') || 'Sem título (backup)';
	const total = currentBills.reduce((sum, b) => sum + (b.total || 0), 0);

	const backup = createSavedCalculation(currentBills, currentObs, currentName, total);
	saveToHistory(storage, backup);

	// Restore
	restore(storage, calcToRestore);
}

export function restore(storage: Storage, calc: SavedCalculation): void {
	storage.save('billsSaved', calc.bills);
	storage.save('observationsSaved', calc.observations);
	storage.save('pageName', calc.name);
}

export function deleteFromHistory(storage: Storage, id: string): SavedCalculation[] {
	const history = getHistory(storage).filter((c) => c.id !== id);
	storage.save('history', history);
	return history;
}

export function clearHistory(storage: Storage): void {
	storage.save('history', []);
}

export function updateCalculationName(
	storage: Storage,
	id: string,
	name: string
): SavedCalculation[] {
	const history = getHistory(storage).map((c) => (c.id === id ? { ...c, name } : c));
	storage.save('history', history);
	return history;
}
