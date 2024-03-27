import { makeAutoObservable } from "mobx";

class UIStore {
    confidenceDisplayThreshold: number = 0.85;
    constructor() {
        makeAutoObservable(this);
    }

    setconfidenceDisplayThreshold(value: number) {
        this.confidenceDisplayThreshold = value;
    }

    getconfidenceDisplayThreshold() {
        return this.confidenceDisplayThreshold;
    }
}

export const uiStore = new UIStore();