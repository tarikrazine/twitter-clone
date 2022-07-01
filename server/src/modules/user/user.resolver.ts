import { ApolloError } from "apollo-server-core";
import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import argon2 from "argon2";

import { Context } from "../../server";
import { RegisterUserInput, LoginUserInput, User, UserFollowers, UserFollowInput } from "./user.dto";
import { findUserOrEmail, registerUser, followingUser, getAllUsers, findUserFollowing, findUserFollowers, unFollowingUser } from "./user.service";

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

    @Authorized()
    @Query(() => User)
    async me(@Ctx() ctx: Context) {
        return ctx.user
    }

    @Authorized()
    @Query(() => [User])
    async users() {
        return getAllUsers()
    }

    @Authorized()
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

    @Authorized()
    @Mutation(() => User)
    async unFollowUser(@Arg('input') input: UserFollowInput, 
    @Ctx() ctx: Context) {
        try {

            const user = ctx.user

            const result = await unFollowingUser({
                id: user?.id!,
                username: input.username,
            })

            return result

        } catch (e: any) {
            throw new ApolloError(e)
        }
    }

    @FieldResolver(() => UserFollowers)
    async followers(@Root() user: User) {

        const followersUser = await findUserFollowers(user.id)

        return {
            count: followersUser?.followedBy?.length || 0,
            items: followersUser?.followedBy || [],
        }
    }

    @FieldResolver(() => UserFollowers)
    async following(@Root() user: User) {

        const followingUser = await findUserFollowing(user.id)

        return {
            count: followingUser?.following?.length || 0,
            items: followingUser?.following || [],
        }
    }
}

export default UserResolver;