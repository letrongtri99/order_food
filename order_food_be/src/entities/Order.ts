import { ObjectType, Field } from 'type-graphql'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity
} from 'typeorm'

@ObjectType()
@Entity()
export class Order extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number

  @Field()
  @Column({ unique: true })
  order_id: string

  @Field()
  @Column()
  storeId: number

  @Field()
  @Column()
  customerId: number

  @Field({ nullable: true })
  @Column({ nullable: true })
  deliveryId?: number

  @Field()
  @Column({ type: 'decimal', precision: 15, scale: 12 })
  longtitude!: number

  @Field()
  @Column({ type: 'decimal', precision: 15, scale: 12 })
  latitude!: number

  @Field()
  @Column()
  address!: string

  @Field()
  @Column({ type: 'longtext' })
  order_detail: string

  @Field()
  @Column({ default: 0 })
  order_status: number

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0, })
  price!: number

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0, })
  shipping_fee!: number

  @Field()
  @Column({ nullable: true })
  notes: string

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  arrivedAt: Date

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  pickedAt: Date

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date
}
