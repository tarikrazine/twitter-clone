import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { ApolloServer } from "apollo-server-fastify";
import { buildSchema } from "type-graphql";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { ApolloServerPlugin } from "apollo-server-plugin-base";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, GraphQLSchema, subscribe } from "graphql";
import fastifyCors from "@fastify/cors"
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";

import UserResolver from "./modules/user/user.resolver";
import { User } from "@prisma/client";
import { bearerAuthChecker } from "./utils/BearerAuthChecker";
import MessageResolver from "./modules/message/message.resolver";

const app = fastify({
    logger: true,
})

app.register(fastifyCors, {
    credentials: true,
    origin: (origin: any, callback: any) => {
        if (!origin || ['http://localhost:3000', 'https://studio.apollographql.com'].includes(origin)) {
            return callback(null, true)
        }

        return callback(new Error('Not allowed by CORS'), false)
    }
})

app.register(fastifyCookie, {
    parseOptions: {},
});

app.register(fastifyJwt, {
    secret: "change-me",
    cookie: {
        cookieName: "token",
        signed: false,
    }
})

type CtxUser = Omit<User, 'password'>

async function buildContext({
    request,
    reply,
    connectionParams
}: {
    request?: FastifyRequest,
    reply?: FastifyReply,
    connectionParams?: {
        Authorization: string
    }
}) {

    if (connectionParams || !request) {

        try {
            return {
                user: app.jwt.verify<CtxUser>(
                    connectionParams?.Authorization || ''
                )
            }
        } catch (e) {
            return {
                user: null
            }
        }

    }

    try {

        const user = await request?.jwtVerify<CtxUser>()

        return {
            request,
            reply,
            user
        }

    } catch(e) {
        return {
            request,
            reply,
            user: null
        }
    }

}

export type Context = Awaited<ReturnType<typeof buildContext>>

function fastifyAppClosePlugin(app: FastifyInstance): ApolloServerPlugin {
    return {
        async serverWillStart() {
        return {
                async drainServer() {
                    await app.close();
                },
            };
        },
    };
}

export async function createServer() {

    const schema = await buildSchema({
        resolvers: [UserResolver, MessageResolver],
        authChecker: bearerAuthChecker
    })

    const server = new ApolloServer({
        schema,
        plugins: [
            fastifyAppClosePlugin(app),
            ApolloServerPluginDrainHttpServer({ httpServer: app.server })
        ],
        context: buildContext
    })

    subscriptionServer({server: app.server, schema})

    return {app, server}
}

function subscriptionServer({server, schema}: {
    server: typeof app.server,
    schema: GraphQLSchema
}) {
    return SubscriptionServer.create(
        {
            schema,
            execute,
            subscribe,
            async onConnect(connectionParams:  { Authorization: string }) {
                return buildContext({connectionParams})
            }
        },
        {
            server,
            path: "/graphql"
        })
}