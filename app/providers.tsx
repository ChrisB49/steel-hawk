'use client'
import React from 'react';
import { StoreContext } from '../stores/StoreContext'; // Adjust the path as necessary
import { RootStore } from '../stores/RootStore'; // Adjust the path as necessary
import { ChakraProvider } from "@chakra-ui/react";

const rootStore = new RootStore();

export const StoreProvider: React.FC<{ store: RootStore, children: React.ReactNode }> = ({ store, children }) => {
    return <StoreContext.Provider value={store}> {children} </StoreContext.Provider>;
};

export const useStore = () => {
    const store = React.useContext(StoreContext);
    if (!store) {
        throw new Error('You have forgot to use StoreProvider, shame on you.');
    }
    return store;
}
export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <ChakraProvider>
            {/* Wrap your app in the StoreProvider to make the store available down the component tree */}
            <StoreProvider store={rootStore}>
                {children}
            </StoreProvider>
        </ChakraProvider>
    );
};
