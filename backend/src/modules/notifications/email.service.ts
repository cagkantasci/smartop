import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn('SMTP credentials not configured. Email service disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort || 587,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  private getTemplate(templateName: string, context: Record<string, any>): string {
    const templates: Record<string, string> = {
      notification: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #111827; }
    .logo span { color: #F59E0B; }
    .title { font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 10px; }
    .body { font-size: 16px; color: #4B5563; line-height: 1.6; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #9CA3AF; }
    .button { display: inline-block; background: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">Smart<span>OP</span></div>
      </div>
      <div class="content">
        <p>Merhaba {{userName}},</p>
        <h2 class="title">{{title}}</h2>
        <p class="body">{{body}}</p>
        {{#if actionUrl}}
        <a href="{{actionUrl}}" class="button">Detayları Gör</a>
        {{/if}}
      </div>
      <div class="footer">
        <p>Bu email Smartop tarafından otomatik olarak gönderilmiştir.</p>
        <p>&copy; 2024 Smartop. Tüm hakları saklıdır.</p>
      </div>
    </div>
  </div>
</body>
</html>
      `,
      checklistApproved: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Checklist Onaylandı</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .status { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; }
    .status.approved { background: #DEF7EC; color: #03543F; }
    .status.rejected { background: #FDE8E8; color: #9B1C1C; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h2>Checklist Durumu Güncellendi</h2>
      <p>Merhaba {{operatorName}},</p>
      <p>{{machineName}} için gönderdiğiniz checklist incelendi.</p>
      <p>Durum: <span class="status {{statusClass}}">{{statusText}}</span></p>
      {{#if reviewerNotes}}
      <p><strong>Yönetici Notu:</strong> {{reviewerNotes}}</p>
      {{/if}}
    </div>
  </div>
</body>
</html>
      `,
      jobAssigned: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Yeni İş Atandı</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .job-info { background: #F3F4F6; padding: 15px; border-radius: 6px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h2>🚧 Yeni İş Atandı</h2>
      <p>Merhaba {{operatorName}},</p>
      <p>Size yeni bir iş atandı:</p>
      <div class="job-info">
        <h3>{{jobTitle}}</h3>
        <p>{{jobDescription}}</p>
        {{#if location}}
        <p>📍 Konum: {{location}}</p>
        {{/if}}
        {{#if scheduledDate}}
        <p>📅 Tarih: {{scheduledDate}}</p>
        {{/if}}
      </div>
    </div>
  </div>
</body>
</html>
      `,
      maintenanceReminder: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bakım Hatırlatması</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h2>🔧 Bakım Hatırlatması</h2>
      <div class="warning">
        <strong>{{machineName}}</strong> makinesi için planlı bakım zamanı geldi.
      </div>
      <p><strong>Motor Saati:</strong> {{engineHours}}</p>
      <p><strong>Son Bakım:</strong> {{lastServiceDate}}</p>
      <p>Lütfen en kısa sürede bakım planlaması yapınız.</p>
    </div>
  </div>
</body>
</html>
      `,
    };

    const templateSource = templates[templateName] || templates.notification;
    const template = handlebars.compile(templateSource);
    return template(context);
  }

  async sendNotificationEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Email service not configured. Skipping email send.');
      return false;
    }

    try {
      const html = this.getTemplate(options.template, options.context);
      const fromEmail = this.configService.get<string>('SMTP_FROM', 'noreply@smartop.com');

      await this.transporter.sendMail({
        from: `Smartop <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html,
      });

      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  async sendBulkEmail(
    recipients: string[],
    subject: string,
    template: string,
    context: Record<string, any>,
  ): Promise<{ success: string[]; failed: string[] }> {
    const results = { success: [] as string[], failed: [] as string[] };

    for (const to of recipients) {
      const sent = await this.sendNotificationEmail({
        to,
        subject,
        template,
        context,
      });

      if (sent) {
        results.success.push(to);
      } else {
        results.failed.push(to);
      }
    }

    return results;
  }
}
