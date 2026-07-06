'use client';

import React, { useEffect, useCallback } from 'react';
import { Upload, Filter, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { quizAdminService } from '@/services/quizAdminService';
import { useQuizQuestionsStore } from '@/store/quizQuestionsStore';
import { useQuizCategories } from '@/hooks/useQuizCategories';

import dynamic from 'next/dynamic';

const UploadQuestionsModal = dynamic(() => import('@/components/admin/quiz/UploadQuestionsModal'), { ssr: false });
const CategoryFormModal = dynamic(() => import('@/components/admin/quiz/CategoryFormModal'), { ssr: false });
const QuestionFormModal = dynamic(() => import('@/components/admin/quiz/QuestionFormModal'), { ssr: false });

export default function QuizQuestionsTab() {
  const {
    questions,
    loading,
    selectedCategory,
    selectedDifficulty,
    isUploadModalOpen,
    isCategoryModalOpen,
    isQuestionModalOpen,
    editingQuestion,
    setQuestions,
    setLoading,
    setSelectedCategory,
    setSelectedDifficulty,
    setUploadModalOpen,
    setCategoryModalOpen,
    setQuestionModalOpen,
    setEditingQuestion,
    removeQuestion,
  } = useQuizQuestionsStore();

  const { categories, loading: categoriesLoading } = useQuizCategories();

  const fetchQuestions = useCallback(async () => {
    if (!selectedCategory) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await quizAdminService.getQuestions({
        categoryId: selectedCategory,
        difficulty: selectedDifficulty || undefined,
        limit: 50,
      });
      if (res.success) {
        setQuestions(res.questions);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedDifficulty, setLoading, setQuestions]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await quizAdminService.deleteQuestion(id);
      if (res.success) {
        removeQuestion(id);
      }
    } catch {
      alert('Failed to delete question');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-black/50 border border-zinc-700 text-sm text-zinc-200 rounded-lg pl-9 pr-4 py-2 focus:border-blue-500 focus:outline-none appearance-none"
              disabled={categoriesLoading}
            >
              <option value="">{categoriesLoading ? 'Loading...' : 'Select category...'}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.questionCount} questions)
                </option>
              ))}
            </select>
          </div>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-black/50 border border-zinc-700 text-sm text-zinc-200 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
          >
            + Category
          </button>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-900/50 hover:border-indigo-800 text-sm font-medium rounded-lg transition-colors"
          >
            <Upload size={16} /> Upload CSV/Excel
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-800/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Question</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Usage</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    Enter a Category UUID to load questions, or upload a new batch.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-300 max-w-md truncate">
                      {q.questionText}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        q.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                        q.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {q.isActive ? (
                        <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={14} /> Active</span>
                      ) : (
                        <span className="flex items-center gap-1 text-zinc-500"><XCircle size={14} /> Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-mono">
                      {q.usageCount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setEditingQuestion(q); setQuestionModalOpen(true); }}
                          className="p-1.5 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UploadQuestionsModal
        isOpen={isUploadModalOpen}
        onClose={() => { setUploadModalOpen(false); fetchQuestions(); }}
        categoryId={selectedCategory}
      />
      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
      />
      <QuestionFormModal
        isOpen={isQuestionModalOpen}
        onClose={() => { setQuestionModalOpen(false); setEditingQuestion(null); fetchQuestions(); }}
        question={editingQuestion}
      />
    </div>
  );
}
