import { AuthChecker } from "type-graphql"
import { Context } from "../server"

export const bearerAuthChecker: AuthChecker<Context> = (ctx) => {
    
    if (ctx.context.user) {
        return true
    }
    
    return false
}