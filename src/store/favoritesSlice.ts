import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FavoriteItem {
  id: number;
  title: string;
  poster_path: string;
  media_type: "movie" | "tv";
}

interface FavoritesState {
  items: FavoriteItem[];
}

const initialState: FavoritesState = {
  items: [],
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<FavoriteItem>) => {
      const index = state.items.findIndex(
        (item) =>
          item.id === action.payload.id &&
          item.media_type === action.payload.media_type,
      );

      if (index >= 0) {
        // remove if exists
        state.items.splice(index, 1);
      } else {
        // add if not exists
        state.items.push(action.payload);
      }
    },
    clearFavorites: (state) => {
      state.items = [];
    },
  },
});

export const { toggleFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
