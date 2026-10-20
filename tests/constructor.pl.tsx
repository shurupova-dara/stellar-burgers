import { expect, test } from '@playwright/test';

const testIngredients = [
  {
    _id: 'bun-test-1',
    name: 'Тестовая булка',
    type: 'bun',
    proteins: 10,
    fat: 5,
    carbohydrates: 20,
    calories: 200,
    price: 100,
    image: 'https://example.com/bun.png',
    image_large: 'https://example.com/bun-large.png',
    image_mobile: 'https://example.com/bun-mobile.png',
  },
  {
    _id: 'main-test-1',
    name: 'Тестовая начинка',
    type: 'main',
    proteins: 15,
    fat: 8,
    carbohydrates: 12,
    calories: 180,
    price: 200,
    image: 'https://example.com/main.png',
    image_large: 'https://example.com/main-large.png',
    image_mobile: 'https://example.com/main-mobile.png',
  },
];

test.describe('Конструктор Stellar Burgers', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/api/ingredients',
    });

    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
      document.cookie = 'accessToken=test-access-token; path=/';
    });

    await page.route('**/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            email: 'test@example.com',
            name: 'Тестовый пользователь',
          },
        }),
      });
    });

    await page.route('**/api/orders', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          name: 'Тестовый бургер',
          order: {
            _id: 'test-order-id',
            ingredients: ['bun-test-1', 'main-test-1', 'bun-test-1'],
            status: 'done',
            name: 'Тестовый бургер',
            createdAt: '2026-10-20T08:00:00.000Z',
            updatedAt: '2026-10-20T08:00:00.000Z',
            number: 12345,
          },
        }),
      });
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
      .filter({ hasText: 'Тестовая начинка' })
      .filter({ has: page.getByRole('button', { name: 'Добавить' }) });

    await mainCard.getByRole('button', { name: 'Добавить' }).click();

    await expect(page.getByText('Тестовая начинка200')).toBeVisible();
  });

  test('открывает модалку с деталями выбранного ингредиента', async ({ page }) => {
    const ingredientCard = page
      .locator('li')
      .filter({ hasText: 'Тестовая булка' })
      .locator('a');

    await ingredientCard.click();

    const modal = page.locator('#modals');
    await expect(modal.getByText('Детали ингредиента')).toBeVisible();
    await expect(modal.getByText('Тестовая булка')).toBeVisible();
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
      .filter({ hasText: 'Тестовая начинка' })
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
