
export interface State {
    zIndex: number;
    windows: { title: string; children?: React.ReactNode; icon: string }[]
}

export interface IContext {
    state: State;
    setState: (newState: State) => void;
}