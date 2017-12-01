import {
    IAllocateRequest,
    IAllocateResponse,
    IConnectRequest,
    IDeallocateNotification,
    IDisconnectRequest,
    IWorkerEvent
} from 'async-array-buffer-worker';
import { addUniqueNumber } from 'fast-unique-numbers';

export const wrap = (worker: MessagePort | Worker) => {
    const ongoingRequests: Set<number> = new Set();

    const allocate = (length: number): Promise<ArrayBuffer> => {
        return new Promise((resolve, reject) => {
            const id = addUniqueNumber(ongoingRequests);

            const onMessage = ({ data }: IWorkerEvent) => {
                if (data.id === id) {
                    ongoingRequests.delete(id);

                    worker.removeEventListener('message', onMessage);

                    if (data.error === null) {
                        resolve((<IAllocateResponse> data).result.arrayBuffer);
                    } else {
                        reject(new Error(data.error.message));
                    }
                }
            };

            worker.addEventListener('message', onMessage);

            worker.postMessage(<IAllocateRequest> { id, method: 'allocate', params: { length } });
        });
    };

    const connect = (port: MessagePort): Promise<void> => {
        return new Promise((resolve, reject) => {
            const id = addUniqueNumber(ongoingRequests);

            const onMessage = ({ data }: IWorkerEvent) => {
                if (data.id === id) {
                    ongoingRequests.delete(id);

                    worker.removeEventListener('message', onMessage);

                    if (data.error === null) {
                        resolve();
                    } else {
                        reject(new Error(data.error.message));
                    }
                }
            };

            worker.addEventListener('message', onMessage);

            worker.postMessage(<IConnectRequest> { id, method: 'connect', params: { port } }, [ port ]);
        });
    };

    const deallocate = (arrayBuffer: ArrayBuffer) => {
        worker.postMessage(<IDeallocateNotification> { id: null, method: 'deallocate', params: { arrayBuffer } }, [ arrayBuffer ]);
    };

    const disconnect = (port: MessagePort): Promise<void> => {
        return new Promise((resolve, reject) => {
            const id = addUniqueNumber(ongoingRequests);

            const onMessage = ({ data }: IWorkerEvent) => {
                if (data.id === id) {
                    ongoingRequests.delete(id);

                    worker.removeEventListener('message', onMessage);

                    if (data.error === null) {
                        resolve();
                    } else {
                        reject(new Error(data.error.message));
                    }
                }
            };

            worker.addEventListener('message', onMessage);

            worker.postMessage(<IDisconnectRequest> { id, method: 'disconnect', params: { port } }, [ port ]);
        });
    };

    return {
        allocate,
        connect,
        deallocate,
        disconnect
    };
};

export const load = (url: string) => {
    const worker = new Worker(url);

    return wrap(worker);
};
