import { configureStore } from "@reduxjs/toolkit";
import caseReducer from "../features/case/caseSlice";
import childrenReducer from "../features/children/childrenSlice";

export const store = configureStore({
  reducer: {
    case: caseReducer,
    children: childrenReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
