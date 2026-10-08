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
    title: 'Every idea needs an interface.',
    body: [
      'MGB Software is a technology studio that designs and builds digital products for businesses, from first idea to launch, end to end. Web and mobile applications, interface design, backend systems, e-commerce and technical drawing are handled under one roof, with the same care.',
      'Looking good is not enough. A product has to load fast, behave correctly and keep up when you grow. So we treat design and engineering as two sides of one job, not two separate ones.',
    ],
    caption: 'WIREFRAME + INK',
  },

  founder: {
    eyebrow: 'MEET THE FOUNDER',
    name: 'Burak Gemici',
    role: 'Founder & Software Engineer',
    bio: [
      'I founded MGB Software out of a passion for software development and digital design. I believe every project has its own needs, and I aim to build modern, functional and long-lasting digital solutions.',
      'When you start a project, you are not talking to a sales rep — you are talking to the person who designs your product and writes its code. You ask me directly and get the answer first-hand.',
    ],
    contactLine: 'If you would like to write to me directly:',
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

  build: {
    eyebrow: 'WHAT WE BUILD',
    title: 'Things you can point at',
    entries: [
      'Websites',
      'Web Apps',
      'APIs',
      'Dashboards',
      'E-Commerce',
      'Mobile Apps',
      'Automation',
      '3D & Technical Design',
    ],
  },

  work: {
    eyebrow: 'SELECTED WORK',
    title: 'Projects are being crafted.',
    body: 'MGB Software is a new studio. We are not filling this space with work we did not do — the first projects will appear right here the moment they ship.',
    status: 'IN PRODUCTION',
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

  technology: {
    eyebrow: 'TECHNOLOGY',
    title: 'What we build with',
    description:
      'Tools are chosen for how long the project has to live, not for what is trending. All mature, well documented and maintainable years from now.',
    entries: [
      { slug: 'nextjs', name: 'Next.js', role: 'Web framework' },
      { slug: 'react', name: 'React', role: 'Interface' },
      { slug: 'typescript', name: 'TypeScript', role: 'Type safety' },
      { slug: 'nestjs', name: 'NestJS', role: 'Backend framework' },
      { slug: 'nodejs', name: 'Node.js', role: 'Runtime' },
      { slug: 'mongodb', name: 'MongoDB', role: 'Database' },
      { slug: 'docker', name: 'Docker', role: 'Deployment' },
      { slug: 'figma', name: 'Figma', role: 'Design' },
      { slug: 'swift', name: 'Swift', role: 'Apple platforms' },
    ],
  },

  values: {
    eyebrow: 'WHY MGB',
    title: 'The big advantages of a small studio',
    entries: [
      {
        slug: 'direct',
        title: 'Direct Communication',
        description:
          'The person you talk to is the person building your product; nothing gets lost in hand-offs.',
      },
      {
        slug: 'transparent',
        title: 'Transparent Process',
        description:
          'A working build every week; you see progress in the product itself, not in a report.',
      },
      {
        slug: 'tailored',
        title: 'Built for Your Needs',
        description:
          'No off-the-shelf templates; scope is drawn around what your business actually needs.',
      },
      {
        slug: 'quality',
        title: 'Quality Delivery',
        description:
          'A limited number of projects at a time; documented code, and source and accounts that are yours.',
      },
    ],
  },

  cta: {
    title: "Have an idea? Let's build it.",
    description: 'Tell us about your project and we will work out where to start.',
  },
};
