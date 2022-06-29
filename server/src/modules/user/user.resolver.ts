import { ApolloError } from "apollo-server-core";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import argon2 from "argon2";

import { Context } from "../../server";
import { RegisterUserInput, LoginUserInput, User } from "./user.dto";
import { findUserOrEmail, registerUser } from "./user.service";

@Resolver(of => User)
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

    @Mutation(() => String)
    async loginUser(@Arg('input') input: LoginUserInput, @Ctx() ctx: Context) {

        const user = await findUserOrEmail(input.emailOrUsername.toLowerCase());

        if (!user) {
            throw new ApolloError('User not found');
        }
        
        const isValid = await argon2.verify(user!.password, input.password);

        if (!isValid) {
            throw new ApolloError('Invalid password');
        }

        const token = await ctx.reply?.jwtSign({
            id: user.id,
            username: user.username,
            email: user.email,
        });

        if (!token) {
            throw new ApolloError("Error signing token");
        }

        ctx.reply?.setCookie('token', token, {
            maxAge: 1000 * 60 * 60 * 24 * 365,
            secure: process.env.NODE_ENV === 'production',
            domain: "localhost",
            path: "/",
            httpOnly: true,
            sameSite: false,
        })

        return token
    }

    @Query(() => User)
    async me(@Ctx() ctx: Context) {
        return ctx.user
    }
}

export default UserResolver;