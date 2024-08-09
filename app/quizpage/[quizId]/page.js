"use client";
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Link from 'next/link';

export default function QuizPage() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [, quizId] = pathname.split('/quizpage/');

    const [quiz, setQuiz] = useState(null);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [timer, setTimer] = useState(0);
    const [durationTimer, setDurationTimer] = useState(0);
    const timerRef = useRef(null);
    const durationTimerRef = useRef(null);
    const [showFinishDialog, setShowFinishDialog] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (quizId) {
            fetch(`/api/get-quiz/${quizId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch quiz');
                    }
                    return response.json();
                })
                .then(data => {
                    setQuiz(data);
                    setAnswers(new Array(data.questions.length).fill({ choiceIndex: null, timeSpent: 0 }));
                    setDurationTimer(data.duration * 60);
                })
                .catch(error => {
                    setError(error.message);
                });
        }
    }, [quizId]);
    
    useEffect(() => {
        if (durationTimer > 0) {
            durationTimerRef.current = setInterval(() => {
                setDurationTimer(prevDuration => prevDuration - 1);
            }, 1000);
        } else if (durationTimer === 0 && durationTimerRef.current) {
            clearInterval(durationTimerRef.current);
        }
        return () => {
            if (durationTimerRef.current) {
                clearInterval(durationTimerRef.current);
            }
        };
    }, [durationTimer]);
    
    useEffect(() => {
        startTimer();
        return () => stopTimer();
    }, []);
    
    useEffect(() => {
        setTimer(0);
        startTimer();
        return () => stopTimer();
    }, [currentQuestionIndex]);
    
    const startTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        timerRef.current = setInterval(() => {
            setTimer(prevTimer => prevTimer + 1);
        }, 1000);
    };
    
    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };
    
    const handleAnswerSelect = (questionIndex, choiceIndex) => {
        const newAnswers = [...answers];
        const currentAnswer = newAnswers[questionIndex];
        const timeSpent = newAnswers[questionIndex].timeSpent + timer;
    
        if (currentAnswer.choiceIndex === choiceIndex) {
            newAnswers[questionIndex] = {
                choiceIndex: null,
                timeSpent: currentAnswer.timeSpent,
            };
        } else {
            const timeSpent = currentAnswer.timeSpent + timer;
            newAnswers[questionIndex] = {
                choiceIndex,
                timeSpent,
            };
        }
    
        setAnswers(newAnswers);
        stopTimer();
    };
    
    const handleSaveAnswer = () => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = {
            ...newAnswers[currentQuestionIndex],
            timeSpent: newAnswers[currentQuestionIndex].timeSpent + timer,
        };
        setAnswers(newAnswers);
        setTimer(0);
    };
    
    const handleNextQuestion = () => {
        handleSaveAnswer();
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    };
    
    const handlePreviousQuestion = () => {
        handleSaveAnswer();
        setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    };
    
    const handleQuestionNavigation = (index) => {
        handleSaveAnswer();
        setCurrentQuestionIndex(index);
    };
    
    const handleSubmitQuiz = async () => {
        try {
            const userId = parseInt(session.user.id, 10); // Ensure userId is an integer
            const quizIdInt = parseInt(quizId, 10); // Ensure quizId is an integer
    
            const submissionData = {
                userId,
                quizId: quizIdInt,
                answers: answers.map((answer, index) => ({
                    questionId: quiz.questions[index].id,
                    choiceId: answer.choiceIndex !== null ? quiz.questions[index].choices[answer.choiceIndex].id : null,
                    timeSpent: answer.timeSpent,
                })),
            };
    
            console.log('Submission Data:', submissionData); // Debugging line
    
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });
    
            const data = await response.json();
            if (response.ok) {
                console.log('Quiz submitted successfully', data);
                setScore(data.score); // Set score from backend response
                setShowResults(true);
            } else {
                console.error('Error submitting quiz:', data.message);
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
        }
    };
    
    const calculateScore = () => {
        let totalScore = 0;
        answers.forEach((answer, index) => {
            if (quiz.questions[index].choices[answer.choiceIndex]?.isCorrect) {
                totalScore += 1;
            }
        });
        setScore(totalScore);
    };
    
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (durationTimer <= 0) {
        return (
            
        <div className="relative flex justify-center items-center h-screen bg-black">
            <div className="absolute top-0 right-0 p-4">
                <Link href="/">
                    <h1 className="text-5xl text-white cursor-pointer">X</h1>
                </Link>

            </div>
            <div className="text-4xl font-bold text-red-600 animate-pulse">
                Times Up!
            </div>
        </div>

            
        );
    }
    
    const openFinishDialog = () => {
        setShowFinishDialog(true);
    };
    
    const closeFinishDialog = () => {
        setShowFinishDialog(false);
    };
    
    const confirmFinish = () => {
        setShowFinishDialog(false);
        handleSubmitQuiz();
    };


    if (!quiz) {
        return (
          <div style={{ backgroundImage: 'url(/images/download.gif)', backgroundSize: 'cover' }}>
          </div>
        );
      }
      

    if (error) {
        return <div className="text-center mt-10 text-lg text-red-600">Error: {error}</div>;
    }

    if (!quiz.questions || quiz.questions.length === 0) {
        return <div className="text-center mt-10 text-lg">No questions found for this quiz.</div>;
    }



    if (showResults) {
        const scorePercentage = (score / quiz.questions.length) * 100;
    
        return (
            <div className="flex flex-col items-center p-4">
                <h1 className="text-3xl font-bold mb-4">Quiz Results</h1>
                <div className="w-full max-w-xl mb-8">
                    <div className="text-lg font-semibold mb-2">
                        Score: {score}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6">
                        <div
                            className="bg-green-500 h-6 rounded-full transition-all duration-500 ease-in-out"
                            style={{ width: `${scorePercentage}%`, maxWidth: '100%' }}
                        ></div>
                    </div>
                </div>
                <div className="w-full max-w-2xl">
                    {quiz.questions.map((question, index) => {
                        const userAnswer = answers[index];
                        const correctChoice = question.choices.find(choice => choice.isCorrect);
                        const isCorrect = userAnswer?.choiceIndex !== undefined && question.choices[userAnswer.choiceIndex]?.isCorrect;
    
                        return (
                            <div key={index} className="mb-6 p-4 border rounded-lg shadow-lg">
                                <h2 className="text-xl font-semibold mb-2">{question.content}</h2>
                                <div className="flex items-center mb-2">
                                    {isCorrect ? (
                                        <FaCheckCircle className="text-green-500 mr-2" size={24} />
                                    ) : (
                                        <FaTimesCircle className="text-red-500 mr-2" size={24} />
                                    )}
                                    <p className="text-lg">
                                        <strong>Your Answer:</strong> {question.choices[userAnswer?.choiceIndex]?.content || "No answer"}
                                    </p>
                                </div>
                                <p className="text-lg">
                                    <strong>Correct Answer:</strong> {correctChoice?.content}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex bg-black h-screen">
            <div className="w-3/4 p-4">
                <h1 className="text-3xl font-bold mb-4 text-center text-white">{quiz.title}</h1>
                <p className="text-white mb-6 text-center">{quiz.description}</p>
                <div className='justify-center flex border-2 bg-gray-500 max-w-[10%] rounded-2xl text-center'>
                    <p className="text-white"> Quiz ID: {quiz.id} </p>
                </div>
                <div className="flex justify-between items-center mb-4 mt-5">
                    <div className="text-lg font-medium">
                        Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    </div>
                    {/* <div className="text-lg font-medium">
                        Time Spent: {timer}s
                    </div> */}
                </div>
                <div className="text-right mb-4 text-white">
                    <span className="font-bold text-xl">{formatTime(durationTimer)}</span>
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-lg shadow-inner mb-6"
                    >
                        <div className="text-xl mb-4 text-white">{quiz.questions[currentQuestionIndex].content}</div>


                        <div className='flex flex-row gap-2 justify-center items-center'>

                        {quiz.questions[currentQuestionIndex].choices.map((choice, index) => {
                            // Define the placeholder letters (A, B, C, ...)
                            const placeholder = String.fromCharCode(65 + index); // 'A' + index (0, 1, 2, ...)

                            return (
                                <motion.li 
                                    key={index} 
                                    className="mb-2 flex justify-center items-center"
                                    whileTap={{ scale: 0.5 }}
                                >
                                    <button
                                        className={`relative flex items-center justify-center w-52 h-52 rounded-full border m-2 ${
                                            answers[currentQuestionIndex]?.choiceIndex === index
                                                ? 'bg-red-500 text-white'
                                                : 'bg-white'
                                        }`}
                                        onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                                    >
                                        <span
                                            className={`absolute flex items-center justify-center w-16 h-16 rounded-full ${
                                                answers[currentQuestionIndex]?.choiceIndex === index
                                                    ? ' text-black opacity-0'
                                                    : 'bg-white text-black'
                                            }`}
                                        >
                                            {placeholder}
                                        </span>
                                        <span
                                            className={`transition-all duration-300 text-center ${
                                                answers[currentQuestionIndex]?.choiceIndex === index
                                                    ? 'opacity-100'
                                                    : 'opacity-0'
                                            }`}
                                        >
                                            {choice.content}
                                        </span>
                                    </button>
                                </motion.li>
                            );
                        })}


                        </div>

                        <div className='flex justify-end items-end p-0'>
                            <button
                                className="px-4 py-2 bg-gray-500 text-white rounded-2xl mt-4"
                                onClick={handleSaveAnswer}
                            >
                                Save Answer
                            </button>
                        </div>

                    </motion.div>
                </AnimatePresence>
                <div className="flex justify-between">
                    {currentQuestionIndex > 0 && (
                        <button
                            className="px-4 py-2 bg-red-500 text-white rounded-2xl"
                            onClick={handlePreviousQuestion}
                        >
                            Previous
                        </button>
                    )}

                    {currentQuestionIndex < quiz.questions.length - 1 ? (
                        <button
                            className="px-4 py-2 bg-white text-black rounded-2xl"
                            onClick={handleNextQuestion}
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            className="px-4 py-2 bg-red-500 text-white rounded-2xl"
                            onClick={openFinishDialog}
                        >
                            Finish
                        </button>
                    )}

                </div>
            </div>
            <div className="w-1/4 p-4"
            style={{ backgroundColor: 'rgba(255,0,0,0)', backdropFilter: 'blur(10px)' }}
            >
                <h2 className="text-lg font-semibold mb-4 text-white">Question Navigation</h2>
                <ul className="space-y-2">
                    {quiz.questions.map((_, index) => (
                        <li key={index}>
                            <button
                                className={`w-full text-left p-2 rounded-lg ${
                                    index === currentQuestionIndex
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-500'
                                }`}
                                onClick={() => handleQuestionNavigation(index)}
                            >
                                Question {index + 1}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            {showFinishDialog && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <p className="text-lg mb-4">Are you sure you want to finish the quiz?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded-md"
                                onClick={closeFinishDialog}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-md"
                                onClick={confirmFinish}
                            >
                                Finish Quiz
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
