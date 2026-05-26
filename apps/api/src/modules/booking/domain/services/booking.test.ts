/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { BookingService } from './booking';
import { BookingRepository, RoomRepository } from "@booking/domain/repositories";
import { SpaceOperatingHoursService } from "@operating-hours/domain/services";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { UniqueId } from "@core/base-classes";
import { OnlyDate, OnlyTime } from "@core/value-objects";
import { Booking } from "../entities";
import { DailyAvailability, TimeInterval } from 'src/modules/operating-hours/domain/value-objects';


function getMockSpaceOperatingHoursService(): SpaceOperatingHoursService {
    async function getAvailabilityForDay(_spaceId: UniqueId, _date: OnlyDate): Promise<DailyAvailability | null> {
        return new DailyAvailability({
            intervals: [
                new TimeInterval({
                    start: new OnlyTime({ hour: 8, minute: 0, second: 0 }),
                    end: new OnlyTime({ hour: 17, minute: 0, second: 0 }),
                })
            ]
        })
    }
    return {
        getAvailabilityForDay,
    } as unknown as SpaceOperatingHoursService;
}



function getMockBookingRepository(timeIntervals: TimeInterval[]): BookingRepository {
    async function findByDay(roomId: UniqueId, date: OnlyDate): Promise<Booking[]> {
        return timeIntervals.map(ti => ({ timeInterval: ti } as unknown as Booking));
    }
    return {
        findByDay,
    } as unknown as BookingRepository;
}


describe('BookingService - checkAvailability', () => {
    test('should return true when there are no conflicting bookings', async () => {
        const roomId = UniqueId.create();
        const day = new OnlyDate('2026-05-26');
        const timeInterval = new TimeInterval({
            start: new OnlyTime({ hour: 10, minute: 0, second: 0 }),
            end: new OnlyTime({ hour: 11, minute: 0, second: 0 }),
        });

        const bookingService = new BookingService(
            getMockBookingRepository([]),
            getMockSpaceOperatingHoursService(),
            {} as RoomRepository,
            {} as UserRepository
        );

        const isAvailable = await bookingService.checkAvailability(roomId, day, timeInterval);
        assert.strictEqual(isAvailable, true);
    });

    test('should return false when there is a conflicting booking', async () => {
        const roomId = UniqueId.create();
        const day = new OnlyDate('2026-05-26');
        const timeInterval = new TimeInterval({
            start: new OnlyTime({ hour: 10, minute: 0, second: 0 }),
            end: new OnlyTime({ hour: 11, minute: 0, second: 0 }),
        });

        const conflictingTimeInterval = new TimeInterval({
            start: new OnlyTime({ hour: 10, minute: 30, second: 0 }),
            end: new OnlyTime({ hour: 11, minute: 30, second: 0 }),
        });

        const bookingService = new BookingService(
            getMockBookingRepository([conflictingTimeInterval]),
            getMockSpaceOperatingHoursService(),
            {} as RoomRepository,
            {} as UserRepository
        );

        const isAvailable = await bookingService.checkAvailability(roomId, day, timeInterval);
        assert.strictEqual(isAvailable, false);
    });

    test('should return false when period is outside operating hours', async () => {
        const roomId = UniqueId.create();
        const day = new OnlyDate('2026-05-26');
        const timeIntervalBefore = new TimeInterval({
            start: new OnlyTime({ hour: 7, minute: 0, second: 0 }),
            end: new OnlyTime({ hour: 8, minute: 0, second: 0 }),
        });

        const timeIntervalAfter = new TimeInterval({
            start: new OnlyTime({ hour: 17, minute: 0, second: 0 }),
            end: new OnlyTime({ hour: 18, minute: 0, second: 0 }),
        });

        const bookingService = new BookingService(
            getMockBookingRepository([]),
            getMockSpaceOperatingHoursService(),
            {} as RoomRepository,
            {} as UserRepository
        );

        const isAvailableBefore = await bookingService.checkAvailability(roomId, day, timeIntervalBefore);
        assert.strictEqual(isAvailableBefore, false);

        const isAvailableAfter = await bookingService.checkAvailability(roomId, day, timeIntervalAfter);
        assert.strictEqual(isAvailableAfter, false);
    });
});
