import { FastifyReply, FastifyRequest } from "fastify";
import "reflect-metadata"

import { createServer } from "./server";

async function boostrap() {
    const {app, server} = await createServer();

    await   server.start()

    app.register(server.createHandler({
        cors: false
    }) as any);
    
    app.get('/healthcheck', (request: FastifyRequest, replay: FastifyReply) => {
        replay.send({status: 'ok'})
    })
    
    try {
        await   app.listen(4000, "0.0.0.0");
        console.log(`Server is running on port http://localhost:4000${server.graphqlPath}`);
    } catch (e: any) {
        app.log.error(e);
        process.exit(1);
    }
}

boostrap();