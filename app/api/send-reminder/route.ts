import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { Resend } from "resend";

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
- Waste management data

If you have any questions or need assistance, please contact support through the help section.

Thank you for your cooperation.

Best regards,
Hospital Sustainability Team`;

    const emailBody = customMessage || defaultMessage;

    // Create HTML version of the email
    const htmlEmailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #225384; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Hospital Sustainability Dashboard</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #225384; margin-top: 0;">Monthly Data Submission Reminder</h2>
          
          <p>Dear <strong>${departmentHead.full_name}</strong>,</p>
          
          <p>This is a friendly reminder that your monthly sustainability data for <strong>${currentMonth}</strong> is due.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #225384;">
            <h3 style="color: #225384; margin-top: 0;">Required Metrics:</h3>
            <ul style="color: #333;">
              <li>Energy usage (kWh)</li>
              <li>Water consumption (m³)</li>
              <li>CO₂ emissions</li>
              <li>Waste management data</li>
            </ul>
          </div>
          
          <p>Please log in to the <strong>Hospital Sustainability Dashboard</strong> and submit your department's metrics as soon as possible.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
            }/department/data-entry" 
               style="background-color: #225384; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Submit Data Now
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you have any questions or need assistance, please contact support through the help section in the dashboard.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #666; font-size: 14px;">
            Thank you for your cooperation.<br>
            <strong>Hospital Sustainability Team</strong>
          </p>
        </div>
      </div>
    `;

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      // Send the email using Resend
      const { data, error } = await resend.emails.send({
        from: "Hospital Sustainability <onboarding@resend.dev>",
        to: [departmentHeadEmail],
        subject: emailSubject,
        text: emailBody,
        html: htmlEmailBody,
      });

      if (error) {
        console.error("Resend error:", error);
        return NextResponse.json(
          { error: "Failed to send email" },
          { status: 500 }
        );
      }

      console.log("Email sent successfully:", data);

      // Store the reminder in the database for record keeping
      const { error: dbError } = await supabase
        .from("support_messages")
        .insert({
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
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending reminder:", error);
    return NextResponse.json(
      { error: "Failed to send reminder" },
      { status: 500 }
    );
  }
}
