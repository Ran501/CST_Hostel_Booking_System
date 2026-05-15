import * as nodemailer from "nodemailer";

export async function sendBookingEmail(to: string, details: {
  roomNumber: string,
  userId: string,
  checkIn: string,
  hostelName: string,
  floor: string
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Hostel Management" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: `Booking Confirmed: ${details.roomNumber}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 400px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #2563eb; margin-top: 0;">Room Booking Confirmed</h2>
        <p>Your room has been booked successfully.</p>
        <p><strong>Hostel:</strong> ${details.hostelName}</p>
        <p><strong>Floor:</strong> ${details.floor}</p>
        <p><strong>Room Number:</strong> ${details.roomNumber}</p>
        <p><strong>Student Number:</strong> ${details.userId}</p>
        <p><strong>Booked on:</strong> ${new Date(details.checkIn).toLocaleDateString()}</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #777;">This is an automated confirmation from the Room Booking System.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}
