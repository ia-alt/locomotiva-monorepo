import "dotenv/config";
import { ORPCServer } from "@core/presentation/orpc-server/server";
//import { feedDbDev } from "./feed-db-dev";

async function main() {

    //await feedDbDev.run();

    ORPCServer.listen();
}

main();
