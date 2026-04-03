import { expect, test } from '@playwright/test';

test.describe('Modernization Features', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('./');
		// Esperar que o Svelte monte e hidrate o app
		await page.waitForSelector('.main-content[data-ready="true"]');
		await expect(page.getByRole('heading', { name: 'Calculadora' })).toBeVisible();
	});

	test('should open About modal and show developer link', async ({ page }) => {
		await page.getByRole('button', { name: 'Menu' }).click();
		await page.getByTitle('Sobre').click();
		await expect(page.getByRole('heading', { name: 'Sobre o Aplicativo' })).toBeVisible();
		await expect(page.getByText('Ver outros projetos')).toBeVisible();

		const developerLink = page.getByRole('link', { name: 'Ver outros projetos' });
		await expect(developerLink).toHaveAttribute('href', 'https://carloshatus.github.io/');
		await expect(developerLink).toHaveAttribute('target', '_blank');

		await page.getByRole('button', { name: 'Entendido' }).click();
		await expect(page.getByRole('heading', { name: 'Sobre o Aplicativo' })).not.toBeVisible();
	});

	test('should show Save and Clear option in Reset modal', async ({ page }) => {
		// Adicionar algum valor para ter o que salvar
		const input = page.locator('input[name="bill-quantity"]').first();
		await input.click();
		await input.fill('10');
		await page.getByRole('button', { name: 'Menu' }).click();
		await page.getByTitle('Limpar tudo').click();

		await expect(page.getByRole('heading', { name: 'Limpar tudo?' })).toBeVisible();
		await expect(
			page.getByText('Deseja salvar esta contagem no histórico antes de limpar tudo?')
		).toBeVisible();

		await expect(page.getByRole('button', { name: 'Salvar e Limpar' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Limpar sem salvar' })).toBeVisible();

		// Testar o cancelamento primeiro
		await page.getByRole('button', { name: 'Cancelar' }).click();
		await expect(page.getByRole('heading', { name: 'Limpar tudo?' })).not.toBeVisible();

		// O valor ainda deve estar lá
		await expect(page.locator('input[name="bill-quantity"]').first()).toHaveValue('10');
	});

	test('should allow editing page name', async ({ page }) => {
		await page.getByLabel('Editar nome').click();
		const input = page.locator('.page-title-input');
		await expect(input).toBeVisible();

		await input.click();
		await input.fill('Minha Contagem');
		await page.getByLabel('Confirmar').click();

		await expect(page.getByRole('heading', { name: 'Minha Contagem' })).toBeVisible({
			timeout: 10000
		});
	});

	test('should navigate to history and back', async ({ page }) => {
		await page.getByRole('button', { name: 'Menu' }).click();
		await page.getByTitle('Ver Histórico').click();
		await expect(page).toHaveURL(/historico/);
		await expect(page.getByRole('heading', { name: 'Histórico' })).toBeVisible();

		await page.getByTitle('Voltar').click();
		await expect(page).toHaveURL(/\/calculate-bills\/?$/);
	});
});
