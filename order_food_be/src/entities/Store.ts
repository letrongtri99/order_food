import { Product } from './Product'
import { CategoryStore } from './CategoryStore'
import { ObjectType, Field } from 'type-graphql'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm'

@ObjectType()
@Entity()
export class Store extends BaseEntity {
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
  @Column({ unique: true })
  slug_name!: string

  @Field()
  @Column()
  phone!: string

  @Field()
  @Column()
  address!: string

  @Field()
  @Column()
  district!: string

  @Field()
  @Column()
  promotion: string

  @Field()
  @Column({ type: 'longtext', nullable: true })
  avatar: string

  @ManyToOne(() => CategoryStore, (categoryStore) => categoryStore.store)
  @JoinColumn({ name: 'categoryId' })
  category: CategoryStore

  @Column()
  categoryId: number

  @OneToMany(() => Product, (product) => product.store)
  product: Product[]

  @Field()
  @Column({ default: 1 })
  is_active: number

  @Field()
  @Column('int', { default: 0 })
  isDeleted: number

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date
}
