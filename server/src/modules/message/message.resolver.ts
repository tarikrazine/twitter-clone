import { Arg, Authorized, Ctx, FieldResolver, Mutation, PubSub, PubSubEngine, Query, Resolver, Root, Subscription } from "type-graphql";

import { Context } from "../../server";
import { findUserById } from "../user/user.service";
import { CreateMessageInput, Message } from "./message.dto";
import { createMessage, getAllMessages } from "./message.service";

@Resolver(() => Message)
class MessageResolver {

    @Authorized()
    @Mutation(() => Message)
    async createMessage(
        @Arg("input") input: CreateMessageInput, 
        @Ctx() ctx: Context,
        @PubSub() pubsub: PubSubEngine
        ) {

        const message =  await createMessage({input, userId: ctx.user?.id!});

        await pubsub.publish("NEW_MESSAGE", {
            newMessage: message
        });

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

    @Subscription(() => Message, {      
        topics: "NEW_MESSAGE"} )
    newMessage(@Root() message: Message) {
        return message;
    }
}

export default MessageResolver