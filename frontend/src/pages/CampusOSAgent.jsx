import { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, BookOpen, Briefcase, Loader2, Target, Sparkles } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { campusOSChat } from '../services/api';

const modes = [
  { value: 'learning', label: 'Learning Coach', icon: BookOpen, gradient: 'from-indigo-500 to-violet-600', description: 'Get a personalized study plan with daily schedules, topic recommendations, and revision tips.' },
  { value: 'placement', label: 'Placement Prep', icon: Briefcase, gradient: 'from-amber-500 to-orange-600', description: 'Generate a customized placement preparation plan with company insights and roadmap.' },
];

const subjects = [
  'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Data Structures', 'Algorithms', 'Machine Learning', 'Database Systems',
];

const experienceLevels = ['Fresher', '1-2 years', '3-5 years', 'Senior (5+ years)'];

export default function CampusOSAgent() {
  const [mode, setMode] = useState('learning');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    current_skill_level: 'beginner',
    exam_date: '',
    study_hours_per_day: 2,
    company_name: '',
    job_role: '',
    current_skills: '',
    experience_level: 'Fresher',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = { mode, ...formData };
      const res = await campusOSChat(payload);
      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.message || 'Failed to generate plan');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BrainCircuit}
        title="CampusOS AI"
        subtitle="Your unified AI assistant for learning and placement preparation"
        gradient="from-indigo-600 via-violet-700 to-purple-800"
      />

      {/* Mode Selector */}
      <div className="grid gap-4 md:grid-cols-2">
        {modes.map((m) => {
          const Icon = m.icon;
          const active = mode === m.value;
          return (
            <motion.button
              key={m.value}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => { setMode(m.value); setResult(null); }}
              className={`glass-card rounded-2xl p-5 text-left transition-all duration-200 ${
                active ? 'ring-2 ring-primary-500 shadow-lg' : ''
              }`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shadow-lg mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{m.label}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{m.description}</p>
            </motion.button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-2">
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit}
            className="glass-card rounded-2xl p-6 space-y-5"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {mode === 'learning' ? 'Study Plan Details' : 'Placement Details'}
            </h3>

            {mode === 'learning' ? (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => updateField('subject', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select subject...</option>
                    {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Skill Level</label>
                  <select
                    value={formData.current_skill_level}
                    onChange={(e) => updateField('current_skill_level', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Exam Date (optional)</label>
                  <input
                    type="date"
                    value={formData.exam_date}
                    onChange={(e) => updateField('exam_date', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Study Hours/Day</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.study_hours_per_day}
                    onChange={(e) => updateField('study_hours_per_day', parseInt(e.target.value) || 2)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Company Name *</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => updateField('company_name', e.target.value)}
                    placeholder="e.g. Google, Microsoft, Amazon"
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Job Role *</label>
                  <input
                    type="text"
                    value={formData.job_role}
                    onChange={(e) => updateField('job_role', e.target.value)}
                    placeholder="e.g. Software Engineer, Data Scientist"
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Current Skills</label>
                  <textarea
                    value={formData.current_skills}
                    onChange={(e) => updateField('current_skills', e.target.value)}
                    placeholder="e.g. Python, JavaScript, SQL, Machine Learning"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Experience Level</label>
                  <select
                    value={formData.experience_level}
                    onChange={(e) => updateField('experience_level', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    {experienceLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
              {loading ? 'Generating...' : `Generate ${mode === 'learning' ? 'Study Plan' : 'Placement Plan'}`}
            </motion.button>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs">{error}</div>
            )}
          </motion.form>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {!result && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-10 text-center">
              <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Ready to Get Started?</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                {mode === 'learning'
                  ? 'Select your subject and preferences to generate a personalized study plan.'
                  : 'Enter company and role details to create a placement preparation roadmap.'}
              </p>
            </motion.div>
          )}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-10 text-center">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">AI is creating your plan...</p>
            </motion.div>
          )}

          {result && (
            <>
              {result.studyPlan && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Study Plan</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{result.studyPlan}</p>
                </motion.div>
              )}

              {result.importantTopics && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400" /> Important Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.importantTopics.map((topic, i) => (
                      <span key={i} className="badge bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-500/20">
                        {topic}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {result.dailySchedule && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Daily Schedule</h3>
                  <div className="space-y-2">
                    {result.dailySchedule.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
                        <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {result.revisionTips && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Revision Tips</h3>
                  <ul className="space-y-2">
                    {result.revisionTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <span className="text-primary-500 mt-0.5">•</span> {tip}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {result.companyName && (
                <>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{result.companyName} - {result.jobRole}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{result.summary}</p>
                  </motion.div>
                  {result.companyOverview && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-5">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Company Overview</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{result.companyOverview}</p>
                    </motion.div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}