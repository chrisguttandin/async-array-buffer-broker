import { IDefaultBrokerDefinition } from 'broker-factory';
import { IAsyncArrayBufferBrokerDefinition } from '../interfaces';

export type TAsyncArrayBufferBrokerWrapper = (sender: MessagePort | Worker) => IAsyncArrayBufferBrokerDefinition & IDefaultBrokerDefinition;
