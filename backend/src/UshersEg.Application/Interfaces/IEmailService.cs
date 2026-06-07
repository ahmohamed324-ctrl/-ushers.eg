namespace UshersEg.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailVerificationAsync(string email, string firstName, string token);
    Task SendPasswordResetAsync(string email, string firstName, string token);
    Task SendApplicationStatusUpdateAsync(string email, string firstName, string jobTitle, string status);
    Task SendWelcomeEmailAsync(string email, string firstName, string role);
    Task SendApplicationReceivedToUsherAsync(string email, string firstName, string jobTitle);
    Task SendApplicationReceivedToEmployerAsync(string email, string employerName, string jobTitle, string candidateName);
    Task SendNewJobNotificationToUsherAsync(string email, string firstName, string jobTitle, string companyName);
    Task SendApplicationStatusConfirmationToEmployerAsync(string email, string employerName, string jobTitle, string candidateName, string status);
}
