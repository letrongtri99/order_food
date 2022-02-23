import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne
} from "typeorm";
import { Store } from "./Store";

@ObjectType()
@Entity()
export class Product extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Store, store => store.product)
  store: Store;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column()
  category!: string;

  @Field({ nullable: true })
  @Column({ type: 'longtext', nullable: true })
  description!: string;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0, })
  price!: number

  @Field({ nullable: true })
  @Column({ nullable: true })
  sale?: string;

  @Field()
  @Column('int', { default: 0 })
  isDeleted: number

  @Field({ nullable: true })
  @Column({ nullable: true })
  comment: string;

  @Field()
  @Column({ type: 'longtext', nullable: true })
  imgUrl: string;

  @Field({ nullable: true })
  @Column({ type: 'int', nullable: true })
  sold: number;

  @Field({ nullable: true })
  @Column({ type: 'int', nullable: true, default: 0 })
  quantity: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}