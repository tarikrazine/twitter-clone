import { ApolloError } from "apollo-server-core";
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver } from "type-graphql";
import argon2 from "argon2";

import { Context } from "../../server";
import { RegisterUserInput, LoginUserInput, User, UserFollowers, UserFollowInput } from "./user.dto";
import { findUserOrEmail, registerUser, followingUser, getAllUsers } from "./user.service";

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

    @Query(() => [User])
    async users() {
        return getAllUsers()
    }

    @Mutation(() => User)
    async followUser(@Arg('input') input: UserFollowInput, 
    @Ctx() ctx: Context) {
        try {

            const user = ctx.user

            const result = await followingUser({
                id: user?.id!,
                username: input.username,
            })

            return result

        } catch (e: any) {
            throw new ApolloError(e)
        }
    }

    @FieldResolver(() => UserFollowers)
    async followers(@Ctx() ctx: Context) {
        return {
            count: 0,
            items: [],
        }
    }

    @FieldResolver(() => UserFollowers)
    async following(@Ctx() ctx: Context) {
        return {
            count: 0,
            items: [],
        }
    }
}

export default UserResolver;