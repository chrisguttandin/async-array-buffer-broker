import { IDefaultBrokerDefinition } from 'broker-factory';
import { IArrayBufferBrokerDefinition } from '../interfaces';

export type TArrayBufferBrokerWrapper = (sender: MessagePort | Worker) => IArrayBufferBrokerDefinition & IDefaultBrokerDefinition;
