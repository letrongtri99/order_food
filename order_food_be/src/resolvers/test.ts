import { Test } from './../entities/Test';
import { Resolver, Query } from "type-graphql";

@Resolver()
export class TestResolver {
    @Query(() => [Test])
    async test(): Promise<Test[]> {
        return Test.find();
    }
}