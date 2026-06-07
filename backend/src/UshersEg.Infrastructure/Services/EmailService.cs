using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using UshersEg.Application.Interfaces;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace UshersEg.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    private async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        var host = _config["EmailSettings:Host"] ?? "smtp.gmail.com";
        var port = int.Parse(_config["EmailSettings:Port"] ?? "587");
        var user = _config["EmailSettings:User"];
        var pass = _config["EmailSettings:Password"];
        var fromEmail = _config["EmailSettings:FromEmail"] ?? user;
        var fromName = _config["EmailSettings:FromName"] ?? "Ushers.eg";

        if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(pass))
        {
            _logger.LogWarning("EmailSettings not configured in appsettings.json. Please add EmailSettings:User and EmailSettings:Password. Skipping real email to {Email}.", toEmail);
            return;
        }

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            // StartTls is typical for 587
            await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(user, pass);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("✅ Email sent successfully to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to send email to {Email}", toEmail);
        }
    }

    public async Task SendEmailVerificationAsync(string email, string firstName, string token)
    {
        var frontendUrl = _config["Frontend:Url"] ?? "http://localhost:3000";
        var verifyUrl = $"{frontendUrl}/verify-email?token={token}";
        _logger.LogInformation("📧 [LINK GENERATED] Email Verification to {Email}: {Url}", email, verifyUrl);

        var html = $@"
        <div style='font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #080d1a; color: #F5EFE6; padding: 40px; border-radius: 16px; border-top: 4px solid #d4af37; box-shadow: 0 10px 30px rgba(0,0,0,0.5);'>
            <div style='text-align: center; margin-bottom: 35px;'>
                <img src='https://frontend-six-eta-10.vercel.app/logo.png' alt='Ushers.eg' style='max-height: 80px; width: auto; display: inline-block;' />
            </div>
            <h2 style='color: #F5EFE6; font-weight: 300; letter-spacing: 1px; margin-bottom: 20px;'>Welcome to Ushers.eg!</h2>
            <p style='color: #B0B5C9; line-height: 1.6;'>Hi {firstName},</p>
            <p style='color: #B0B5C9; line-height: 1.6;'>Thank you for joining our elite community. Please verify your email address by clicking the button below:</p>
            <div style='text-align: center; margin-top: 30px; margin-bottom: 30px;'>
                <a href='{verifyUrl}' style='display: inline-block; padding: 14px 28px; background-color: #F5EFE6; color: #080d1a; text-decoration: none; border-radius: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; font-size: 12px;'>Verify Email</a>
            </div>
            <p style='margin-top: 32px; color: #6B7280; font-size: 12px;'>If you did not create an account, no further action is required.</p>
        </div>";

        await SendEmailAsync(email, firstName, "Verify your email address - Ushers.eg", html);
    }

    public async Task SendPasswordResetAsync(string email, string firstName, string token)
    {
        var frontendUrl = _config["Frontend:Url"] ?? "http://localhost:3000";
        var resetUrl = $"{frontendUrl}/reset-password?token={token}";
        _logger.LogInformation("📧 [LINK GENERATED] Password Reset to {Email}: {Url}", email, resetUrl);

        var html = $@"
        <div style='font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #080d1a; color: #F5EFE6; padding: 40px; border-radius: 16px; border-top: 4px solid #d4af37; box-shadow: 0 10px 30px rgba(0,0,0,0.5);'>
            <div style='text-align: center; margin-bottom: 35px;'>
                <img src='https://frontend-six-eta-10.vercel.app/logo.png' alt='Ushers.eg' style='max-height: 80px; width: auto; display: inline-block;' />
            </div>
            <h2 style='color: #F5EFE6; font-weight: 300; letter-spacing: 1px; margin-bottom: 20px;'>Password Reset Request</h2>
            <p style='color: #B0B5C9; line-height: 1.6;'>Hi {firstName},</p>
            <p style='color: #B0B5C9; line-height: 1.6;'>We received a request to reset your password. Click the button below to choose a new password:</p>
            <div style='text-align: center; margin-top: 30px; margin-bottom: 30px;'>
                <a href='{resetUrl}' style='display: inline-block; padding: 14px 28px; background-color: #F5EFE6; color: #080d1a; text-decoration: none; border-radius: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; font-size: 12px;'>Reset Password</a>
            </div>
            <p style='margin-top: 32px; color: #6B7280; font-size: 12px;'>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
        </div>";

        await SendEmailAsync(email, firstName, "Reset your password - Ushers.eg", html);
    }

    public async Task SendApplicationStatusUpdateAsync(string email, string firstName, string jobTitle, string status)
    {
        var frontendUrl = _config["Frontend:Url"] ?? "http://localhost:3000";
        _logger.LogInformation("📧 [LINK GENERATED] Application Update to {Email}: Job '{JobTitle}' is now '{Status}'", email, jobTitle, status);

        var html = $@"
        <div style='font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #080d1a; color: #F5EFE6; padding: 40px; border-radius: 16px; border-top: 4px solid #d4af37; box-shadow: 0 10px 30px rgba(0,0,0,0.5);'>
            <div style='text-align: center; margin-bottom: 35px;'>
                <img src='https://frontend-six-eta-10.vercel.app/logo.png' alt='Ushers.eg' style='max-height: 80px; width: auto; display: inline-block;' />
            </div>
            <h2 style='color: #F5EFE6; font-weight: 300; letter-spacing: 1px; margin-bottom: 20px;'>Application Status Update</h2>
            <p style='color: #B0B5C9; line-height: 1.6;'>Hi {firstName},</p>
            <p style='color: #B0B5C9; line-height: 1.6;'>Your application for the job <strong style='color: #F5EFE6;'>{jobTitle}</strong> has been updated to: <span style='display: inline-block; padding: 4px 12px; background-color: rgba(245, 239, 230, 0.1); border: 1px solid rgba(245, 239, 230, 0.2); border-radius: 20px; color: #d4af37;'>{status}</span>.</p>
            <p style='color: #B0B5C9; line-height: 1.6; margin-top: 20px;'>Log in to your dashboard to view more details.</p>
        </div>";

        await SendEmailAsync(email, firstName, $"Application Update: {jobTitle}", html);
    }

    public async Task SendWelcomeEmailAsync(string email, string firstName, string role)
    {
        var frontendUrl = _config["Frontend:Url"] ?? "http://localhost:3000";
        _logger.LogInformation("📧 [LINK GENERATED] Welcome to {Email} ({FirstName}) as {Role}", email, firstName, role);

        var html = $@"
        <div style='font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #080d1a; color: #F5EFE6; padding: 40px; border-radius: 16px; border-top: 4px solid #d4af37; box-shadow: 0 10px 30px rgba(0,0,0,0.5);'>
            <div style='text-align: center; margin-bottom: 35px;'>
                <img src='https://frontend-six-eta-10.vercel.app/logo.png' alt='Ushers.eg' style='max-height: 80px; width: auto; display: inline-block;' />
            </div>
            <h2 style='color: #F5EFE6; font-weight: 300; letter-spacing: 1px; margin-bottom: 20px;'>Welcome to Ushers.eg!</h2>
            <p style='color: #B0B5C9; line-height: 1.6;'>Hi {firstName},</p>
            <p style='color: #B0B5C9; line-height: 1.6;'>We're thrilled to have you on board as an <strong style='color: #d4af37;'>{role}</strong>.</p>
            <p style='color: #B0B5C9; line-height: 1.6; margin-top: 20px;'>Get started by completing your profile and exploring the opportunities waiting for you.</p>
        </div>";

        await SendEmailAsync(email, firstName, "Welcome to Ushers.eg!", html);
    }

    public async Task SendApplicationReceivedToUsherAsync(string email, string firstName, string jobTitle)
    {
        var html = $@"
        <div style='font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #080d1a; color: #F5EFE6; padding: 40px; border-radius: 16px; border-top: 4px solid #d4af37; box-shadow: 0 10px 30px rgba(0,0,0,0.5);'>
            <div style='text-align: center; margin-bottom: 35px;'>
                <img src='https://frontend-six-eta-10.vercel.app/logo.png' alt='Ushers.eg' style='max-height: 80px; width: auto; display: inline-block;' />
            </div>
            <h2 style='color: #F5EFE6; font-weight: 300; letter-spacing: 1px; margin-bottom: 20px;'>Application Submitted</h2>
            <p style='color: #B0B5C9; line-height: 1.6;'>Hi {firstName},</p>
            <p style='color: #B0B5C9; line-height: 1.6;'>You have successfully applied for the job <strong style='color: #d4af37;'>{jobTitle}</strong>.</p>
            <p style='color: #B0B5C9; line-height: 1.6; margin-top: 20px;'>The employer has received your application and will review your profile. You will receive another notification when there is an update on your status.</p>
        </div>";

        await SendEmailAsync(email, firstName, $"Application Received: {jobTitle}", html);
    }

    public async Task SendApplicationReceivedToEmployerAsync(string email, string employerName, string jobTitle, string candidateName)
    {
        var html = $@"
        <div style='font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #080d1a; color: #F5EFE6; padding: 40px; border-radius: 16px; border-top: 4px solid #d4af37; box-shadow: 0 10px 30px rgba(0,0,0,0.5);'>
            <div style='text-align: center; margin-bottom: 35px;'>
                <img src='https://frontend-six-eta-10.vercel.app/logo.png' alt='Ushers.eg' style='max-height: 80px; width: auto; display: inline-block;' />
            </div>
            <h2 style='color: #F5EFE6; font-weight: 300; letter-spacing: 1px; margin-bottom: 20px;'>New Application Received</h2>
            <p style='color: #B0B5C9; line-height: 1.6;'>Hi {employerName},</p>
            <p style='color: #B0B5C9; line-height: 1.6;'><strong style='color: #d4af37;'>{candidateName}</strong> just applied for your job post: <strong>{jobTitle}</strong>.</p>
            <p style='color: #B0B5C9; line-height: 1.6; margin-top: 20px;'>Log in to your dashboard to review their profile, photos, and resume.</p>
        </div>";

        await SendEmailAsync(email, employerName, $"New Application for {jobTitle}", html);
    }

    public async Task SendNewJobNotificationToUsherAsync(string email, string firstName, string jobTitle, string companyName)
    {
        var html = $@"
        <div style='font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #080d1a; color: #F5EFE6; padding: 40px; border-radius: 16px; border-top: 4px solid #d4af37; box-shadow: 0 10px 30px rgba(0,0,0,0.5);'>
            <div style='text-align: center; margin-bottom: 35px;'>
                <img src='https://frontend-six-eta-10.vercel.app/logo.png' alt='Ushers.eg' style='max-height: 80px; width: auto; display: inline-block;' />
            </div>
            <h2 style='color: #F5EFE6; font-weight: 300; letter-spacing: 1px; margin-bottom: 20px;'>New Opportunity on Ushers.eg!</h2>
            <p style='color: #B0B5C9; line-height: 1.6;'>Hi {firstName},</p>
            <p style='color: #B0B5C9; line-height: 1.6;'><strong style='color: #d4af37;'>{companyName}</strong> just posted a new job: <strong>{jobTitle}</strong>.</p>
            <p style='color: #B0B5C9; line-height: 1.6; margin-top: 20px;'>Don't miss out! Log in to your account and apply now before the deadline.</p>
        </div>";

        await SendEmailAsync(email, firstName, $"New Job Alert: {jobTitle}", html);
    }

    public async Task SendApplicationStatusConfirmationToEmployerAsync(string email, string employerName, string jobTitle, string candidateName, string status)
    {
        var statusColor = status.ToLower() == "accepted" ? "#22c55e" : status.ToLower() == "rejected" ? "#ef4444" : "#d4af37";
        var html = $@"
        <div style='font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #080d1a; color: #F5EFE6; padding: 40px; border-radius: 16px; border-top: 4px solid #d4af37; box-shadow: 0 10px 30px rgba(0,0,0,0.5);'>
            <div style='text-align: center; margin-bottom: 35px;'>
                <img src='https://frontend-six-eta-10.vercel.app/logo.png' alt='Ushers.eg' style='max-height: 80px; width: auto; display: inline-block;' />
            </div>
            <h2 style='color: #F5EFE6; font-weight: 300; letter-spacing: 1px; margin-bottom: 20px;'>Candidate {status}</h2>
            <p style='color: #B0B5C9; line-height: 1.6;'>Hi {employerName},</p>
            <p style='color: #B0B5C9; line-height: 1.6;'>This is a confirmation that you have <strong style='color: {statusColor};'>{status.ToLower()}</strong> <strong style='color: #F5EFE6;'>{candidateName}</strong>'s application for the job <strong>{jobTitle}</strong>.</p>
            <p style='color: #B0B5C9; line-height: 1.6; margin-top: 20px;'>The candidate has been notified of your decision.</p>
        </div>";

        await SendEmailAsync(email, employerName, $"Candidate {status}: {jobTitle}", html);
    }
}
