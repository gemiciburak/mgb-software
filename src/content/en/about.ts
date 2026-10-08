import type { AboutContent } from '@/types/content';

/**
 * About — English. Same voice rules as the Turkish file: the studio says
 * "we", the founder says "I"; no invented team, headcount or years.
 */
export const about: AboutContent = {
  meta: {
    title: 'About',
    description:
      'MGB Software is a digital technology studio that handles design and software end to end. Our vision, our founder and how we work.',
  },

  intro: {
    eyebrow: 'ABOUT',
    title: 'A studio where design and software sit at the same table.',
    body: [
      'MGB Software is a technology studio that designs and builds digital products for businesses, from first idea to launch, end to end. Websites and applications, interface design, backend systems, e-commerce, Apple platforms and technical drawing are handled under one roof, with the same care.',
      'Our vision is simple: products that look good but also load fast, work correctly and can still be maintained years from now. That is why we treat design and software not as two separate jobs but as two sides of the same one — and make both sets of decisions together from the start.',
    ],
    facts: [
      { label: 'MODEL', value: 'Founder-led studio' },
      { label: 'SCOPE', value: 'Design → Software → Launch' },
      { label: 'LANGUAGES', value: 'Türkçe · English' },
    ],
  },

  founder: {
    eyebrow: 'MEET THE FOUNDER',
    name: 'Burak Gemici',
    role: 'Founder & Software Engineer',
    bio: [
      'I founded MGB Software out of a passion for software development and digital design. I believe every project has its own needs, and I aim to build modern, functional and long-lasting digital solutions.',
      'When you start a project, you are not talking to a sales rep or an account manager — you are talking to the person who designs your product and writes its code. You ask me directly and get the answer first-hand.',
    ],
    contactLine: 'If you would like to talk about your project with me directly:',
  },

  principles: {
    eyebrow: 'HOW WE WORK',
    title: 'The big advantages of a small studio',
    description:
      'There are no agency layers in between, so speed, transparency and care reach you directly.',
    entries: [
      {
        title: 'Direct communication',
        description:
          'No links in the chain. The person in the meeting is the person building your product — nothing loses meaning on the way.',
      },
      {
        title: 'Transparent process',
        description:
          'A concrete outcome at the end of every step and a working build every week. You see progress in the product itself, not in a status report.',
      },
      {
        title: 'Built for your needs',
        description:
          'We do not adapt off-the-shelf templates. Scope is drawn around what your business actually needs, and we do not upsell features you do not.',
      },
      {
        title: 'Quality delivery',
        description:
          'Clean, documented code, tested flows, and source code and accounts that belong to you. After handover, anyone can keep building on it.',
      },
      {
        title: 'A limited number of projects',
        description:
          'We only take on as many projects as we can give real attention to. If the calendar is full, we say so upfront.',
      },
      {
        title: 'Honest scope',
        description:
          'If something is outside our expertise, we will not hide it. When needed we work with a specialist we trust — and tell you from day one.',
      },
    ],
  },

  cta: {
    title: 'Tell us about your project. Let’s talk directly.',
    description: 'Your request does not land in a queue; it goes straight to the founder’s inbox.',
  },
};
