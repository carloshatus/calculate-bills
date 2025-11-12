import { expect, test } from '@playwright/test';

test('index page has expected h1', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Calculadora de cédulas' })).toBeVisible();
});

test('should calculate totals correctly', async ({ page }) => {
	await page.goto('/');
	await page.waitForTimeout(500);
	await page.locator('input[name="bill-quantity"]').first().focus();
	await page.keyboard.down('Digit2');
	await page.keyboard.down('Enter');
	await page.waitForTimeout(500);
	const total = await page.locator('h1', { hasText: 'Total:' }).textContent();
	expect(total).toContain('400,00');
});

test('should add and clear observations', async ({ page }) => {
	await page.goto('/');
	await page.waitForTimeout(500);
	await page.getByPlaceholder('Observação').fill('Test observation');
	await page.getByTitle('Adicionar').click();
	await expect(page.getByText('1. Test observation')).toBeVisible();
	await page.getByTitle('Limpar').first().click();
	await expect(page.getByText('1. Test observation')).not.toBeVisible();
});

test('should navigate to trocar-notas page', async ({ page }) => {
	await page.goto('/');
	await page.waitForTimeout(500);
	await page.getByTitle('Trocar Notas').click();
	await expect(page).toHaveURL('/calculate-bills/trocar-notas');
	await expect(page.getByRole('heading', { name: 'Trocar Notas' })).toBeVisible();
});
