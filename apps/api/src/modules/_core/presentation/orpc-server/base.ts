import { os } from "@orpc/server";

export const baseRouter = os.$context<{ headers: Headers }>();
