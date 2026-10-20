
import {
  constructorReducer,
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} from './constructorSlice';

import type { TIngredient } from '@utils-types';

const bun: TIngredient = {
  _id: 'bun-1',
  name: 'Булка',
  type: 'bun',
  proteins: 10,
  fat: 5,
  carbohydrates: 20,
  calories: 200,
  price: 100,
  image: 'bun.png',
  image_large: 'bun-large.png',
  image_mobile: 'bun-mobile.png'
};

const filling: TIngredient = {
  _id: 'filling-1',
  name: 'Начинка',
  type: 'main',
  proteins: 15,
  fat: 8,
  carbohydrates: 12,
  calories: 180,
  price: 200,
  image: 'filling.png',
  image_large: 'filling-large.png',
  image_mobile: 'filling-mobile.png'
};

describe('constructorSlice', () => {
    it('возвращает начальное состояние для неизвестного экшена', () => {
    const state = constructorReducer(undefined, {
      type: 'UNKNOWN',
    });

    expect(state).toEqual({
      bun: null,
      ingredients: [],
    });
  });
  
  it('добавляет булку в конструктор', () => {
    const state = constructorReducer(undefined, addIngredient(bun));

    expect(state.bun).toMatchObject(bun);
    expect(state.bun?.id).toBeDefined();
    expect(state.ingredients).toEqual([]);
  });

  it('добавляет начинку в конструктор', () => {
    const state = constructorReducer(undefined, addIngredient(filling));

    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0]).toMatchObject(filling);
    expect(state.ingredients[0].id).toBeDefined();
  });

  it('удаляет выбранный экземпляр начинки по id', () => {
    const withFirst = constructorReducer(undefined, addIngredient(filling));
    const withBoth = constructorReducer(withFirst, addIngredient(filling));
    const [first, second] = withBoth.ingredients;

    const state = constructorReducer(withBoth, removeIngredient(first.id));

    expect(state.ingredients).toEqual([second]);
  });

  it('меняет порядок начинок', () => {
    const first = {
      ...filling,
      _id: 'first',
      id: 'first-id'
    };
    const second = {
      ...filling,
      _id: 'second',
      id: 'second-id'
    };

    const initialState = {
      bun: null,
      ingredients: [first, second]
    };

    const state = constructorReducer(
      initialState,
      moveIngredient({ from: 0, to: 1 })
    );

    expect(state.ingredients.map((item) => item.id)).toEqual([
      'second-id',
      'first-id'
    ]);
  });

  it('очищает конструктор', () => {
    const withBun = constructorReducer(undefined, addIngredient(bun));
    const withIngredients = constructorReducer(
      withBun,
      addIngredient(filling)
    );

    const state = constructorReducer(
      withIngredients,
      clearConstructor()
    );

    expect(state.bun).toBeNull();
    expect(state.ingredients).toEqual([]);
  });
});
