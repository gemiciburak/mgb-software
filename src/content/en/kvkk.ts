import { CONTACT_EMAIL, FOUNDER, SITE_NAME } from '@/lib/constants';
import type { LegalDocument } from '@/types/content';

/** English translation of the KVKK notice. Keep in sync with content/tr/kvkk.ts. */
const email = CONTACT_EMAIL ?? '';

export const kvkk: LegalDocument = {
  title: 'Data Protection Notice',
  updated: '2026-10-09',
  intro: `This notice explains how personal data collected through the ${SITE_NAME} website and its quote form is processed, under Turkish Personal Data Protection Law No. 6698 (“KVKK”).`,
  sections: [
    {
      heading: 'Data controller',
      blocks: [
        {
          type: 'p',
          text: `Your personal data is processed by ${FOUNDER.name}, a software engineer operating as ${SITE_NAME} (“MGB Software”), as the data controller. Address: Ataşehir, Istanbul, Türkiye. You can reach us at ${email}.`,
        },
      ],
    },
    {
      heading: 'Personal data we process',
      blocks: [
        {
          type: 'list',
          items: [
            'Identity: full name.',
            'Contact: email address; your phone number if you message us on WhatsApp.',
            'Professional: company name (optional).',
            'Request details: the services you are interested in, budget range, timeline, project stage, your project description and your preferred reply channel.',
            'Transaction security: the IP address the form was sent from — briefly, and only to prevent abuse.',
            'If you book an intro call, the information you share through Calendly.',
          ],
        },
        {
          type: 'p',
          text: 'The form does not ask for special categories of personal data (health, religion, ethnicity, etc.); please do not include such information in your project description.',
        },
      ],
    },
    {
      heading: 'Purposes of processing',
      blocks: [
        {
          type: 'list',
          items: [
            'Reviewing your project request, replying to you and preparing a proposal.',
            'Scheduling an intro call if you ask for one.',
            'Pre-contract communication if your request turns into an agreement.',
            'Protecting the website and form against spam and abuse, and keeping information secure.',
            'Complying with legal obligations.',
          ],
        },
      ],
    },
    {
      heading: 'Collection method and legal grounds',
      blocks: [
        {
          type: 'p',
          text: 'Your personal data is collected electronically, partly by automated means, when you fill in the quote form, email us or book an intro call.',
        },
        {
          type: 'list',
          items: [
            'Reviewing your request and the proposal process: processing is necessary for entering into a contract, provided it directly relates to it (KVKK Art. 5/2-c).',
            'Security and abuse prevention: our legitimate interest, provided it does not harm your fundamental rights and freedoms (KVKK Art. 5/2-f).',
            'Legal obligations: compliance with a legal obligation (KVKK Art. 5/2-ç).',
            'Transfers abroad: your explicit consent, described below (KVKK Art. 9/6-a).',
          ],
        },
      ],
    },
    {
      heading: 'Transfers, including transfers abroad',
      blocks: [
        {
          type: 'p',
          text: 'Your personal data is never sold or shared with third parties for marketing. The following service providers are used to serve the site and to deliver and answer your request; their servers are located outside Türkiye (in the US and/or EU):',
        },
        {
          type: 'list',
          items: [
            'Resend, Inc. — the email service that delivers the form to MGB Software’s inbox.',
            'Google LLC (Gmail) — MGB Software’s email account; email sent to info@mgbsoftware.com.tr is forwarded here, and your request and later correspondence are stored here.',
            'Calendly LLC — only if you choose to book an intro call; Calendly then processes data under its own privacy notice.',
            'WhatsApp (Meta Platforms Ireland Ltd.) — only if you choose to message us on WhatsApp; your phone number, profile details and messages then reach us through WhatsApp, which processes data under its own privacy policy.',
            'Cloudflare, Inc. — the infrastructure that hosts and serves the site; on every visit, technical connection data such as your IP address and browser details is processed to deliver the site and protect it against attacks. Cloudflare also provides the email forwarding service (Email Routing) that delivers email sent to info@mgbsoftware.com.tr to MGB Software’s Gmail account.',
          ],
        },
        {
          type: 'p',
          text: 'The explicit consent you give when sending the form covers these transfers. About the possible risks: transferred data may be processed under a legal system not recognised as offering protection equivalent to Türkiye’s, and may be accessible to that country’s authorities. You are not required to consent; if you do not, you can simply email us. You can withdraw your consent at any time.',
        },
        {
          type: 'p',
          text: 'Your personal data may also be disclosed to public authorities that are legally entitled to request it, only upon such a request.',
        },
      ],
    },
    {
      heading: 'Retention',
      blocks: [
        {
          type: 'p',
          text: 'If your request does not lead to an agreement, your personal data is deleted within one year of our last correspondence at the latest. If it does, it is kept for the periods required by the applicable legislation. The IP address used for abuse prevention is processed briefly and only for that purpose.',
        },
      ],
    },
    {
      heading: 'Cookies and browser storage',
      blocks: [
        {
          type: 'p',
          text: 'The website does not use analytics or advertising cookies. Only the following records, needed for the site to work, are kept:',
        },
        {
          type: 'list',
          items: [
            'Theme preference — your light/dark choice is kept in your browser (localStorage) and never sent to the server.',
            'Form draft — if you leave the quote form unfinished, what you have entered is kept only in that tab (sessionStorage); it is deleted when the tab closes or the form is sent, and is not sent to the server until you submit.',
          ],
        },
        {
          type: 'p',
          text: 'The booking calendar on the thank-you screen is not loaded until you open it; once opened, Calendly may set its own cookies.',
        },
      ],
    },
    {
      heading: 'Your rights',
      blocks: [
        { type: 'p', text: 'Under Article 11 of the KVKK, you have the right to:' },
        {
          type: 'list',
          items: [
            'learn whether your personal data is processed,',
            'request information about it if it is,',
            'learn the purpose of processing and whether it is used accordingly,',
            'know the third parties, in Türkiye or abroad, to whom it is transferred,',
            'ask for it to be corrected if incomplete or inaccurate,',
            'ask for it to be deleted or destroyed under the conditions of Article 7,',
            'ask for third parties it was transferred to be notified of such correction, deletion or destruction,',
            'object to an outcome against you arising solely from automated analysis,',
            'claim compensation for damage caused by unlawful processing.',
          ],
        },
      ],
    },
    {
      heading: 'How to apply',
      blocks: [
        {
          type: 'p',
          text: `You can send requests about your rights to ${email} from the email address you previously shared with us, in line with the Communiqué on the Procedures and Principles of Application to the Data Controller. Requests are resolved free of charge within thirty days at the latest, depending on their nature.`,
        },
      ],
    },
  ],
  note: 'This is a translation; in case of any discrepancy, the Turkish version prevails.',
};
