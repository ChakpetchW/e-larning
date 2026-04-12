import React from 'react';
import { Layers } from 'lucide-react';
import {
  DndContext,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableLessonItem from './SortableLessonItem';

const CourseContentEditor = ({
  lessons,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  sensors,
  handleDragEnd
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <p className="text-xs font-bold text-muted uppercase">บทเรียนทั้งหมด</p>
        <button 
          type="button" 
          onClick={onAddLesson} 
          className="btn btn-primary btn-sm rounded-lg text-xs"
        >
          + เพิ่มบทเรียน
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={lessons.map(l => l.id)}
            strategy={verticalListSortingStrategy}
          >
            {lessons.map((lesson, idx) => (
              <SortableLessonItem
                key={lesson.id}
                lesson={lesson}
                idx={idx}
                onEdit={onEditLesson}
                onDelete={onDeleteLesson}
              />
            ))}
          </SortableContext>
        </DndContext>
        
        {lessons.length === 0 && (
          <div className="py-12 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400">
            <Layers size={32} className="mb-2 opacity-20" />
            <p className="text-sm">ยังไม่มีเนื้อหาในคอร์สนี้</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContentEditor;
