import { getFeedsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TOrder } from '@utils-types';

type TFeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  isLoading: boolean;
  error: string | null;
};

const initialState: TFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null,
};

export const fetchFeeds = createAsyncThunk(
  'feed/fetchFeeds',
  async () => await getFeedsApi()
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(fetchFeeds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Ошибка загрузки ленты';
      });
  },
});

export const feedReducer = feedSlice.reducer;

export const selectFeedOrders = (state: { feed: TFeedState }): TOrder[] =>
  state.feed.orders;

export const selectFeedTotal = (state: { feed: TFeedState }): number => state.feed.total;

export const selectFeedTotalToday = (state: { feed: TFeedState }): number =>
  state.feed.totalToday;

export const selectFeedLoading = (state: { feed: TFeedState }): boolean =>
  state.feed.isLoading;
