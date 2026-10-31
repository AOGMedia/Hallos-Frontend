/**
 * Intro copy for the public department pages (/course/department/[slug]).
 * The backend descriptions are placeholders ("Courses in X"), so these give
 * each indexed page its own text. Keyed by departmentSlug(); departments
 * without an entry fall back to a generic intro.
 */
export const DEPARTMENT_INTROS: Record<string, string> = {
  'accounting-and-finance-primary':
    'Build a solid foundation in bookkeeping, financial statements, budgeting and auditing. These self-paced accounting and finance courses suit beginners and anyone moving into a finance role.',
  'animal-care':
    'Learn how to look after animals with confidence, from everyday care and welfare to handling and health basics. Ideal for pet owners, volunteers and anyone starting a career with animals.',
  'business-skills':
    'Sharpen the skills every workplace values: communication, negotiation, project planning, sales and more. Practical business skills courses you can finish at your own pace and apply straight away.',
  'child-psychology':
    'Understand how children think, feel and develop. These child psychology courses cover development stages, behaviour and emotional wellbeing for parents, carers and education professionals.',
  construction:
    'Get to grips with construction fundamentals, site safety, building regulations and project management. Self-paced courses for site workers, supervisors and people entering the industry.',
  design:
    'Develop your eye and your toolkit with courses in graphic design, branding, layout and visual communication. Learn the principles and software skills behind work that stands out.',
  electronics:
    'Learn how circuits, components and electrical systems work, from the basics to practical troubleshooting. Online electronics courses for hobbyists, technicians and engineering beginners.',
  employability:
    'Stand out to employers with courses on CV writing, interviews, workplace communication and in-demand professional skills. Prepare for your next role and grow in the one you have.',
  'first-aid':
    'Know what to do when it matters. These first aid courses cover emergency response, CPR principles, common injuries and workplace first aid responsibilities.',
  'food-hygiene':
    'Learn safe food handling, storage, hygiene standards and food safety management. Essential training for anyone working in kitchens, catering, food retail or hospitality.',
  'health-and-safety':
    'Create safer workplaces with courses on risk assessment, fire safety, manual handling, hazardous substances and health and safety law. For employees, supervisors and managers.',
  'health-and-social-care':
    'Gain the knowledge to support people with dignity and care. Courses cover care practice, communication, safeguarding, mental health awareness and person-centred support.',
  healthcare:
    'Build your understanding of healthcare practice, patient care, medical terminology and clinical support. Self-paced courses for current and aspiring healthcare workers.',
  hospitality:
    'Deliver great guest experiences with courses on customer service, hotel and restaurant operations, events and hospitality management.',
  'it-and-software':
    'Grow your tech skills with courses in programming, data, cybersecurity, office software and IT support. Learn at your own pace and build skills employers are hiring for.',
  law:
    'Get a clear introduction to legal principles, contracts, employment law and compliance. Accessible law courses for professionals, business owners and curious learners.',
  management:
    'Lead with confidence. Management courses cover leadership, team building, operations, strategy and people management for new and experienced managers.',
  marketing:
    'Learn how to reach and win customers with courses in digital marketing, social media, content, SEO and brand strategy. Practical marketing skills for careers and businesses.',
  'personal-development':
    'Invest in yourself with courses on productivity, confidence, wellbeing, communication and life skills. The largest collection on Hallos, built to help you grow at your own pace.',
  safeguarding:
    'Learn how to recognise, prevent and respond to harm. Safeguarding courses for anyone working with children, young people or vulnerable adults.',
  teaching:
    'Develop your teaching practice with courses on lesson planning, classroom management, assessment and supporting learners. For teachers, tutors and teaching assistants.',
  'teaching-and-academics-primary':
    'Support young learners with courses focused on primary education, literacy, numeracy and early years teaching approaches.',
  training:
    'Become a more effective trainer with courses on designing, delivering and evaluating training sessions in the workplace.',
};

export function departmentIntro(slug: string, name: string, courseCount: number): string {
  return (
    DEPARTMENT_INTROS[slug] ??
    `Browse ${courseCount} self-paced ${name.toLowerCase()} courses on Hallos. Learn online at your own pace and earn a certificate when you finish.`
  );
}
