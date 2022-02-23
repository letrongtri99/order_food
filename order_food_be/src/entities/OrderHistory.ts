
import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  JoinColumn,
  OneToOne
} from "typeorm";
import { Order } from "./Order";

@ObjectType()
@Entity()
export class OrderHistory extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Order)
  @JoinColumn()
  order: Order;

  @Field()
  @Column({default: 0})
  status: number
  
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}