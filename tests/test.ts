import { expect, test } from '@playwright/test';

test('index page has expected title', async ({ page }) => {
	await page.goto('/');
	await page.waitForSelector('.main-content[data-ready="true"]');
	await expect(page.getByRole('heading', { name: 'Calculadora' })).toBeVisible();
});

test('should calculate totals correctly', async ({ page }) => {
	await page.goto('/');
	await page.waitForSelector('.main-content[data-ready="true"]');
	const inputs = page.locator('input[inputmode="numeric"]');
	await inputs.first().click();
	await inputs.first().fill('2');

	// 2 * 200 = 400
	const total = page.locator('.main-total .amount');
	await expect(total).toContainText('400,00', { timeout: 15000 });
});

test('should add and clear observations', async ({ page }) => {
	await page.goto('/');
	await page.waitForSelector('.main-content[data-ready="true"]');
	const obsInput = page.getByPlaceholder('Adicionar observação...');
	await obsInput.fill('Test observation');
	await page.locator('.add-obs-btn').click();

	await expect(page.getByText('Test observation')).toBeVisible();

	await page.locator('.delete-obs').first().click();
	await expect(page.getByText('Test observation')).not.toBeVisible();
});

test('should navigate to trocar-notas page', async ({ page }) => {
	await page.goto('/');
	await page.waitForSelector('.main-content[data-ready="true"]');
	await page.getByRole('button', { name: 'Menu' }).click();
	await page.getByTitle('Trocar Notas').click();
	await expect(page).toHaveURL(/trocar-notas/);
	await expect(page.getByRole('heading', { name: 'Trocar Notas' })).toBeVisible();
});
