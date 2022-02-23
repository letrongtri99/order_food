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
export class Delivery extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number

  @Field()
  @Column({ unique: true })
  email!: string

  @Column()
  password!: string

  @Field()
  @Column({ type: 'decimal', precision: 15, scale: 12 })
  longtitude!: number

  @Field()
  @Column({ type: 'decimal', precision: 15, scale: 12 })
  latitude!: number

  @Field()
  @Column()
  name!: string

  @Field()
  @Column({ nullable: true })
  last_notify!: Date

  @Field()
  @Column()
  phone!: string

  @Field()
  @Column()
  address!: string

  @Field()
  @Column()
  gender!: string

  @Field()
  @Column({ default: '', nullable: true })
  avatarUrl: string

  @Field()
  @Column({ default: 0 })
  is_active: number

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date
}
