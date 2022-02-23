import { InputType, Field, Int } from 'type-graphql'
import { Filter, Paginator, Sorting } from '../types'

@InputType()
export class StateInput {
  @Field(() => FilterInput, { nullable: true })
  filter: Filter
  @Field(() => PaginatorInput, { nullable: true })
  paginator: Paginator
  @Field(() => SortingInput, { nullable: true })
  sorting: Sorting
  @Field(() => String, { nullable: true })
  searchTerm?: string
}

@InputType()
export class FilterInput {
  @Field(() => [String], { nullable: true })
  category?: string[]
  @Field(() => [String], { nullable: true })
  district?: string[]
  @Field(() => [Int], { nullable: true })
  order_status?: number[]
  @Field(() => String, { nullable: true })
  from_date?: string
  @Field(() => String, { nullable: true })
  to_date?: string
}

@InputType()
export class PaginatorInput {
  @Field(() => Int)
  page: number
  @Field(() => Int, { nullable: true })
  total: number
  @Field(() => Int)
  pageSize: number
}
@InputType()
export class SortingInput {
  @Field(() => String, { nullable: true })
  column: string
  @Field(() => String, { nullable: true })
  direction: string
}
