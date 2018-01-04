import { IBrokerDefinition } from 'broker-factory';

export interface IAsyncArrayBufferBrokerDefinition extends IBrokerDefinition {

    allocate (length: number): Promise<ArrayBuffer>;

    deallocate (arrayBuffer: ArrayBuffer): void;

}
