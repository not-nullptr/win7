import { createContext } from "react";
import { IContext } from "../types/State";

export const Context = createContext<IContext>({} as IContext);