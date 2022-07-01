import { Length } from "class-validator";
import { Field, ID, InputType, ObjectType } from "type-graphql";
import { User } from "../user/user.dto";

@ObjectType()
export class Message {
    @Field(() => ID, { nullable: false })
    id: string;
    
    @Field(() => String, { nullable: false })
    text: string;
    
    @Field(() => User, { nullable: false })
    user: string;

    @Field(() => String, { nullable: false })
    userId: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}

@InputType()
export class CreateMessageInput {
    @Length(6, 255)
    @Field(() => String, { nullable: false })
    text: string;

    userId: string;
}