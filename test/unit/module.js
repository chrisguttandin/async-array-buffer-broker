import { load, wrap } from '../../src/module';

describe('module', () => {
    let url;

    afterEach(() => {
        Worker.reset();
    });

    beforeEach(() => {
        // eslint-disable-next-line no-global-assign
        Worker = ((OriginalWorker) => {
            const instances = [];

            return class ExtendedWorker extends OriginalWorker {
                constructor(rl) {
                    super(rl);

                    const addEventListener = this.addEventListener;

                    // This is an ugly hack to prevent the broker from handling mirrored events.
                    this.addEventListener = (index, ...args) => {
                        if (typeof index === 'number') {
                            return addEventListener.apply(this, args);
                        }
                    };

                    instances.push(this);
                }

                static addEventListener(index, ...args) {
                    return instances[index].addEventListener(index, ...args);
                }

                static get instances() {
                    return instances;
                }

                static reset() {
                    // eslint-disable-next-line no-global-assign
                    Worker = OriginalWorker;
                }
            };
        })(Worker);

        const blob = new Blob(
            [
                `self.addEventListener('message', ({ data }) => {
                // The port needs to be send as a Transferable because it can't be cloned.
                if (data.params !== undefined && data.params.port !== undefined) {
                    self.postMessage(data, [ data.params.port ]);
                } else {
                    self.postMessage(data);
                }
            });`
            ],
            { type: 'application/javascript' }
        );

        url = URL.createObjectURL(blob);
    });

    for (const method of ['loaded', 'wrapped']) {
        describe(`with a ${method} worker`, () => {
            let asyncArrayBuffer;

            beforeEach(() => {
                if (method === 'loaded') {
                    asyncArrayBuffer = load(url);
                } else {
                    const worker = new Worker(url);

                    asyncArrayBuffer = wrap(worker);
                }

                URL.revokeObjectURL(url);
            });

            describe('allocate()', () => {
                let length;

                beforeEach(() => {
                    length = 1024;
                });

                it('should send the correct message', (done) => {
                    Worker.addEventListener(0, 'message', ({ data }) => {
                        expect(data.id).to.be.a('number');

                        expect(data).to.deep.equal({
                            id: data.id,
                            method: 'allocate',
                            params: { length }
                        });

                        done();
                    });

                    asyncArrayBuffer.allocate(length);
                });
            });

            describe('deallocate()', () => {
                let arrayBuffer;

                beforeEach(() => {
                    arrayBuffer = new ArrayBuffer(2048);
                });

                it('should send the correct message', (done) => {
                    Worker.addEventListener(0, 'message', ({ data }) => {
                        expect(data.params.arrayBuffer).to.be.an.instanceOf(ArrayBuffer);
                        expect(data.params.arrayBuffer.byteLength).to.equal(2048);

                        expect(data).to.deep.equal({
                            id: null,
                            method: 'deallocate',
                            params: {
                                arrayBuffer: data.params.arrayBuffer
                            }
                        });

                        done();
                    });

                    asyncArrayBuffer.deallocate(arrayBuffer);
                });
            });
        });
    }
});
