
import {
  fetchIngredients,
  ingredientsReducer,
} from './ingredientsSlice';

import type { TIngredient } from '@utils-types';

const testIngredients: TIngredient[] = [
  {
    _id: 'ingredient-1',
    name: 'Тестовая булка',
    type: 'bun',
    proteins: 10,
    fat: 5,
    carbohydrates: 20,
    calories: 200,
    price: 100,
    image: 'bun.png',
    image_large: 'bun-large.png',
    image_mobile: 'bun-mobile.png',
  },
  {
    _id: 'ingredient-2',
    name: 'Тестовая начинка',
    type: 'main',
    proteins: 15,
    fat: 8,
    carbohydrates: 12,
    calories: 180,
    price: 200,
    image: 'main.png',
    image_large: 'main-large.png',
    image_mobile: 'main-mobile.png',
  },
];

describe('ingredientsSlice', () => {
  
  it('возвращает начальное состояние для неизвестного экшена', () => {
    const state = ingredientsReducer(undefined, {
      type: 'UNKNOWN',
    });

    expect(state).toEqual({
      ingredients: [],
      isLoading: false,
      error: null,
    });
  });

  it('обрабатывает fetchIngredients.pending', () => {
    const state = ingredientsReducer(
      undefined,
      fetchIngredients.pending('request-id')
    );

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('обрабатывает fetchIngredients.fulfilled', () => {
    const state = ingredientsReducer(
      undefined,
      fetchIngredients.fulfilled(testIngredients, 'request-id', undefined)
    );

    expect(state.isLoading).toBe(false);
    expect(state.ingredients).toEqual(testIngredients);
  });

  it('обрабатывает fetchIngredients.rejected', () => {
    const state = ingredientsReducer(
      undefined,
      fetchIngredients.rejected(
        new Error('Ошибка загрузки'),
        'request-id',
        undefined
      )
    );

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Ошибка загрузки');
  });
});