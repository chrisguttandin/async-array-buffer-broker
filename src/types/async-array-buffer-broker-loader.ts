import { IDefaultBrokerDefinition } from 'broker-factory';
import { IAsyncArrayBufferBrokerDefinition } from '../interfaces';

export type TAsyncArrayBufferBrokerLoader = (url: string) => IAsyncArrayBufferBrokerDefinition & IDefaultBrokerDefinition;
