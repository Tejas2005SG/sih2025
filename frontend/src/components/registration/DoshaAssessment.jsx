// src/components/registration/DoshaAssessment.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore.js';
import Button from '../common/Button';
import RegistrationLayout from './RegistrationLayout';

// Helper: compute scores from selected answers
const calculateDoshaScoresFromAnswers = (answersObj = {}) => {
  let vataScore = 0;
  let pittaScore = 0;
  let kaphaScore = 0;

  Object.values(answersObj).forEach((answer) => {
    switch (answer.dosha) {
      case 'vata':
        vataScore += answer.points || 0;
        break;
      case 'pitta':
        pittaScore += answer.points || 0;
        break;
      case 'kapha':
        kaphaScore += answer.points || 0;
        break;
      default:
        break;
    }
  });

  const total = vataScore + pittaScore + kaphaScore || 1;
  return {
    vataScore: Math.round((vataScore / total) * 100),
    pittaScore: Math.round((pittaScore / total) * 100),
    kaphaScore: Math.round((kaphaScore / total) * 100),
  };
};

// Helper: determine primary/secondary dosha
const getDominantDosha = (vataScore, pittaScore, kaphaScore) => {
  const scores = [
    { name: 'Vata', score: vataScore },
    { name: 'Pitta', score: pittaScore },
    { name: 'Kapha', score: kaphaScore },
  ];

  scores.sort((a, b) => b.score - a.score);

  // Balanced constitution
  if (
    Math.abs(scores[0].score - scores[1].score) < 10 &&
    Math.abs(scores[1].score - scores[2].score) < 10
  ) {
    return { primaryDosha: 'Tridosha', secondaryDosha: 'None' };
  }

  // Dual dosha
  if (Math.abs(scores[0].score - scores[1].score) < 15) {
    return {
      primaryDosha: `${scores[0].name}-${scores[1].name}`,
      secondaryDosha: scores[2].name,
    };
  }

  return {
    primaryDosha: scores[0].name,
    secondaryDosha: scores[1].score > 25 ? scores[1].name : 'None',
  };
};

const DoshaAssessment = () => {
  const navigate = useNavigate();
  const { registerDoshaAssessment, registrationData, isLoading } = useAuthStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  // Dosha assessment questions
  const questions = [
    {
      id: 1,
      category: 'Physical Characteristics',
      question: 'How would you describe your body frame?',
      options: [
        { text: 'Thin, light, find it hard to gain weight', dosha: 'vata', points: 3 },
        { text: 'Medium build, moderate weight', dosha: 'pitta', points: 3 },
        { text: 'Large frame, tend to gain weight easily', dosha: 'kapha', points: 3 },
      ],
    },
    {
      id: 2,
      category: 'Physical Characteristics',
      question: 'How is your skin generally?',
      options: [
        { text: 'Dry, rough, thin, cool to touch', dosha: 'vata', points: 3 },
        { text: 'Warm, oily, prone to rashes and irritation', dosha: 'pitta', points: 3 },
        { text: 'Thick, moist, cool, smooth', dosha: 'kapha', points: 3 },
      ],
    },
    {
      id: 3,
      category: 'Physical Characteristics',
      question: 'How would you describe your hair?',
      options: [
        { text: 'Dry, brittle, thin', dosha: 'vata', points: 3 },
        { text: 'Fine, oily, early graying or balding', dosha: 'pitta', points: 3 },
        { text: 'Thick, oily, wavy, lustrous', dosha: 'kapha', points: 3 },
      ],
    },
    {
      id: 4,
      category: 'Physical Characteristics',
      question: 'How are your eyes?',
      options: [
        { text: 'Small, dry, active', dosha: 'vata', points: 3 },
        { text: 'Sharp, bright, sensitive to light', dosha: 'pitta', points: 3 },
        { text: 'Large, moist, calm', dosha: 'kapha', points: 3 },
      ],
    },
    {
      id: 5,
      category: 'Physical Functions',
      question: 'How is your appetite generally?',
      options: [
        { text: 'Variable, sometimes strong, sometimes weak', dosha: 'vata', points: 3 },
        { text: 'Strong, sharp, get irritated when hungry', dosha: 'pitta', points: 3 },
        { text: 'Steady, can skip meals easily', dosha: 'kapha', points: 3 },
      ],
    },
    {
      id: 6,
      category: 'Physical Functions',
      question: 'How is your digestion?',
      options: [
        { text: 'Irregular, gas, bloating', dosha: 'vata', points: 3 },
        { text: 'Quick, efficient, occasional heartburn', dosha: 'pitta', points: 3 },
        { text: 'Slow but steady, feeling heavy after meals', dosha: 'kapha', points: 3 },
      ],
    },
    {
      id: 7,
      category: 'Physical Functions',
      question: 'How is your sleep pattern?',
      options: [
        { text: 'Light, interrupted, 5-7 hours', dosha: 'vata', points: 3 },
        { text: 'Moderate, 6-8 hours, good quality', dosha: 'pitta', points: 3 },
        { text: 'Deep, long, 8+ hours, hard to wake up', dosha: 'kapha', points: 3 },
      ],
    },
    {
      id: 8,
      category: 'Mental Characteristics',
      question: 'How do you handle stress?',
      options: [
        { text: 'Get anxious, worried, mind races', dosha: 'vata', points: 3 },
        { text: 'Get irritated, angry, frustrated', dosha: 'pitta', points: 3 },
        { text: 'Remain calm, become withdrawn or depressed', dosha: 'kapha', points: 3 },
      ],
    },
    {
      id: 9,
      category: 'Mental Characteristics',
      question: 'How is your memory?',
      options: [
        { text: 'Quick to learn, quick to forget', dosha: 'vata', points: 3 },
        { text: 'Sharp, clear, organized', dosha: 'pitta', points: 3 },
        { text: 'Slow to learn but good retention', dosha: 'kapha', points: 3 },
      ],
    },
    {
      id: 10,
      category: 'Mental Characteristics',
      question: 'How do you make decisions?',
      options: [
        { text: 'Quickly, often change my mind', dosha: 'vata', points: 3 },
        { text: 'Deliberately, stick to decisions', dosha: 'pitta', points: 3 },
        { text: 'Slowly, after much deliberation', dosha: 'kapha', points: 3 },
      ],
    },
    {
      id: 11,
      category: 'Behavioral Patterns',
      question: 'How do you typically speak?',
      options: [
        { text: 'Fast, a lot, jump topics', dosha: 'vata', points: 3 },
        { text: 'Sharp, precise, argumentative', dosha: 'pitta', points: 3 },
        { text: 'Slow, steady, thoughtful', dosha: 'kapha', points: 3 },
      ],
    },
    {
      id: 12,
      category: 'Behavioral Patterns',
      question: 'How do you prefer to exercise?',
      options: [
        { text: 'Variable activities, enjoy movement', dosha: 'vata', points: 3 },
        { text: 'Competitive sports, moderate to intense', dosha: 'pitta', points: 3 },
        { text: 'Steady, slow activities like walking', dosha: 'kapha', points: 3 },
      ],
    },
    {
      id: 13,
      category: 'Environmental Preferences',
      question: 'What weather do you prefer?',
      options: [
        { text: 'Warm, humid weather', dosha: 'vata', points: 3 },
        { text: 'Cool, well-ventilated spaces', dosha: 'pitta', points: 3 },
        { text: 'Warm, dry weather', dosha: 'kapha', points: 3 },
      ],
    },
    {
      id: 14,
      category: 'Environmental Preferences',
      question: 'How do you react to cold weather?',
      options: [
        { text: 'Dislike cold, hands and feet get cold', dosha: 'vata', points: 3 },
        { text: 'Tolerate cold well', dosha: 'pitta', points: 3 },
        { text: 'Comfortable in cold but dislike dampness', dosha: 'kapha', points: 3 },
      ],
    },
    {
      id: 15,
      category: 'Emotional Patterns',
      question: 'When you feel emotional, you tend to:',
      options: [
        { text: 'Feel anxious, fearful, or overwhelmed', dosha: 'vata', points: 3 },
        { text: 'Feel angry, irritated, or impatient', dosha: 'pitta', points: 3 },
        { text: 'Feel sad, attached, or possessive', dosha: 'kapha', points: 3 },
      ],
    },
  ];

  const handleAnswerSelect = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const onSubmit = async () => {
    const questionnaire = Object.entries(answers).map(([questionId, answer]) => {
      const question = questions.find((q) => q.id === parseInt(questionId, 10));
      return {
        question: question?.question || '',
        answer: answer.text,
        doshaType: answer.dosha,
        points: answer.points,
      };
    });

    const personalInfo = registrationData?.personalInfo;
    const assessmentData = {
      email: personalInfo?.email,
      questionnaire,
    };

    const result = await registerDoshaAssessment(assessmentData);
    if (result?.success) {
      navigate('/register/review-submit');
    }
  };

  const progress = (Object.keys(answers).length / questions.length) * 100;
  const isComplete = Object.keys(answers).length === questions.length;

  if (isComplete && currentQuestion >= questions.length) {
    const { vataScore, pittaScore, kaphaScore } = calculateDoshaScoresFromAnswers(answers);
    const { primaryDosha, secondaryDosha } = getDominantDosha(vataScore, pittaScore, kaphaScore);

    return (
      <RegistrationLayout currentStep="dosha-assessment">
        <div className="text-center space-y-6">
          <div>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
            <p className="text-gray-600">Here are your Dosha results</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-green-900 mb-4">Your Dosha Profile</h3>

            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-lg font-medium text-gray-900">Primary Dosha</h4>
                <p className="text-2xl font-bold text-green-600">{primaryDosha}</p>
                {secondaryDosha !== 'None' && (
                  <>
                    <h5 className="text-md font-medium text-gray-700 mt-2">Secondary Dosha</h5>
                    <p className="text-lg font-semibold text-green-500">{secondaryDosha}</p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{vataScore}%</div>
                  <div className="text-sm text-gray-600">Vata</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${vataScore}%` }} />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{pittaScore}%</div>
                  <div className="text-sm text-gray-600">Pitta</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-red-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pittaScore}%` }} />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{kaphaScore}%</div>
                  <div className="text-sm text-gray-600">Kapha</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-yellow-500 h-2 rounded-full transition-all duration-500" style={{ width: `${kaphaScore}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">What does this mean?</h4>
            <p className="text-sm text-blue-800">
              Your dosha profile helps us understand your unique constitution and provide
              personalized recommendations for diet, lifestyle, and treatments that will
              best support your health and well-being.
            </p>
          </div>

          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={() => setCurrentQuestion(questions.length - 1)}>
              Review Answers
            </Button>

            <Button onClick={onSubmit} variant="primary" isLoading={isLoading}>
              Continue to Review
            </Button>
          </div>
        </div>
      </RegistrationLayout>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <RegistrationLayout currentStep="dosha-assessment">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dosha Assessment</h2>
          <p className="text-gray-600">Answer these questions to discover your Ayurvedic constitution</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">
              {Object.keys(answers).length} of {questions.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
          <div className="mb-4">
            <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
              {currentQ.category}
            </span>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-6">{currentQ.question}</h3>

          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleAnswerSelect(currentQ.id, option)}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                  ${
                    answers[currentQ.id]?.text === option.text
                      ? 'border-green-500 bg-green-50 text-green-900'
                      : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-25'
                  }
                `}
              >
                <div className="flex items-center">
                  {answers[currentQ.id]?.text === option.text ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                  )}
                  <span className="text-sm">{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (currentQuestion > 0) {
                setCurrentQuestion(currentQuestion - 1);
              } else {
                navigate('/register/medical-history');
              }
            }}
            icon={ArrowLeft}
          >
            {currentQuestion === 0 ? 'Back to Medical History' : 'Previous Question'}
          </Button>

          <div className="flex space-x-3">
            {currentQuestion < questions.length - 1 ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                icon={ArrowRight}
                iconPosition="right"
                disabled={!answers[currentQ.id]}
              >
                Next Question
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={() => setCurrentQuestion(questions.length)}
                disabled={!isComplete}
              >
                View Results
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigation Dots */}
        <div className="flex justify-center space-x-2 pt-4">
          {questions.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentQuestion(index)}
              className={`
                w-3 h-3 rounded-full transition-all duration-200
                ${
                  answers[questions[index].id]
                    ? 'bg-green-500'
                    : index === currentQuestion
                    ? 'bg-green-300'
                    : 'bg-gray-200'
                }
              `}
            />
          ))}
        </div>
      </div>
    </RegistrationLayout>
  );
};

export default DoshaAssessment;