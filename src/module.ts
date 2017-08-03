import { IAllocateRequest, IAllocateResponse, IDeallocateNotification, IWorkerEvent } from 'async-array-buffer-worker';

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;

const generateUniqueId = (set: Set<number>) => {
    let id = Math.round(Math.random() * MAX_SAFE_INTEGER);

    while (set.has(id)) {
        id = Math.round(Math.random() * MAX_SAFE_INTEGER);
    }

    return id;
};

export const load = (url: string) => {
    const worker = new Worker(url);

    const ongoingRequests: Set<number> = new Set();

    const allocate = (length: number): Promise<ArrayBuffer> => {
        return new Promise((resolve, reject) => {
            const id = generateUniqueId(ongoingRequests);

            ongoingRequests.add(id);

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

    const deallocate = (arrayBuffer: ArrayBuffer) => {
        worker.postMessage(<IDeallocateNotification> { id: null, method: 'deallocate', params: { arrayBuffer } }, [ arrayBuffer ]);
    };

    return {
        allocate,
        deallocate
    };
};
