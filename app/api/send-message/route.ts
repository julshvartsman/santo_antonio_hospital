import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, message, userId } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user information if userId is provided
    let userInfo = null;
    if (userId) {
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!userError && user) {
        userInfo = user;
      }
    }

    // Get admin users to send the email to
    const { data: admins, error: adminError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("role", "admin");

    if (adminError) {
      console.error("Error fetching admins:", adminError);
      return NextResponse.json(
        { error: "Failed to fetch admin users" },
        { status: 500 }
      );
    }

    // Prepare email content
    const emailSubject = `Support Request from ${firstName} ${lastName}`;
    const emailBody = `
New support request received:

From: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone || "Not provided"}
User ID: ${userId || "Not provided"}
User Role: ${userInfo?.role || "Unknown"}
Hospital ID: ${userInfo?.hospital_id || "Not assigned"}

Message:
${message}

---
This message was sent from the Hospital Sustainability Dashboard help system.
    `;

    // For now, we'll log the email and return success
    // In production, you would integrate with an email service like SendGrid, AWS SES, or Resend
    console.log("=== SUPPORT EMAIL ===");
    console.log("To:", admins.map((admin) => admin.email).join(", "));
    console.log("Subject:", emailSubject);
    console.log("Body:", emailBody);
    console.log("=====================");

    // Store the message in the database for record keeping
    const { error: dbError } = await supabase.from("support_messages").insert({
      from_name: `${firstName} ${lastName}`,
      from_email: email,
      from_phone: phone,
      message: message,
      user_id: userId,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error("Error storing message:", dbError);
      // Don't fail the request if database storage fails
    }

    // TODO: In production, integrate with email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: admins.map(admin => admin.email),
    //   from: 'noreply@yourhospital.com',
    //   subject: emailSubject,
    //   text: emailBody,
    // });

    return NextResponse.json(
      {
        success: true,
        message: "Support request sent successfully",
        adminEmails: admins.map((admin) => admin.email),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending support message:", error);
    return NextResponse.json(
      { error: "Failed to send support message" },
      { status: 500 }
    );
  }
}
