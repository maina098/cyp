export declare class EmailService {
    private readonly logger;
    private readonly transporter;
    private get sender();
    private get appUrl();
    sendVerificationEmail(email: string, token: string): Promise<void>;
    sendPasswordResetEmail(email: string, token: string): Promise<void>;
}
