import { IBrokerDefinition } from 'broker-factory';

export interface IArrayBufferBrokerDefinition extends IBrokerDefinition {

    allocate (length: number): Promise<ArrayBuffer>;

    deallocate (arrayBuffer: ArrayBuffer): void;

}
