import { TArrayBufferWorkerDefinition } from 'async-array-buffer-worker';
import { createBroker } from 'broker-factory';
import { IArrayBufferBrokerDefinition } from './interfaces';
import { TArrayBufferBrokerLoader, TArrayBufferBrokerWrapper } from './types';

export * from './interfaces';
export * from './types';

export const wrap: TArrayBufferBrokerWrapper = createBroker<IArrayBufferBrokerDefinition, TArrayBufferWorkerDefinition>({
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

export const load: TArrayBufferBrokerLoader = (url: string) => {
    const worker = new Worker(url);

    return wrap(worker);
};
