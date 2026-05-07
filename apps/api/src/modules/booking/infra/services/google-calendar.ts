import { google } from "googleapis";
import { CalendarService } from "@booking/domain/services";
import { CalendarRepository } from "@booking/domain/repositories";
import { CalendarEvent } from "@booking/domain/entities";
import { Booking } from "@booking/domain/entities";
import { RoomRepository } from "@booking/domain/repositories";
import { UserRepository } from "src/modules/identity/domain/repositories";

export class GoogleCalendarService implements CalendarService {
    constructor(
        private readonly calendarRepository: CalendarRepository,
        private readonly roomRepository: RoomRepository,
        private readonly userRepository: UserRepository,
        private readonly calendarId: string,
        private readonly serviceAccountEmail: string,
        private readonly serviceAccountPrivateKey: string,
    ) { }

    private getAuthClient() {
    const raw = this.serviceAccountPrivateKey;
    
    const key = raw
        .replace(/\\n/g, '\n')
        .replace(/\\\n/g, '\n')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim();

    return new google.auth.JWT({
        email: this.serviceAccountEmail,
        key,
        scopes: ['https://www.googleapis.com/auth/calendar'],
    });
}

    async addEventOfBooking(booking: Booking): Promise<void> {
        const [room, user] = await Promise.all([
            this.roomRepository.findById(booking.roomId),
            this.userRepository.findById(booking.userId),
        ]);

        const roomName = room?.name ?? 'Sala';
        const userJson = user?.toJSON();
        const userName = userJson?.name ?? 'Não informado';
        const userEmail = userJson?.email ?? 'Não informado';
        const userCompany = userJson?.company ?? null;
        const userJobTitle = userJson?.jobTitle ?? null;

        const descriptionLines = [
            `Sala: ${roomName}`,
            `Responsável: ${userName}`,
            `E-mail: ${userEmail}`,
            ...(userCompany ? [`Empresa/Instituição: ${userCompany}`] : []),
            ...(userJobTitle ? [`Cargo: ${userJobTitle}`] : []),
            ``,
            `Ação: ${booking.title}`,
            `Finalidade: ${booking.description}`,
            `Quantidade de Pessoas: ${booking.numberOfPeople}`,
            
        ];

        const auth = this.getAuthClient();
        const calendar = google.calendar({ version: 'v3', auth });

        const { data } = await calendar.events.insert({
            calendarId: this.calendarId,
            requestBody: {
                summary: booking.title,
                description: descriptionLines.join('\n'),
                start: {
                    dateTime: booking.period.value.from.toISOString(),
                    timeZone: 'America/Fortaleza',
                },
                end: {
                    dateTime: booking.period.value.to.toISOString(),
                    timeZone: 'America/Fortaleza',
                },
            },
        });

        const googleEventId = data.id;
        if (!googleEventId) {
            throw new Error('Google Calendar did not return an event id');
        }

        const calendarEvent = CalendarEvent.create({
            eventId: googleEventId,
            bookingId: booking.id,
        });

        await this.calendarRepository.save(calendarEvent);
    }

    async removeEventOfBookingIfExists(booking: Booking): Promise<void> {
        const calendarEvent = await this.calendarRepository.findByBookingId(booking.id);
        if (!calendarEvent) return;

        const auth = this.getAuthClient();
        const calendar = google.calendar({ version: 'v3', auth });

        await calendar.events.delete({
            calendarId: this.calendarId,
            eventId: calendarEvent.eventId,
        });

        await this.calendarRepository.delete(calendarEvent.id);
    }
}
