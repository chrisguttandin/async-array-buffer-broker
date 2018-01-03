import { IDefaultBrokerDefinition } from 'broker-factory';
import { IArrayBufferBrokerDefinition } from '../interfaces';

export type TArrayBufferBrokerLoader = (url: string) => IArrayBufferBrokerDefinition & IDefaultBrokerDefinition;
