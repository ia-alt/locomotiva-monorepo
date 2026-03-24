import { id } from "zod/v4/locales";
import { UniqueId } from "./modules/_core/base-classes";
import { prisma } from "./modules/_core/infra/database/prisma/prisma-instance";
import container from "./modules/_di_container/container";
import { User } from "./modules/identity/domain/entities";
import { EmailAddress } from "./modules/_core/value-objects";

class FeedDbDev {

    private _adminUser?: User;
    private _systemUser?: User;
    private _user?: User;

    private get adminUser() {
        if (!this._adminUser) {
            throw new Error("Admin user not found");
        }
        return this._adminUser;
    }

    private get systemUser() {
        if (!this._systemUser) {
            throw new Error("System user not found");
        }
        return this._systemUser;
    }

    private get user() {
        if (!this._user) {
            throw new Error("User not found");
        }
        return this._user;
    }


    async run() {
        await this.cleanDatabase();

        await this.getOrCreateAdminUser();
        await this.getOrCreateSystemUser();
        await this.getOrCreateUser();

        await this.createRooms();
    }


    async getOrCreateAdminUser() {
        const email = "admin@test.com";

        let adminUser = await this.getUserEmail(email);
        if (!adminUser) {
            const { id: userId } = await container.getRegisterUserUseCase().execute({
                name: "Admin",
                email: "admin@test.com",
                password: "Abc123456789@",
                cpf: "96641736067",
                birthDate: "1990-01-01",
            })

            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    userType: User.UserType.ADMIN,
                },
            })

            adminUser = (await this.getUserById(userId))!;
        }

        this._adminUser = adminUser;
    }

    async getOrCreateSystemUser() {
        const email = "system@test.com";

        let systemUser = await this.getUserEmail(email);
        if (!systemUser) {
            const { id: userId } = await container.getRegisterSystemUserUseCase().execute({
                name: "System",
                email: "system@test.com",
                password: "Abc123456789@",
                birthDate: "1990-01-01",
            })

            systemUser = (await this.getUserById(userId))!;
        }

        this._systemUser = systemUser;
    }

    async getOrCreateUser() {
        const email = "user@test.com";

        let user = await this.getUserEmail(email);
        if (!user) {
            const { id: userId } = await container.getRegisterUserUseCase().execute({
                name: "User",
                email: "user@test.com",
                password: "Abc123456789@",
                cpf: "75016674035",
                birthDate: "1990-01-01",
            })

            user = (await this.getUserById(userId))!;
        }

        this._user = user;
    }

    async createRooms() {
        const createRoomUseCase = container.getCreateRoomUseCase(this.adminUser);
        const createPromises = Array(4).fill(0).map(async (_, i) => {

            const room = await createRoomUseCase.execute({
                name: "Sala " + (i + 1).toString(),
                capacity: 10,
                enabled: i !== 2,
            })

            await container.getSetDefaultOperatingScheduleUseCase(this.adminUser).execute({
                roomId: room.id,
                policy: {
                    effectiveFrom: "2025-01-01",
                    weeklySchedule: {
                        Sunday: {
                            intervals: []
                        },
                        Monday: {
                            intervals: [
                                {
                                    start: {
                                        hour: 8,
                                        minute: 0,
                                        second: 0,
                                    },
                                    end: {
                                        hour: 18,
                                        minute: 0,
                                        second: 0,
                                    },
                                }
                            ]
                        },
                        Tuesday: {
                            intervals: [
                                {
                                    start: {
                                        hour: 8,
                                        minute: 0,
                                        second: 0,
                                    },
                                    end: {
                                        hour: 18,
                                        minute: 0,
                                        second: 0,
                                    },
                                }
                            ]
                        },
                        Wednesday: {
                            intervals: [
                                {
                                    start: {
                                        hour: 8,
                                        minute: 0,
                                        second: 0,
                                    },
                                    end: {
                                        hour: 18,
                                        minute: 0,
                                        second: 0,
                                    },
                                }
                            ]
                        },
                        Thursday: {
                            intervals: [
                                {
                                    start: {
                                        hour: 8,
                                        minute: 0,
                                        second: 0,
                                    },
                                    end: {
                                        hour: 18,
                                        minute: 0,
                                        second: 0,
                                    },
                                }
                            ]
                        },
                        Friday: {
                            intervals: [
                                {
                                    start: {
                                        hour: 8,
                                        minute: 0,
                                        second: 0,
                                    },
                                    end: {
                                        hour: 18,
                                        minute: 0,
                                        second: 0,
                                    },
                                }
                            ]
                        },
                        Saturday: {
                            intervals: [
                                {
                                    start: {
                                        hour: 8,
                                        minute: 0,
                                        second: 0,
                                    },
                                    end: {
                                        hour: 12,
                                        minute: 0,
                                        second: 0,
                                    },
                                }
                            ]
                        }
                    }
                }
            })
        });
        await Promise.all(createPromises);
    }

    async cleanDatabase() {
        await prisma.coworkingSettings.deleteMany();
        await prisma.spaceOperatingHours.deleteMany();
        await prisma.accessLog.deleteMany();
        await prisma.booking.deleteMany();
        await prisma.room.deleteMany();
        //await prisma.user.deleteMany();
    }

    async getUserById(id: string) {
        const userId = UniqueId.fromString(id);
        const user = await container.getUserRepository().findById(userId);
        return user;
    }
    async getUserEmail(email: string) {
        ;
        const user = await container.getUserRepository().findByEmailOrCpf(EmailAddress.fromString(email));
        return user;
    }
}



export const feedDbDev = new FeedDbDev();
