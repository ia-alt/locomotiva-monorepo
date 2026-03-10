interface SendEmailService {
    send(to: string, subject: string, html: string): Promise<void>;
}

export { SendEmailService };