import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log(
      "Testing email with API key:",
      process.env.RESEND_API_KEY ? "Present" : "Missing"
    );

    const { data, error } = await resend.emails.send({
      from: "Hospital Sustainability <onboarding@resend.dev>",
      to: ["julia_shvartsman@berkeley.edu"],
      subject: "Test Email - Hospital Sustainability System",
      text: "This is a test email from the Hospital Sustainability Dashboard reminder system.",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #225384; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Hospital Sustainability Dashboard</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #225384; margin-top: 0;">Test Email</h2>
            <p>This is a test email from the Hospital Sustainability Dashboard reminder system.</p>
            <p>If you received this email, the email system is working correctly!</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #225384;">
              <h3 style="color: #225384; margin-top: 0;">Email System Status: ✅ Working</h3>
              <p>You can now send reminders to department heads through the admin dashboard.</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend test error:", error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Email service is working",
      data,
    });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to test email service",
      details: error,
    });
  }
}
