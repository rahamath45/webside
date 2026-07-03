import './globals.css';

export const metadata = {
  title: 'CERT-In & ICAN — Indigenous Cybersecurity Products',
  description:
    'Joint Call for Information on Indigenous Cybersecurity Tools & Products. Submit your product for the CERT-In & ICAN initiative to identify, compile, showcase, and promote indigenous cybersecurity solutions developed in India.',
  keywords: [
    'CERT-In',
    'ICAN',
    'cybersecurity',
    'indigenous products',
    'India',
    'information security',
    'ITEL Foundation',
  ],
  authors: [{ name: 'CERT-In & ICAN' }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
