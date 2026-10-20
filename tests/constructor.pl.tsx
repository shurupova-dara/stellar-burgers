import { expect, test } from '@playwright/test';

test.describe('Конструктор Stellar Burgers', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('./tests/hars/api.har', {
      url: '**/api/**',
    });

    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
      document.cookie = 'accessToken=test-access-token; path=/';
    });

    await page.goto('/');
  });

  test('добавляет булку сверху и снизу конструктора', async ({ page }) => {
    const bunCard = page
      .locator('li')
      .filter({ hasText: 'Тестовая булка' })
      .filter({ has: page.getByRole('button', { name: 'Добавить' }) });

    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    await expect(page.getByText('Тестовая булка (верх)')).toBeVisible();
    await expect(page.getByText('Тестовая булка (низ)')).toBeVisible();
  });

  test('добавляет начинку в конструктор', async ({ page }) => {
    const mainCard = page
      .locator('li')
      .filter({ has: page.getByText('Тестовая начинка', { exact: true }) })
      .filter({ has: page.getByRole('button', { name: 'Добавить' }) });

    await mainCard.getByRole('button', { name: 'Добавить' }).click();

    await expect(page.getByText('Тестовая начинка200')).toBeVisible();
  });

  test('удаляет выбранную начинку, сохраняя остальные', async ({ page }) => {
    const firstCard = page
      .locator('li')
      .filter({ has: page.getByText('Тестовая начинка', { exact: true }) })
      .filter({ has: page.getByRole('button', { name: 'Добавить' }) });

    const secondCard = page
      .locator('li')
      .filter({ hasText: 'Вторая тестовая начинка' })
      .filter({ has: page.getByRole('button', { name: 'Добавить' }) });

    await firstCard.getByRole('button', { name: 'Добавить' }).click();
    await secondCard.getByRole('button', { name: 'Добавить' }).click();

    const constructor = page.locator('section').filter({
      has: page.getByRole('button', { name: 'Оформить заказ' }),
    });

    await expect(
      constructor.getByText('Тестовая начинка', { exact: true })
    ).toBeVisible();

    await expect(
      constructor.getByText('Вторая тестовая начинка', { exact: true })
    ).toBeVisible();

    const firstIngredient = constructor
      .getByText('Тестовая начинка', { exact: true })
      .locator('xpath=ancestor::li');

    await firstIngredient.locator('.constructor-element__action svg').click();

    await expect(
      constructor.getByText('Тестовая начинка', { exact: true })
    ).not.toBeVisible();

    await expect(
      constructor.getByText('Вторая тестовая начинка', { exact: true })
    ).toBeVisible();
  });

  test('открывает модалку с деталями выбранного ингредиента', async ({ page }) => {
    const mainCard = page
      .locator('li')
      .filter({
        has: page.getByText('Вторая тестовая начинка', { exact: true }),
      })
      .filter({ has: page.getByRole('button', { name: 'Добавить' }) });

    await mainCard.locator('a').click();

    const modal = page.locator('#modals');

    await expect(modal.getByText('Детали ингредиента')).toBeVisible();
    await expect(
      modal.getByText('Вторая тестовая начинка', { exact: true })
    ).toBeVisible();
    await expect(modal.getByText('20', { exact: true })).toBeVisible();
    await expect(modal.getByText('10', { exact: true })).toBeVisible();
    await expect(modal.getByText('15', { exact: true })).toBeVisible();
    await expect(modal.getByText('220', { exact: true })).toBeVisible();
  });

  test('закрывает модалку крестиком', async ({ page }) => {
    const ingredientCard = page
      .locator('li')
      .filter({ hasText: 'Тестовая булка' })
      .locator('a');

    await ingredientCard.click();

    const modal = page.locator('#modals');

    await expect(modal.getByText('Детали ингредиента')).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть' }).click();

    await expect(modal.getByText('Детали ингредиента')).not.toBeVisible();
  });

  test('закрывает модалку кликом по оверлею', async ({ page }) => {
    const ingredientCard = page
      .locator('li')
      .filter({ hasText: 'Тестовая булка' })
      .locator('a');

    await ingredientCard.click();

    const modal = page.locator('#modals');

    await expect(modal.getByText('Детали ингредиента')).toBeVisible();

    await modal
      .locator('div')
      .last()
      .click({ position: { x: 5, y: 5 } });

    await expect(modal.getByText('Детали ингредиента')).not.toBeVisible();
  });

  test('оформляет заказ, показывает его номер и очищает конструктор', async ({
    page,
  }) => {
    const bunCard = page
      .locator('li')
      .filter({ hasText: 'Тестовая булка' })
      .filter({ has: page.getByRole('button', { name: 'Добавить' }) });

    const mainCard = page
      .locator('li')
      .filter({ has: page.getByText('Тестовая начинка', { exact: true }) })
      .filter({ has: page.getByRole('button', { name: 'Добавить' }) });

    await bunCard.getByRole('button', { name: 'Добавить' }).click();
    await mainCard.getByRole('button', { name: 'Добавить' }).click();

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    const modal = page.locator('#modals');

    await expect(modal.getByText('12345')).toBeVisible();

    await expect(page.getByText('Выберите булки').first()).toBeVisible();
    await expect(page.getByText('Выберите начинку')).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть' }).click();

    await expect(modal.getByText('12345')).not.toBeVisible();
  });
});
