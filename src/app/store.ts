import { configureStore } from "@reduxjs/toolkit";
import caseReducer from "../features/case/caseSlice";
import childrenReducer from "../features/children/childrenSlice";
import uiReducer from "../features/ui/uiSlice";


export const store = configureStore({
  reducer: {
    case: caseReducer,
    children: childrenReducer,
    ui: uiReducer,          
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
