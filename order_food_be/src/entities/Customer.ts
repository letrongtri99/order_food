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
export class Customer extends BaseEntity {
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
  @Column()
  phone!: string


  @Field()
  @Column()
  district!: string

  @Field()
  @Column()
  address!: string

  @Field({ nullable: true })
  @Column({ default: 'male', nullable: true })
  gender?: string

  @Field()
  @Column({ default: '', nullable: true })
  avatarUrl: string

  @Field()
  @Column({ default: 1 })
  is_active: number

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date
}
