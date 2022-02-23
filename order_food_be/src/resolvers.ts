import { DeliveryResolver } from './resolvers/delivery';
import { OrderResolver } from './resolvers/order';
import { StoreResolver } from './resolvers/store';
import { NonEmptyArray } from 'type-graphql';
import { CustomerResolver } from './resolvers/Customer';
import { ProductResolver } from './resolvers/product';


export const RESOLVERS: NonEmptyArray<Function> | NonEmptyArray<string> = [ProductResolver, CustomerResolver, StoreResolver, OrderResolver, DeliveryResolver]