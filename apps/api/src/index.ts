import "dotenv/config";
import { ORPCServer } from "@core/presentation/orpc-server/server";

async function main() {
    ORPCServer.listen();
}

main();
