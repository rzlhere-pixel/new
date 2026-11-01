import { createContext, useContext } from "react";
import type { Item } from "@/data/menu.types";

/** Page-level sheets opened from a row, so 218 rows share one sheet each. */
export interface MenuActions {
  chooseOption: (item: Item) => void;
  showPhoto: (item: Item) => void;
}

export const MenuActionsContext = createContext<MenuActions>({
  chooseOption: () => {},
  showPhoto: () => {},
});

export const useMenuActions = () => useContext(MenuActionsContext);
