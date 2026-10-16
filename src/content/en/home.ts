import type { HomeContent } from '@/types/content';

/**
 * Homepage copy — English.
 *
 * Written natively rather than translated: the Turkish and English versions
 * carry the same meaning but each reads like it was written first.
 */
export const home: HomeContent = {
  philosophy: {
    eyebrow: 'ABOUT',
    title: 'Design and software, end to end.',
    body: [
      'MGB Software is a technology studio that designs and builds digital products for businesses, from first idea to launch.',
      'We treat design and engineering as two sides of one job, not two separate ones. The result: products that look good, load fast, work correctly and can still be maintained years from now.',
    ],
    facts: [
      { label: 'MODEL', value: 'Founder-led studio' },
      { label: 'SCOPE', value: 'Design to launch' },
      { label: 'LANGUAGES', value: 'Türkçe · English' },
    ],
    caption: 'SOFTWARE + DESIGN',
  },

  founder: {
    eyebrow: 'MEET THE FOUNDER',
    name: 'Burak Gemici',
    role: 'Founder & Software Engineer',
    photo: { src: '/founder.webp', width: 960, height: 1200, alt: 'Portrait of Burak Gemici' },
    bio: [
      'I founded MGB Software out of a passion for software development and digital design. I believe every project has its own needs, and I aim to build modern, functional and long-lasting digital solutions.',
      'When you start a project, you are not talking to a sales rep — you are talking to the person who designs your product and writes its code. You ask me directly and get the answer first-hand.',
    ],
    contactLabel: 'DIRECT CONTACT',
  },

  services: {
    eyebrow: 'SERVICES',
    title: 'What we do',
    entries: [
      {
        slug: 'web-development',
        title: 'Web Development',
        summary:
          'Corporate sites, landing pages and web applications. Fast to load, findable in search, and editable by your own team without calling us.',
        deliverables: ['Corporate site', 'Landing page', 'Web application', 'Content management'],
      },
      {
        slug: 'ui-ux-design',
        title: 'UI/UX Design',
        summary:
          'Interface design, UX strategy, prototyping and design systems. Flows where people never have to stop and work out what to do next.',
        deliverables: ['Interface design', 'UX strategy', 'Prototyping', 'Design system'],
      },
      {
        slug: 'software-backend',
        title: 'Software & Backend',
        summary:
          'Custom software, backend systems, API development and integration, admin dashboards, and automation that removes repeated manual work.',
        deliverables: ['API development', 'System integration', 'Admin dashboard', 'Automation'],
      },
      {
        slug: 'mobile-apple',
        title: 'Mobile & Apple',
        summary:
          'iOS and macOS applications. Native to the platform, fast and fluid — not a website wearing an app costume.',
        deliverables: ['iOS app', 'macOS app', 'App Store release'],
      },
      {
        slug: 'e-commerce',
        title: 'E-Commerce',
        summary:
          'Online stores and payment integrations. One working flow from adding a product to checkout, shipping and returns.',
        deliverables: ['Online store', 'Payment integration', 'Product management'],
      },
      {
        slug: 'technical-design-3d',
        title: '3D & Technical Design',
        summary:
          'AutoCAD technical drawing and SketchUp 3D modelling. The same precision we bring to digital products, applied to physical ones.',
        deliverables: ['AutoCAD technical drawing', 'SketchUp 3D modelling', 'Visualisation'],
      },
    ],
  },

  work: {
    eyebrow: 'SELECTED WORK',
    title: 'Projects are being crafted.',
    body: 'MGB Software is a new studio. We are not filling this space with work we did not do — the first projects will appear right here the moment they ship.',
    status: 'IN PRODUCTION',
    concept: 'Concept',
    indexTitle: 'The first ones are live. More are on the way.',
    soon: 'COMING SOON',
    visit: 'Visit site',
  },

  process: {
    eyebrow: 'PROCESS',
    title: 'How we work',
    description: 'Five steps. Each one ends with something concrete in your hands.',
    steps: [
      {
        title: 'Discover',
        description:
          'We work out what you want to build, who it is for, and how we will know it worked.',
        deliverable: 'Scope and roadmap',
      },
      {
        title: 'Design',
        description:
          'We build the flows and the interface. You can see and click through the product before a line of code exists.',
        deliverable: 'Prototype and design system',
      },
      {
        title: 'Build',
        description:
          'Frontend and infrastructure move together. Every week you see where we are through a version that actually runs.',
        deliverable: 'Working release',
      },
      {
        title: 'Launch',
        description:
          'Domain, server, monitoring and security. Going live is our job, not something we hand back to you.',
        deliverable: 'Product in production',
      },
      {
        title: 'Improve',
        description:
          'Launch is the start, not the finish. We measure real usage, fix what gets in the way and keep developing.',
        deliverable: 'Maintenance and ongoing work',
      },
    ],
  },

  faq: {
    eyebrow: 'FAQ',
    title: 'Frequently asked questions',
    description: 'What people most often want to know before starting.',
    contactLine: 'Can’t find your answer here? Write to us directly:',
    entries: [
      {
        question: 'How does a project start?',
        answer:
          'You fill in the quote form: four short steps, about two minutes. We read your request and get back to you through the channel you chose. If you like, we go over the details in a 30-minute call, then send scope, timeline and budget in a written proposal.',
      },
      {
        question: 'How is pricing determined?',
        answer:
          'We do not sell fixed packages; the price follows the scope of the project. Once the scope is clear, we prepare a proposal that spells out exactly what is included. If you already have a budget, mentioning it in the form helps us shape the scope around it.',
      },
      {
        question: 'How long does a project take?',
        answer:
          'It depends on the scope; a one-page site and a web application with an admin panel do not run on the same calendar. The timeline is stated in the written proposal, and during development you see where we are through a working build every week.',
      },
      {
        question: 'Who builds my project?',
        answer:
          'MGB Software is a founder-led studio: your project is designed and built by the founder, Burak Gemici, not handed down through an account manager. If something falls outside our expertise, we work with a specialist we trust and tell you from day one.',
        hideOnMobile: true,
      },
      {
        question: 'Who owns the source code and accounts?',
        answer:
          'You do. The source code and access to the services your product runs on are handed over to you on delivery, so another team can keep building on it later if you wish.',
      },
      {
        question: 'What technologies do you use?',
        answer:
          'Tools are chosen for how long the project has to live, not for what is trending. On the web we use Next.js, React and TypeScript; on the backend Node.js and NestJS; MongoDB for data and Docker for deployment. Design happens in Figma, and Apple platforms are built with Swift. All mature, well documented tools: maintainable years from now, and easy for another team to pick up.',
        hideOnMobile: true,
      },
      {
        question: 'Do you offer support after launch?',
        answer:
          'Yes. Launch is not the finish line for us: we watch real usage, fix what is not working and keep improving the product. The scope of maintenance and further development is stated separately in the proposal.',
      },
      {
        question: 'Can you take over an existing project?',
        answer:
          'Yes. We first review the existing code and infrastructure and share an honest assessment. Then we decide together whether building on it or rebuilding makes more sense.',
      },
      {
        question: 'Do you work in English or remotely?',
        answer:
          'Yes. We work in Turkish and English, and meetings can be held online, so your location does not matter.',
        hideOnMobile: true,
      },
    ],
  },

  cta: {
    title: "Have an idea? Let's build it.",
    description: 'Tell us about your project and we will work out where to start.',
  },
};
