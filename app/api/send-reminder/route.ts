import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { departmentHeadEmail, customMessage } = body;

    // Validate required fields
    if (!departmentHeadEmail) {
      return NextResponse.json(
        { error: "Department head email is required" },
        { status: 400 }
      );
    }

    // Get department head information
    const { data: departmentHead, error: userError } = await supabase
      .from("profiles")
      .select("*, hospitals(name)")
      .eq("email", departmentHeadEmail)
      .eq("role", "department_head")
      .single();

    if (userError || !departmentHead) {
      return NextResponse.json(
        { error: "Department head not found" },
        { status: 404 }
      );
    }

    // Get current month for the reminder
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    // Prepare email content
    const emailSubject = `Reminder: Submit Your Monthly Sustainability Data - ${currentMonth}`;
    const defaultMessage = `Dear ${departmentHead.full_name},

This is a friendly reminder that your monthly sustainability data for ${currentMonth} is due.

Please log in to the Hospital Sustainability Dashboard and submit your department's metrics:
- Energy usage (kWh)
- Water consumption (m³)
- CO₂ emissions
- Other sustainability metrics

If you have any questions or need assistance, please contact support through the help section.

Thank you for your cooperation.

Best regards,
Hospital Sustainability Team`;

    const emailBody = customMessage || defaultMessage;

    // For now, we'll log the email and return success
    // In production, you would integrate with an email service like SendGrid, AWS SES, or Resend
    console.log("=== REMINDER EMAIL ===");
    console.log("To:", departmentHeadEmail);
    console.log("Subject:", emailSubject);
    console.log("Body:", emailBody);
    console.log("=====================");

    // Store the reminder in the database for record keeping
    const { error: dbError } = await supabase.from("support_messages").insert({
      from_name: "Hospital Sustainability Team",
      from_email: "noreply@hospital.com",
      from_phone: null,
      message: `Reminder sent to ${departmentHead.full_name} (${departmentHeadEmail}) for ${currentMonth} data submission.`,
      user_id: departmentHead.id,
      status: "resolved",
      admin_response: emailBody,
      resolved_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error("Error storing reminder:", dbError);
      // Don't fail the request if database storage fails
    }

    // TODO: In production, integrate with email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: departmentHeadEmail,
    //   from: 'noreply@yourhospital.com',
    //   subject: emailSubject,
    //   text: emailBody,
    // });

    return NextResponse.json(
      {
        success: true,
        message: "Reminder sent successfully",
        departmentHead: {
          name: departmentHead.full_name,
          email: departmentHeadEmail,
          hospital: departmentHead.hospitals?.name || "Unknown",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending reminder:", error);
    return NextResponse.json(
      { error: "Failed to send reminder" },
      { status: 500 }
    );
  }
}
