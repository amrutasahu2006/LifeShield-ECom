import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const triviaQuestions = [
  {
    question: 'Which fire extinguisher is specifically designed for kitchen grease and cooking oil fires?',
    options: ['Class A', 'Class B', 'Class K', 'Class D'],
    correctAnswer: 'Class K',
    explanation: 'Class K extinguishers are formulated for high-temperature cooking oils and fats.'
  },
  {
    question: 'For a minor burn, what is the safest immediate first-aid action?',
    options: [
      'Apply butter or ointment immediately',
      'Run cool (not ice-cold) water over the burn for about 20 minutes',
      'Cover with a tight bandage right away',
      'Pop any blisters to release pressure'
    ],
    correctAnswer: 'Run cool (not ice-cold) water over the burn for about 20 minutes',
    explanation: 'Cool running water reduces skin temperature and limits deeper tissue injury. Avoid ice and avoid breaking blisters.'
  },
  {
    question: 'During strong earthquake shaking indoors, what should you do first?',
    options: ['Run outside immediately', 'Stand in a doorway only', 'Use an elevator to exit faster', 'Drop, Cover, and Hold On'],
    correctAnswer: 'Drop, Cover, and Hold On',
    explanation: 'Drop, Cover, and Hold On helps protect your head and torso from falling objects and debris.'
  }
]

const getRandomQuestion = () => triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)]

export default function SafetyTriviaCard() {
  const { user } = useAuth()
  const [question, setQuestion] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    setQuestion(getRandomQuestion())
  }, [])

  const handleAnswerClick = async (option) => {
    if (!question || selectedAnswer || hasPlayed || isLoading) return

    const correct = option === question.correctAnswer
    setSelectedAnswer(option)
    setIsCorrect(correct)

    if (!correct) {
      setStatusMessage('Incorrect answer. Review the safety tip below and try again tomorrow.')
      return
    }

    if (!user?._id) {
      setStatusMessage('Correct answer detected, but we could not verify your account. Please sign in again.')
      return
    }

    setIsLoading(true)
    try {
      await axios.post('/api/trivia/reward', { userId: user._id })
      setStatusMessage('Correct! +50 ShieldPoints added.')
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to reward points right now.'
      if (error?.response?.status === 400 && message === 'You have already played today. Come back tomorrow!') {
        setHasPlayed(true)
        setStatusMessage('You have already played today. Come back tomorrow!')
      } else {
        setStatusMessage(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getOptionClassName = (option) => {
    const base = 'w-full rounded-xl border border-slate-700 bg-slate-800 px-5 py-4 text-left text-base font-semibold text-slate-100 transition-all'
    const disabledState = selectedAnswer || hasPlayed || isLoading

    if (!disabledState) {
      return `${base} hover:border-slate-500 hover:bg-slate-700`
    }

    if (option === question.correctAnswer) {
      return `${base} border-green-500 bg-green-500/20 text-green-400`
    }

    if (option === selectedAnswer && isCorrect === false) {
      return `${base} border-red-500 bg-red-500/20 text-red-400`
    }

    return `${base} border-slate-700 bg-slate-800/40 text-slate-400`
  }

  if (hasPlayed) {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-black/30">
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-700 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🧠</span>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Daily Safety Trivia</p>
          </div>
          <span className="rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
            Earn +50 ShieldPoints
          </span>
        </div>

        <h3 className="text-white text-xl font-semibold">Come back tomorrow</h3>
        <p className="mt-3 text-slate-300">You have already played today. Come back tomorrow!</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-black/30">
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">🧠</span>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Daily Safety Trivia</p>
        </div>
        <span className="rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
          Earn +50 ShieldPoints
        </span>
      </div>

      {question && (
        <div className="space-y-4">
          <p className="text-white text-xl font-semibold leading-relaxed">{question.question}</p>

          <div className="grid gap-3">
            {question.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleAnswerClick(option)}
                disabled={Boolean(selectedAnswer) || hasPlayed || isLoading}
                className={getOptionClassName(option)}
              >
                {option}
              </button>
            ))}
          </div>

          {selectedAnswer && (
            <div className={`rounded-xl border px-4 py-3 text-sm ${isCorrect ? 'border-green-500/40 bg-green-500/10 text-green-300' : 'border-red-500/40 bg-red-500/10 text-red-300'}`}>
              <p className="font-semibold">{isCorrect ? 'Correct! +50 ShieldPoints added.' : 'Not quite right.'}</p>
              <p className="mt-2 text-slate-200">
                <span className="font-semibold text-slate-100">Explanation:</span> {question.explanation}
              </p>
            </div>
          )}

          {!selectedAnswer && statusMessage && (
            <div className="rounded-xl border border-sky-400/40 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
              {statusMessage}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
