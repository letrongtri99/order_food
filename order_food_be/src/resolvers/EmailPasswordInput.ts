import { InputType, Field } from 'type-graphql'
@InputType()
export class EmailPasswordInput {
  @Field()
  email: string
  @Field()
  password: string
  @Field({ nullable: true })
  district?: string
  @Field({ nullable: true })
  categoryId?: number
  @Field()
  longtitude!: number
  @Field()
  latitude!: number
  @Field()
  name!: string
  @Field()
  phone!: string
  @Field()
  address!: string
  @Field({ nullable: true })
  gender?: string
}
