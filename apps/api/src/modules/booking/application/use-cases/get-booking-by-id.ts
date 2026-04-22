import { Booking, Room } from "@booking/domain/entities";
import { BookingRepository, RoomRepository } from "@booking/domain/repositories";
import { UseCase, UniqueId } from "@core/base-classes";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { BookingNotFoundError } from "../errors";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { User } from "src/modules/identity/domain/entities";

class GetBookingByIdUseCase extends UseCase<GetBookingByIdUseCase.Input, GetBookingByIdUseCase.Result> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly bookingRepository: BookingRepository,
        private readonly roomRepository: RoomRepository,
        private readonly userRepository: UserRepository,
    ) {
        super();
    }

    async execute(params: GetBookingByIdUseCase.Input): Promise<GetBookingByIdUseCase.Result> {
        const user = this.authUserService.getUser();
        const bookingId = UniqueId.fromString(params.id);

        const booking = await this.bookingRepository.findById(bookingId);

        if (!booking) {
            throw new BookingNotFoundError(bookingId);
        }

        if (!user.isAdmin()) {
            booking.checkOwner(user.id);
        }

        const [room, requesterUser] = await Promise.all([
            this.roomRepository.findById(booking.roomId),
            this.userRepository.findById(booking.userId),
        ]);

        if (!room || !requesterUser) {
            throw new Error("Internal Server Error");
        }

        return { ...booking.toJSON(), room: room.toJSON(), user: requesterUser.toJSON() };
    }
}

namespace GetBookingByIdUseCase {
    export const InputSchema = z.object({
        id: z.string(),
    });

    export const OutputSchema = Booking.JsonSchema.extend({
        room: Room.JsonSchema,
        user: User.JsonSchema,
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Result = z.infer<typeof OutputSchema>;
}

export { GetBookingByIdUseCase };
