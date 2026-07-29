import { motion } from 'framer-motion';
import { Info, Compass, Building2, Trophy, Sparkles, Code2, Server, Brain, Wrench } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const agents = [
  { icon: Compass, name: 'Campus Navigation AI', description: 'Guides students to any campus facility with step-by-step directions, building names, and floor details.', gradient: 'from-blue-500 to-blue-600' },
  { icon: Building2, name: 'Hostel Complaint AI', description: 'Automatically classifies hostel complaints, assigns priority levels, generates tracking IDs, and stores them for resolution.', gradient: 'from-emerald-500 to-teal-600' },
];

const techStack = [
  { category: 'Frontend', icon: Code2, color: 'text-blue-500', items: ['React 18', 'Tailwind CSS', 'Vite', 'Framer Motion', 'Lucide React'] },
  { category: 'Backend',  icon: Server, color: 'text-emerald-500', items: ['Python', 'FastAPI', 'SQLAlchemy', 'SQLite', 'Uvicorn'] },
  { category: 'AI / ML',  icon: Brain,  color: 'text-purple-500', items: ['Google Gemini API', 'Intent Classification', 'Priority Assignment', 'Multi-Agent System'] },
  { category: 'Tools',    icon: Wrench, color: 'text-amber-500',  items: ['Git', 'VS Code', 'Postman', 'Docker'] },
];

const team = [
  { name: 'Deepak S', role: 'AI Engineer & Full Stack Developer', initials: 'DS', gradient: 'from-primary-500 to-secondary-600' },
  { name: 'CampusMate Team', role: 'Hackathon Project', initials: 'CT', gradient: 'from-emerald-500 to-teal-600' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function About() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={itemVariants}>
        <PageHeader
          icon={Info}
          title="About CampusMate AI"
          description="An intelligent multi-agent AI platform for campus navigation and hostel complaint management."
          gradient="from-primary-600 via-secondary-700 to-indigo-800"
        />
      </motion.div>

      {/* Hero */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Empowering Campus Life with AI</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 max-w-2xl">
              CampusMate AI is a next-generation campus assistant that leverages multiple specialized AI agents to help students navigate campus facilities and report hostel issues seamlessly. Built with a modern tech stack for the Smart Campus Hackathon.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="badge bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-500/20">
                <Trophy className="w-3 h-3" /> Hackathon Project
              </span>
              <span className="badge bg-accent-50 dark:bg-accent-500/10 text-accent-700 dark:text-accent-400 border border-accent-200 dark:border-accent-500/20">
                <Sparkles className="w-3 h-3" /> Multi-Agent System
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Agents */}
      <motion.div variants={itemVariants}>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">AI Agents</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {agents.map((agent, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-lg mb-4`}>
                <agent.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">{agent.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{agent.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tech Stack */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">Technology Stack</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {techStack.map((stack, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 mb-3">
                <stack.icon className={`w-4 h-4 ${stack.color}`} />
                <h3 className={`text-xs font-bold uppercase tracking-wider ${stack.color}`}>{stack.category}</h3>
              </div>
              <ul className="space-y-1.5">
                {stack.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Team */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Team</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {team.map((member, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.01 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                {member.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{member.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
