import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";

import { Context } from "../../server";
import { findUserById } from "../user/user.service";
import { CreateMessageInput, Message } from "./message.dto";
import { createMessage, getAllMessages } from "./message.service";

@Resolver(() => Message)
class MessageResolver {

    @Authorized()
    @Mutation(() => Message)
    async createMessage(@Arg("input") input: CreateMessageInput, @Ctx() ctx: Context) {

        const message =  await createMessage({input, userId: ctx.user?.id!});

        return message;
    }

    @Authorized()
    @Query(() => [Message])
    async messages() {
        return getAllMessages();
    }

    @FieldResolver()
    async user(@Root()  message: Message) {
        return findUserById(message.userId);
    }
}

export default MessageResolver