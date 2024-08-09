"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import NavBar from '../components/navbar';

const saveQuiz = async ({ quizId, title, description, duration, questions }) => {
  const method = quizId ? 'PUT' : 'POST';
  const url = quizId ? `/api/quizzes/${quizId}` : '/api/quizzes';

  try {
    const response = await axios({
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: { title, description, duration, questions },
    });

    return response;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to save quiz');
  }
};

const CreateQuiz = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = searchParams.get('quizId');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [questions, setQuestions] = useState([
    { content: '', score: 0, choices: [{ content: '', isCorrect: false }] }
  ]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (quizId) {
      axios.get(`/api/quizzes/${quizId}`)
      .then(response => {
        const { title, description, duration, questions } = response.data;
        setTitle(title);
        setDescription(description);
        setDuration(duration);
        setQuestions(questions);
      })
      .catch(error => {
        console.error('Error fetching quiz:', error);
        setError(error.response?.data?.error || 'Failed to fetch quiz');
      });
    }
  }, [quizId]);

  const addQuestion = () => {
    setQuestions([...questions, { content: '', score: 0, choices: [{ content: '', isCorrect: false }] }]);
  };

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addChoice = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices.push({ content: '', isCorrect: false });
    setQuestions(updatedQuestions);
  };

  const deleteChoice = (questionIndex, choiceIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices = updatedQuestions[questionIndex].choices.filter((_, i) => i !== choiceIndex);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await saveQuiz({
        quizId,
        title,
        description,
        duration,
        questions,
      });

      if (response.status === 200 || response.status === 201) {
        router.push('/history');
      }
    } catch (error) {
      console.error('Failed to save quiz:', error);
      setError(error.message);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>You must be logged in to create a quiz</div>;
  }

  return (
    <div className="p-12 bg-[#D9D9D9] min-h-screen" 
    style={{
      backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url("/images/robio8.png")',
      backgroundSize: 'cover',
      overflows: 'hidden',
    }}>
      <NavBar />
      <div className="max-w-6xl mx-auto p-8 rounded-3xl-lg"
      style={{ backgroundColor: 'rgba(255,0,0,0)', backdropFilter: 'blur(10px)' }}
      >
        <h1 className="text-6xl font-bold mb-6 text-center text-white mt-4">{quizId ? 'Edit Exam' : 'Create Exam'}</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-12">
          <div>
            <div className="mb-6">
              <label className="block text-lg font-bold mb-2 text-white">Title</label>
              <input
                type="text"
                className="w-full p-3 border bg-black text-white rounded-2xl"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Input exam title'
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-lg font-bold mb-2 text-white">Description</label>
              <textarea
                className="w-full p-3 border bg-black text-white rounded-2xl"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Input exam description'
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-lg font-bold mb-2 text-white">Duration (in minutes)</label>
              <input
                type="number"
                className="w-full p-3 border bg-black text-white rounded-2xl"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder='Input exam duration'
                required
              />
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto"
    

          >
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="mb-6 p-4 hadow-sm">
                <div className="mb-4">
                  <label className="block text-md font-bold mb-2 text-white">Question {qIndex + 1}</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={question.content}
                    onChange={(e) => {
                      const updatedQuestions = [...questions];
                      updatedQuestions[qIndex].content = e.target.value;
                      setQuestions(updatedQuestions);
                    }}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-md font-bold mb-2 text-white">Score</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={question.score}
                    onChange={(e) => {
                      const updatedQuestions = [...questions];
                      updatedQuestions[qIndex].score = parseInt(e.target.value, 10) || 0; // Ensure score is a number
                      setQuestions(updatedQuestions);
                    }}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-md font-bold mb-2 text-white">Difficulty</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={question.difficulty || 'easy'} // Default to 'easy' if undefined
                    onChange={(e) => {
                      const updatedQuestions = [...questions];
                      updatedQuestions[qIndex].difficulty = e.target.value;
                      setQuestions(updatedQuestions);
                    }}
                    required
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="mb-4 max-h-40 overflow-y-auto">
                  {question.choices.map((choice, cIndex) => (
                    <div key={cIndex} className="mb-2 flex items-center space-x-2">
                      <input
                        type="text"
                        className="flex-1 p-2 border border-gray-300 rounded-lg"
                        value={choice.content}
                        onChange={(e) => {
                          const updatedQuestions = [...questions];
                          updatedQuestions[qIndex].choices[cIndex].content = e.target.value;
                          setQuestions(updatedQuestions);
                        }}
                        required
                      />
                      <input
                        type="checkbox"
                        className="ml-2"
                        checked={choice.isCorrect}
                        onChange={(e) => {
                          const updatedQuestions = [...questions];
                          updatedQuestions[qIndex].choices[cIndex].isCorrect = e.target.checked;
                          setQuestions(updatedQuestions);
                        }}
                      />
                      <button
                        type="button"
                        className="ml-2 bg-red-500 text-white p-2 rounded-3xl"
                        onClick={() => deleteChoice(qIndex, cIndex)}
                      >
                        Delete Choice
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="bg-gray-500 text-white p-2 rounded-3xl mt-2"
                  onClick={() => addChoice(qIndex)}
                >
                  Add Choice
                </button>
                <button
                  type="button"
                  className="ml-2 bg-red-500 text-white p-2 rounded-3xl mt-2"
                  onClick={() => deleteQuestion(qIndex)}
                >
                  Delete Question
                </button>
              </div>
            ))}
            <button
              type="button"
              className="bg-gray-500 text-white p-3 rounded-3xl"
              onClick={addQuestion}
            >
              Add Question
            </button>
          </div>
        </form>
        {error && <p className="mt-4 text-red-500">{error}</p>}
        <div className="flex justify-center mt-8">
          <button type="submit" className="bg-red-500 text-white py-3 px-6 rounded-sm">
            {quizId ? 'Update Quiz' : 'Create Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
