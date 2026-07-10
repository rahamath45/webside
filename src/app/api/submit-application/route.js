import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generatePDF } from '@/lib/pdf-generator';
import { sendReportEmail } from '@/lib/email-sender';
import pool from '@/lib/db';

/**
 * POST /api/submit-application
 * Receives the 20-field application form data from the front-end,
 * verifies the authenticated session, saves to PostgreSQL,
 * generates a PDF, and emails it to the Admin.
 */
export async function POST(request) {
  try {
    // 1. Verify user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to submit an application' },
        { status: 401 }
      );
    }

    // 2. Parse payload
    const payload = await request.json();
    console.log('[API Submit] Received application from user:', session.user.email);

    // 3. Map fields to report data
    const reportData = {
      email: session.user.email || payload.email || '',
      organizationName: payload.organizationName || '',
      contactPersonName: payload.contactPersonName || '',
      contactEmail: payload.contactEmail || session.user.email || '',
      productName: payload.productName || '',
      productCategory: payload.productCategory || '',
      deploymentModel: payload.deploymentModel || '',
      briefDescription: payload.briefDescription || '',
      keyFeatures: payload.keyFeatures || '',
      indigenousContent: payload.indigenousContent || '',
      ipOwnership: payload.ipOwnership || '',
      foreignComponents: payload.foreignComponents || '',
      sbomAvailability: payload.sbomAvailability || '',
      sbomFormat: payload.sbomFormat || '',
      pocAvailability: payload.pocAvailability || '',
      awards: payload.awards || '',
      benchmarking: payload.benchmarking || '',
      deployments: payload.deployments || '',
      aiAssessment: payload.aiAssessment || '',
      rvdPolicy: payload.rvdPolicy || '',
    };

    // 4. Save all 20 answers to PostgreSQL
    // Parameterized query — all special characters (@, ', ", OR 1=1, --, etc.)
    // are treated as plain text. No SQL injection possible.
    console.log('[API Submit] Saving application to database...');

    // Look up the user_id from the users table
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [session.user.email]
    );
    const userId = userRows.length > 0 ? userRows[0].id : null;

    await pool.query(
      `INSERT INTO applications (
        user_id, user_email, organization_name, contact_person_name,
        contact_email, product_name, product_category, deployment_model,
        brief_description, key_features, indigenous_content, ip_ownership,
        foreign_components, sbom_availability, sbom_format, poc_availability,
        awards, benchmarking, deployments, ai_assessment, rvd_policy
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      )`,
      [
        userId,
        reportData.email,
        reportData.organizationName,
        reportData.contactPersonName,
        reportData.contactEmail,
        reportData.productName,
        reportData.productCategory,
        reportData.deploymentModel,
        reportData.briefDescription,
        reportData.keyFeatures,
        reportData.indigenousContent,
        reportData.ipOwnership,
        reportData.foreignComponents,
        reportData.sbomAvailability,
        reportData.sbomFormat,
        reportData.pocAvailability,
        reportData.awards,
        reportData.benchmarking,
        reportData.deployments,
        reportData.aiAssessment,
        reportData.rvdPolicy,
      ]
    );
    console.log('[API Submit] Application saved to database successfully');

    // 5. Generate PDF
    console.log('[API Submit] Generating PDF report...');
    const pdfBuffer = await generatePDF(reportData);
    console.log('[API Submit] PDF successfully generated, size:', pdfBuffer.length, 'bytes');

    // 6. Send email to Administrator (fire-and-forget for fast response)
    const adminEmail = process.env.ADMIN_REPORT_EMAIL;
    if (adminEmail) {
      console.log('[API Submit] Dispatching report to Admin email:', adminEmail);
      // Don't await — send in background so user gets instant redirect
      sendReportEmail(adminEmail, reportData, pdfBuffer)
        .then(() => console.log('[API Submit] Admin email notification sent successfully'))
        .catch((emailErr) => console.error('[API Submit] Email send failed:', emailErr.message));
    } else {
      console.warn('[API Submit] ADMIN_REPORT_EMAIL not configured in environment variables');
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      recipient: adminEmail,
    });
  } catch (error) {
    console.error('[API Submit] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process and submit application', details: error.message },
      { status: 500 }
    );
  }
}
