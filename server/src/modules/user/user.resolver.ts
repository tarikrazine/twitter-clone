import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Context } from "../../server";

import { RegisterUserInput, User } from "./user.dto";
import { registerUser } from "./user.service";

@Resolver(() => User)
class UserResolver {

    @Mutation(() => User)
    async registerUser(@Arg('input') input: RegisterUserInput) {
        try {
            const user = await registerUser(input);

            return user;
        } catch (e) {
            throw e
        }
    }

    @Query(() => User)
    async me(@Ctx() context: Context) {
        return context.user
    }
}

export default UserResolver;