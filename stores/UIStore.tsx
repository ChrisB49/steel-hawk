import { makeAutoObservable } from "mobx";

class UIStore {
    greenThreshold: number = 200; // Default threshold value

    constructor() {
        makeAutoObservable(this);
    }

    setGreenThreshold(value: number) {
        this.greenThreshold = value;
    }

    getGreenThreshold() {
        return this.greenThreshold;
    }
}

export const uiStore = new UIStore();