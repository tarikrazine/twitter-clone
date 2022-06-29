import { IsEmail, Length } from "class-validator";
import { Field, ID, InputType, ObjectType } from "type-graphql";

@ObjectType()
export class User {
    @Field(() => ID, { nullable: false })
    id: string

    @Field(() => String, { nullable: false })
    username: string

    @Field(() => String, { nullable: false })
    email: string

    password: string
}

@InputType()
export class RegisterUserInput {
    @Field(() => String, { nullable: false })
    username: string

    @Field()
    @IsEmail()
    email: string

    @Field()
    @Length(8, 56)
    password: string
}

@InputType()
export class LoginUserInput {
    @Field({ nullable: false })
    emailOrUsername: string

    @Field()
    @Length(8, 56)
    password: string
}

@ObjectType()
export class UserFollowers {
    @Field()
    count: number

    @Field(() => [User])
    items: User[]
}

@InputType()
export class UserFollowInput {
    @Field()
    username: string
}
