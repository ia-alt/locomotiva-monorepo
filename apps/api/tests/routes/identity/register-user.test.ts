import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict"

import { cleanDatabase, createTestUser, UserType } from "../../helpers";


describe("RegisterUser", async () => {
    beforeEach(async () => {
        //await cleanDatabase();
    });

    it("Should register a new user", async () => {
        const response = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: "John Doe",
                email: "test@test.com",
                cpf: "12345678909",
                birthDate: "1990-01-01",
                password: "Abc123456789@",
            }),
        });
        assert(response.ok);
    });
});

