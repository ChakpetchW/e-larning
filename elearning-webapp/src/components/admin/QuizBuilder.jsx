import React from 'react';
import { Trash2, Plus, X } from 'lucide-react';

const QuizBuilder = ({ questions = [], onChange }) => {
  const addQuestion = () => {
    const newQ = { 
      id: Date.now().toString(), 
      text: '', 
      points: 1, 
      choices: [
        { id: Date.now() + '_c1', text: '', isCorrect: true }, 
        { id: Date.now() + '_c2', text: '', isCorrect: false }
      ] 
    };
    onChange([...questions, newQ]);
  };

  const removeQuestion = (qIndex) => {
    const newQs = [...questions];
    newQs.splice(qIndex, 1);
    onChange(newQs);
  };

  const updateQuestion = (qIndex, field, value) => {
    const newQs = [...questions];
    newQs[qIndex] = { ...newQs[qIndex], [field]: value };
    onChange(newQs);
  };

  const addChoice = (qIndex) => {
    const newQs = [...questions];
    newQs[qIndex].choices.push({ 
      id: Date.now() + '_c', 
      text: '', 
      isCorrect: newQs[qIndex].choices.length === 0 
    });
    onChange(newQs);
  };

  const removeChoice = (qIndex, cIndex) => {
    const newQs = [...questions];
    newQs[qIndex].choices.splice(cIndex, 1);
    onChange(newQs);
  };

  const setCorrectChoice = (qIndex, cIndex) => {
    const newQs = [...questions];
    newQs[qIndex].choices.forEach((ch, idx) => {
      ch.isCorrect = idx === cIndex;
    });
    onChange(newQs);
  };

  const updateChoice = (qIndex, cIndex, value) => {
    const newQs = [...questions];
    newQs[qIndex].choices[cIndex].text = value;
    onChange(newQs);
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-bold text-gray-700">ข้อสอบทั้งหมด ({questions.length} ข้อ)</label>
        <button 
          type="button" 
          onClick={addQuestion} 
          className="btn btn-primary btn-sm rounded-lg"
        > 
          + เพิ่มข้อ
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {questions.map((q, qIndex) => (
          <div key={q.id || qIndex} className="p-4 border border-gray-100 rounded-lg bg-gray-50 flex flex-col gap-3 relative">
            <button 
              type="button" 
              onClick={() => removeQuestion(qIndex)} 
              className="absolute top-2 right-2 text-red-500 p-1.5 hover:bg-red-50 rounded"
            >
              <Trash2 size={16}/>
            </button>
            
            <div className="flex gap-2 items-start pr-8">
              <span className="font-bold text-gray-400 shrink-0 mt-2">{qIndex + 1}.</span>
              <input 
                type="text" 
                className="form-input flex-1" 
                placeholder="คำถาม..." 
                value={q.text} 
                onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)} 
              />
              <input 
                type="number" 
                className="form-input w-24 shrink-0" 
                placeholder="คะแนน" 
                value={q.points} 
                onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 0)} 
                title="คะแนนของข้อนี้" 
              />
            </div>
            
            <div className="pl-6 flex flex-col gap-2 relative mt-2">
              <div className="absolute left-[3px] top-0 bottom-0 w-px bg-gray-200"></div>
              {q.choices.map((c, cIndex) => (
                <div key={c.id || cIndex} className="flex gap-2 items-center relative z-10 pl-4 border-l-2 border-transparent focus-within:border-primary transition-colors">
                  <div className="absolute left-[-23px] w-4 h-px bg-gray-200"></div>
                  <button 
                    type="button"
                    title="เลือกเป็นคำตอบที่ถูกต้อง"
                    aria-label={`เลือกตัวเลือกที่ ${cIndex + 1} เป็นคำตอบที่ถูกต้อง`}
                    className={`w-5 h-5 shrink-0 flex items-center justify-center rounded-full border transition-all ${
                      c.isCorrect 
                        ? 'bg-green-500 border-green-500 shadow-sm' 
                        : 'bg-white border-gray-300 hover:border-primary focus:ring-2 focus:ring-primary/20'
                    }`} 
                    onClick={() => setCorrectChoice(qIndex, cIndex)}
                  >
                    {c.isCorrect && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </button>
                  <input 
                    type="text" 
                    className={`form-input flex-1 text-sm py-1.5 ${c.isCorrect ? 'border-green-300 bg-green-50/10 font-medium' : ''}`} 
                    placeholder={`ตัวเลือกที่ ${cIndex + 1}`} 
                    value={c.text} 
                    onChange={(e) => updateChoice(qIndex, cIndex, e.target.value)} 
                  />
                  <button 
                    type="button" 
                    onClick={() => removeChoice(qIndex, cIndex)} 
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <X size={14}/>
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => addChoice(qIndex)} 
                className="text-xs text-primary font-bold self-start mt-2 ml-4 hover:bg-primary/5 px-2 py-1 rounded transition-colors flex items-center gap-1"
              >
                <Plus size={12}/> เพิ่มตัวเลือก
              </button>
            </div>
          </div>
        ))}
        {questions.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
            ยังไม่มีคำถาม คลิก "+ เพิ่มข้อ" เพื่อเริ่มสร้างแบบทดสอบ
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizBuilder;
