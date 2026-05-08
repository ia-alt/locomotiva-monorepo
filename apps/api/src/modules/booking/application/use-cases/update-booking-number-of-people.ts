import { Booking } from "@booking/domain/entities";
import { BookingRepository, RoomRepository } from "@booking/domain/repositories";
import { UniqueId, UseCase } from "@core/base-classes";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { BookingNotFoundError } from "../errors";
import { RoomCapacityExceededError } from "@booking/domain/errors";

class UpdateBookingNumberOfPeopleUseCase extends UseCase<UpdateBookingNumberOfPeopleUseCase.Input, UpdateBookingNumberOfPeopleUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly bookingRepository: BookingRepository,
        private readonly roomRepository: RoomRepository,
    ) {
        super();
    }

    async execute(params: UpdateBookingNumberOfPeopleUseCase.Input): Promise<UpdateBookingNumberOfPeopleUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const bookingId = UniqueId.fromString(params.bookingId);
        const booking = await this.bookingRepository.findById(bookingId);
        if (!booking) {
            throw new BookingNotFoundError(bookingId);
        }

        const room = await this.roomRepository.findById(booking.roomId);
        if (room && params.numberOfPeople > room.toJSON().capacity) {
            throw new RoomCapacityExceededError(params.numberOfPeople, room.toJSON().capacity);
        }

        booking.updateNumberOfPeople(params.numberOfPeople);
        await this.bookingRepository.save(booking);

        return booking.toJSON();
    }
}

namespace UpdateBookingNumberOfPeopleUseCase {
    export const InputSchema = z.object({
        bookingId: z.string(),
        numberOfPeople: z.number().int().min(1),
    });

    export const OutputSchema = Booking.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { UpdateBookingNumberOfPeopleUseCase };
