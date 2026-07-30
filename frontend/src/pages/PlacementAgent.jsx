import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Building2, Target, Lightbulb, ChevronRight, BookOpen, Clock, Award, Loader2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { campusOSChat } from '../services/api';

const experienceLevels = ['Fresher', '1-2 years', '3-5 years', 'Senior (5+ years)'];

export default function PlacementAgent() {
  const [formData, setFormData] = useState({
    company_name: '',
    job_role: '',
    current_skills: '',
    experience_level: 'Fresher',
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    setPlan(null);
    try {
      const payload = {
        mode: 'placement',
        company_name: formData.company_name,
        job_role: formData.job_role,
        current_skills: formData.current_skills,
        experience_level: formData.experience_level,
      };
      const res = await campusOSChat(payload);
      if (res.success && res.data) {
        setPlan(res.data);
      } else {
        setError('Failed to generate plan. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Briefcase}
        title="Placement Agent"
        subtitle="Your personal AI placement and career guide - generate customized preparation plans"
        gradient="from-amber-500 to-orange-600"
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-2">
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit}
            className="glass-card rounded-2xl p-6 space-y-5"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Generate Preparation Plan</h3>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Company Name *</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, job_role: e.target.value })}
                placeholder="e.g. Software Engineer, Data Scientist"
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Current Skills</label>
              <textarea
                value={formData.current_skills}
                onChange={(e) => setFormData({ ...formData, current_skills: e.target.value })}
                placeholder="e.g. Python, JavaScript, SQL, Machine Learning"
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Experience Level</label>
              <select
                value={formData.experience_level}
                onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !formData.company_name || !formData.job_role}
              className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
              {loading ? 'Generating Plan...' : 'Generate Plan'}
            </motion.button>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs">
                {error}
              </div>
            )}
          </motion.form>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {!plan && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-10 text-center">
              <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Ready to Prepare?</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                Fill in the form to generate a personalized placement preparation plan with company insights, technical topics, interview questions, and a week-by-week roadmap.
              </p>
            </motion.div>
          )}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-10 text-center">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">AI is creating your personalised preparation plan...</p>
            </motion.div>
          )}

          {plan && (
            <>
              {/* Summary */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{plan.companyName}</h3>
                    <p className="text-xs text-gray-400">{plan.jobRole} · {plan.experienceLevel}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{plan.summary}</p>
                  </div>
                </div>
              </motion.div>

              {/* Company Overview */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" /> Company Overview
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{plan.companyOverview}</p>
              </motion.div>

              {/* Technical Topics */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-400" /> Technical Topics to Focus On
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {plan.technicalTopics?.map((topic, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
                      <ChevronRight className="w-3 h-3 text-primary-500 shrink-0" />
                      <span className="text-xs text-gray-600 dark:text-gray-300">{topic}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Roadmap */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" /> Preparation Roadmap
                </h3>
                <div className="space-y-3">
                  {plan.preparationRoadmap?.map((week, i) => (
                    <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">{week.week}: {week.focus}</p>
                      <ul className="space-y-0.5">
                        {week.tasks?.map((task, j) => (
                          <li key={j} className="text-[11px] text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                            <span className="text-primary-500 mt-0.5">•</span> {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* HR Questions */}
              {plan.hrQuestions && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-gray-400" /> Common HR Questions
                  </h3>
                  <div className="space-y-1.5">
                    {plan.hrQuestions.map((q, i) => (
                      <div key={i} className="text-xs text-gray-500 dark:text-gray-400 p-2 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
                        {i + 1}. {q}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}