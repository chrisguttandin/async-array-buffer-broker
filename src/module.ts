import { TAsyncArrayBufferWorkerDefinition } from 'async-array-buffer-worker';
import { createBroker } from 'broker-factory';
import { IAsyncArrayBufferBrokerDefinition } from './interfaces';
import { TAsyncArrayBufferBrokerLoader, TAsyncArrayBufferBrokerWrapper } from './types';

export * from './interfaces';
export * from './types';

export const wrap: TAsyncArrayBufferBrokerWrapper = createBroker<IAsyncArrayBufferBrokerDefinition, TAsyncArrayBufferWorkerDefinition>({
    allocate: ({ call }) => {
        return async (length: number): Promise<ArrayBuffer> => {
            return call('allocate', { length });
        };
    },
    deallocate: ({ notify }) => {
        return (arrayBuffer: ArrayBuffer): void => {
            notify('deallocate', { arrayBuffer }, [ arrayBuffer ]);
        };
    }
});

export const load: TAsyncArrayBufferBrokerLoader = (url: string) => {
    const worker = new Worker(url);

    return wrap(worker);
};
