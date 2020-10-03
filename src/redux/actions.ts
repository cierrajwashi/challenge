export enum ActionTypes {
  SET_ITEMS = 0,
  TIC = 1,
  INIT = 2,
  RESET = 3,
  SET_ITERATIONS,
}

export const initGame = () => ({
  type: ActionTypes.INIT,
  payload: {},
});

export const setIterations = () => ({
  type: ActionTypes.SET_ITERATIONS,
  payload: {},
});

export const resetScore = () => ({
  type: ActionTypes.RESET,
  payload: {},
});

export const setItems = (items: GameBoardItem[][]) => ({
  type: ActionTypes.SET_ITEMS,
  payload: {
    items,
  },
});

export const tic = () => ({
  type: ActionTypes.TIC,
  payload: {},
});
