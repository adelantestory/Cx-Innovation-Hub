import { PrismaClient, UserRole, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Users (MUST be first - other entities reference users)
  console.log('Creating users...');
  const users = await prisma.user.createMany({
    data: [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@taskify.dev',
        role: 'PM' as UserRole,
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
      },
      {
        name: 'Alex Chen',
        email: 'alex.chen@taskify.dev',
        role: 'Engineer' as UserRole,
        avatarUrl: 'https://i.pravatar.cc/150?img=2',
      },
      {
        name: 'Jordan Lee',
        email: 'jordan.lee@taskify.dev',
        role: 'Engineer' as UserRole,
        avatarUrl: 'https://i.pravatar.cc/150?img=3',
      },
      {
        name: 'Taylor Kim',
        email: 'taylor.kim@taskify.dev',
        role: 'Engineer' as UserRole,
        avatarUrl: 'https://i.pravatar.cc/150?img=4',
      },
      {
        name: 'Morgan Patel',
        email: 'morgan.patel@taskify.dev',
        role: 'Engineer' as UserRole,
        avatarUrl: 'https://i.pravatar.cc/150?img=5',
      },
    ],
  });
  console.log(`✅ Created ${users.count} users`);

  // Fetch created users for foreign key references
  const allUsers = await prisma.user.findMany();
  const [sarah, alex, jordan, taylor, morgan] = allUsers;

  // 2. Create Projects
  console.log('Creating projects...');
  const projects = await prisma.project.createMany({
    data: [
      {
        name: 'Mobile App Redesign',
        description:
          'Redesign of the iOS and Android apps with new branding and improved UX',
      },
      {
        name: 'Website Refresh',
        description:
          'Update marketing website with new branding, case studies, and testimonials',
      },
      {
        name: 'API v2 Migration',
        description:
          'Migrate legacy REST API to v2 architecture with GraphQL support',
      },
    ],
  });
  console.log(`✅ Created ${projects.count} projects`);

  // Fetch created projects
  const allProjects = await prisma.project.findMany();
  const [mobileApp, websiteRefresh, apiMigration] = allProjects;

  // 3. Create ProjectMembers (all users in all projects)
  console.log('Creating project memberships...');
  let memberCount = 0;
  for (const project of allProjects) {
    for (const user of allUsers) {
      await prisma.projectMember.create({
        data: {
          projectId: project.id,
          userId: user.id,
        },
      });
      memberCount++;
    }
  }
  console.log(`✅ Created ${memberCount} project memberships`);

  // 4. Create Tasks (~13-15 per project)
  console.log('Creating tasks...');

  // Mobile App Redesign tasks
  const mobileAppTasks = [
    // To Do (6 tasks - 40%)
    {
      title: 'Design new login screen',
      description: 'Create modern, accessible login UI with social auth options',
      status: 'ToDo' as TaskStatus,
      orderIndex: 0,
      assignedTo: alex.id,
      projectId: mobileApp.id,
    },
    {
      title: 'Create onboarding flow wireframes',
      description: 'Design 3-step onboarding with feature highlights',
      status: 'ToDo' as TaskStatus,
      orderIndex: 1,
      assignedTo: null,
      projectId: mobileApp.id,
    },
    {
      title: 'Design user profile page',
      description: 'Profile page with avatar, bio, and settings',
      status: 'ToDo' as TaskStatus,
      orderIndex: 2,
      assignedTo: jordan.id,
      projectId: mobileApp.id,
    },
    {
      title: 'Update app icon and splash screen',
      description: 'New branding for app icon and launch screen',
      status: 'ToDo' as TaskStatus,
      orderIndex: 3,
      assignedTo: null,
      projectId: mobileApp.id,
    },
    {
      title: 'Design settings screen',
      description: 'Settings UI with theme toggle, notifications, account',
      status: 'ToDo' as TaskStatus,
      orderIndex: 4,
      assignedTo: taylor.id,
      projectId: mobileApp.id,
    },
    {
      title: 'Create dark mode color palette',
      description: 'Define dark theme colors for all UI components',
      status: 'ToDo' as TaskStatus,
      orderIndex: 5,
      assignedTo: null,
      projectId: mobileApp.id,
    },
    // In Progress (4 tasks - 30%)
    {
      title: 'Implement user authentication flow',
      description: 'JWT-based auth with social login integration',
      status: 'InProgress' as TaskStatus,
      orderIndex: 0,
      assignedTo: alex.id,
      projectId: mobileApp.id,
    },
    {
      title: 'Build reusable UI components',
      description: 'Button, Input, Card, Modal components with theming',
      status: 'InProgress' as TaskStatus,
      orderIndex: 1,
      assignedTo: jordan.id,
      projectId: mobileApp.id,
    },
    {
      title: 'Integrate analytics SDK',
      description: 'Add event tracking for user interactions',
      status: 'InProgress' as TaskStatus,
      orderIndex: 2,
      assignedTo: null,
      projectId: mobileApp.id,
    },
    {
      title: 'Add push notification support',
      description: 'FCM integration for iOS and Android',
      status: 'InProgress' as TaskStatus,
      orderIndex: 3,
      assignedTo: morgan.id,
      projectId: mobileApp.id,
    },
    // In Review (3 tasks - 20%)
    {
      title: 'Review API integration code',
      description: 'Code review for REST API client implementation',
      status: 'InReview' as TaskStatus,
      orderIndex: 0,
      assignedTo: sarah.id,
      projectId: mobileApp.id,
    },
    {
      title: 'Test offline mode functionality',
      description: 'Verify app works without internet connection',
      status: 'InReview' as TaskStatus,
      orderIndex: 1,
      assignedTo: taylor.id,
      projectId: mobileApp.id,
    },
    {
      title: 'Security audit of authentication',
      description: 'Penetration testing of auth flow',
      status: 'InReview' as TaskStatus,
      orderIndex: 2,
      assignedTo: null,
      projectId: mobileApp.id,
    },
    // Done (2 tasks - 10%)
    {
      title: 'Set up project repository',
      description: 'Initialize Git repo with CI/CD pipeline',
      status: 'Done' as TaskStatus,
      orderIndex: 0,
      assignedTo: alex.id,
      projectId: mobileApp.id,
    },
    {
      title: 'Configure CI/CD pipeline',
      description: 'GitHub Actions for automated testing and deployment',
      status: 'Done' as TaskStatus,
      orderIndex: 1,
      assignedTo: jordan.id,
      projectId: mobileApp.id,
    },
  ];

  // Website Refresh tasks
  const websiteRefreshTasks = [
    // To Do (6 tasks)
    {
      title: 'Design new homepage layout',
      description: 'Modern hero section with product showcase',
      status: 'ToDo' as TaskStatus,
      orderIndex: 0,
      assignedTo: jordan.id,
      projectId: websiteRefresh.id,
    },
    {
      title: 'Write case study content',
      description: 'Document 3 customer success stories',
      status: 'ToDo' as TaskStatus,
      orderIndex: 1,
      assignedTo: sarah.id,
      projectId: websiteRefresh.id,
    },
    {
      title: 'Create testimonial section',
      description: 'Carousel with customer quotes and photos',
      status: 'ToDo' as TaskStatus,
      orderIndex: 2,
      assignedTo: null,
      projectId: websiteRefresh.id,
    },
    {
      title: 'Optimize images for web',
      description: 'Compress and convert to WebP format',
      status: 'ToDo' as TaskStatus,
      orderIndex: 3,
      assignedTo: morgan.id,
      projectId: websiteRefresh.id,
    },
    {
      title: 'Update navigation menu',
      description: 'Redesign top nav with new sections',
      status: 'ToDo' as TaskStatus,
      orderIndex: 4,
      assignedTo: null,
      projectId: websiteRefresh.id,
    },
    {
      title: 'Create pricing comparison table',
      description: 'Interactive pricing tiers with features',
      status: 'ToDo' as TaskStatus,
      orderIndex: 5,
      assignedTo: taylor.id,
      projectId: websiteRefresh.id,
    },
    // In Progress (4 tasks)
    {
      title: 'Implement responsive design',
      description: 'Mobile-first CSS for all pages',
      status: 'InProgress' as TaskStatus,
      orderIndex: 0,
      assignedTo: jordan.id,
      projectId: websiteRefresh.id,
    },
    {
      title: 'Add contact form with validation',
      description: 'Form with email integration and spam protection',
      status: 'InProgress' as TaskStatus,
      orderIndex: 1,
      assignedTo: alex.id,
      projectId: websiteRefresh.id,
    },
    {
      title: 'Set up Google Analytics',
      description: 'Track pageviews and conversion events',
      status: 'InProgress' as TaskStatus,
      orderIndex: 2,
      assignedTo: null,
      projectId: websiteRefresh.id,
    },
    {
      title: 'Implement blog section',
      description: 'Markdown-based blog with CMS integration',
      status: 'InProgress' as TaskStatus,
      orderIndex: 3,
      assignedTo: taylor.id,
      projectId: websiteRefresh.id,
    },
    // In Review (3 tasks)
    {
      title: 'Review SEO meta tags',
      description: 'Audit and optimize all page metadata',
      status: 'InReview' as TaskStatus,
      orderIndex: 0,
      assignedTo: sarah.id,
      projectId: websiteRefresh.id,
    },
    {
      title: 'Test page load performance',
      description: 'Lighthouse audit and optimization',
      status: 'InReview' as TaskStatus,
      orderIndex: 1,
      assignedTo: morgan.id,
      projectId: websiteRefresh.id,
    },
    {
      title: 'Cross-browser compatibility testing',
      description: 'Test on Chrome, Firefox, Safari, Edge',
      status: 'InReview' as TaskStatus,
      orderIndex: 2,
      assignedTo: null,
      projectId: websiteRefresh.id,
    },
    // Done (2 tasks)
    {
      title: 'Purchase new domain',
      description: 'Secure .com domain and configure DNS',
      status: 'Done' as TaskStatus,
      orderIndex: 0,
      assignedTo: sarah.id,
      projectId: websiteRefresh.id,
    },
    {
      title: 'Set up hosting environment',
      description: 'Configure Vercel deployment',
      status: 'Done' as TaskStatus,
      orderIndex: 1,
      assignedTo: alex.id,
      projectId: websiteRefresh.id,
    },
  ];

  // API v2 Migration tasks
  const apiMigrationTasks = [
    // To Do (6 tasks)
    {
      title: 'Design GraphQL schema',
      description: 'Define types, queries, mutations for all resources',
      status: 'ToDo' as TaskStatus,
      orderIndex: 0,
      assignedTo: alex.id,
      projectId: apiMigration.id,
    },
    {
      title: 'Document breaking changes',
      description: 'List all v1 → v2 API differences',
      status: 'ToDo' as TaskStatus,
      orderIndex: 1,
      assignedTo: sarah.id,
      projectId: apiMigration.id,
    },
    {
      title: 'Create migration guide for clients',
      description: 'Step-by-step guide with code examples',
      status: 'ToDo' as TaskStatus,
      orderIndex: 2,
      assignedTo: null,
      projectId: apiMigration.id,
    },
    {
      title: 'Set up GraphQL server',
      description: 'Apollo Server with Express integration',
      status: 'ToDo' as TaskStatus,
      orderIndex: 3,
      assignedTo: taylor.id,
      projectId: apiMigration.id,
    },
    {
      title: 'Implement rate limiting',
      description: 'Per-client rate limits with Redis',
      status: 'ToDo' as TaskStatus,
      orderIndex: 4,
      assignedTo: null,
      projectId: apiMigration.id,
    },
    {
      title: 'Add API versioning strategy',
      description: 'Support v1 and v2 endpoints simultaneously',
      status: 'ToDo' as TaskStatus,
      orderIndex: 5,
      assignedTo: morgan.id,
      projectId: apiMigration.id,
    },
    // In Progress (5 tasks)
    {
      title: 'Migrate user endpoints to v2',
      description: 'Convert /users REST endpoints to GraphQL',
      status: 'InProgress' as TaskStatus,
      orderIndex: 0,
      assignedTo: alex.id,
      projectId: apiMigration.id,
    },
    {
      title: 'Migrate project endpoints to v2',
      description: 'Convert /projects REST endpoints to GraphQL',
      status: 'InProgress' as TaskStatus,
      orderIndex: 1,
      assignedTo: jordan.id,
      projectId: apiMigration.id,
    },
    {
      title: 'Add authentication middleware',
      description: 'JWT validation for GraphQL context',
      status: 'InProgress' as TaskStatus,
      orderIndex: 2,
      assignedTo: taylor.id,
      projectId: apiMigration.id,
    },
    {
      title: 'Write integration tests',
      description: 'Test all GraphQL queries and mutations',
      status: 'InProgress' as TaskStatus,
      orderIndex: 3,
      assignedTo: null,
      projectId: apiMigration.id,
    },
    {
      title: 'Set up API monitoring',
      description: 'Track response times and error rates',
      status: 'InProgress' as TaskStatus,
      orderIndex: 4,
      assignedTo: morgan.id,
      projectId: apiMigration.id,
    },
    // In Review (2 tasks)
    {
      title: 'Review GraphQL security',
      description: 'Audit for injection attacks and depth limits',
      status: 'InReview' as TaskStatus,
      orderIndex: 0,
      assignedTo: sarah.id,
      projectId: apiMigration.id,
    },
    {
      title: 'Load test v2 endpoints',
      description: 'Ensure performance under load',
      status: 'InReview' as TaskStatus,
      orderIndex: 1,
      assignedTo: taylor.id,
      projectId: apiMigration.id,
    },
    // Done (2 tasks)
    {
      title: 'Set up development environment',
      description: 'Docker compose with PostgreSQL and Redis',
      status: 'Done' as TaskStatus,
      orderIndex: 0,
      assignedTo: jordan.id,
      projectId: apiMigration.id,
    },
    {
      title: 'Create v2 API documentation',
      description: 'GraphQL Playground with examples',
      status: 'Done' as TaskStatus,
      orderIndex: 1,
      assignedTo: alex.id,
      projectId: apiMigration.id,
    },
  ];

  // Insert all tasks
  const allTasks = [
    ...mobileAppTasks,
    ...websiteRefreshTasks,
    ...apiMigrationTasks,
  ];
  for (const task of allTasks) {
    await prisma.task.create({ data: task });
  }
  console.log(`✅ Created ${allTasks.length} tasks`);

  // 5. Create Comments (8-12 total, scattered across tasks)
  console.log('Creating comments...');
  const tasks = await prisma.task.findMany();

  const sampleComments = [
    {
      taskId: tasks[0].id,
      authorId: sarah.id,
      content:
        'Great progress on this! Can we add error handling for edge cases?',
      createdAt: new Date('2026-01-24T10:00:00Z'),
    },
    {
      taskId: tasks[0].id,
      authorId: alex.id,
      content: "Sure, I'll add that today.",
      createdAt: new Date('2026-01-24T10:15:00Z'),
    },
    {
      taskId: tasks[5].id,
      authorId: jordan.id,
      content: 'This is ready for review.',
      createdAt: new Date('2026-01-25T09:00:00Z'),
      editedAt: new Date('2026-01-25T09:30:00Z'), // Edited comment
    },
    {
      taskId: tasks[10].id,
      authorId: taylor.id,
      content: 'Found a bug in the authentication flow. Investigating.',
      createdAt: new Date('2026-01-23T14:30:00Z'),
    },
    {
      taskId: tasks[10].id,
      authorId: alex.id,
      content: 'Thanks for catching that! Let me know if you need help.',
      createdAt: new Date('2026-01-23T15:00:00Z'),
    },
    {
      taskId: tasks[15].id,
      authorId: morgan.id,
      content: 'Should we add unit tests for this feature?',
      createdAt: new Date('2026-01-22T11:00:00Z'),
    },
    {
      taskId: tasks[15].id,
      authorId: sarah.id,
      content: 'Yes, please add tests before marking as done.',
      createdAt: new Date('2026-01-22T11:30:00Z'),
    },
    {
      taskId: tasks[20].id,
      authorId: jordan.id,
      content: 'Design looks great! Approved.',
      createdAt: new Date('2026-01-21T16:00:00Z'),
    },
    {
      taskId: tasks[25].id,
      authorId: alex.id,
      content: 'This will be more complex than expected. Need 2 more days.',
      createdAt: new Date('2026-01-24T09:00:00Z'),
      editedAt: new Date('2026-01-24T09:15:00Z'),
    },
    {
      taskId: tasks[30].id,
      authorId: taylor.id,
      content: 'Documentation updated in the wiki.',
      createdAt: new Date('2026-01-25T13:00:00Z'),
    },
  ];

  for (const comment of sampleComments) {
    await prisma.comment.create({ data: comment });
  }
  console.log(`✅ Created ${sampleComments.length} comments`);

  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('Summary:');
  console.log(`- Users: ${users.count}`);
  console.log(`- Projects: ${projects.count}`);
  console.log(`- Project Members: ${memberCount}`);
  console.log(`- Tasks: ${allTasks.length}`);
  console.log(`- Comments: ${sampleComments.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
