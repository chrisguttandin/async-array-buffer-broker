import { TAsyncArrayBufferWorkerDefinition } from 'async-array-buffer-worker';
import { createBroker } from 'broker-factory';
import { IAsyncArrayBufferBrokerDefinition } from './interfaces';
import { TAsyncArrayBufferBrokerLoader, TAsyncArrayBufferBrokerWrapper } from './types';

/*
 * @todo Explicitly referencing the barrel file seems to be necessary when enabling the
 * isolatedModules compiler option.
 */
export * from './interfaces/index';
export * from './types/index';

export const wrap: TAsyncArrayBufferBrokerWrapper = createBroker<IAsyncArrayBufferBrokerDefinition, TAsyncArrayBufferWorkerDefinition>({
    allocate: ({ call }) => {
        return async (length) => {
            return call('allocate', { length });
        };
    },
    deallocate: ({ notify }) => {
        return (arrayBuffer) => {
            notify('deallocate', { arrayBuffer }, [ arrayBuffer ]);
        };
    }
});

export const load: TAsyncArrayBufferBrokerLoader = (url: string) => {
    const worker = new Worker(url);

    return wrap(worker);
};
