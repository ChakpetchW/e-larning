import React, { useEffect, useState, useMemo } from 'react';
import { Target, Plus, Trash2, Calendar, BookOpen, ChevronRight, User, CheckCircle2, XCircle, FileText, Search, X } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminTable from '../../components/admin/AdminTable';

const GoalManagement = () => {
    const [goals, setGoals] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reportGoal, setReportGoal] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        type: 'ANY', // ANY, SPECIFIC
        targetCount: 1,
        expiryDate: '',
        scope: 'DEPARTMENT',
        departmentId: '',
        courseIds: []
    });
    const [courseSearch, setCourseSearch] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            setCurrentUser(user);

            const [goalsRes, coursesRes, deptsRes] = await Promise.all([
                adminAPI.getGoals(),
                adminAPI.getCourses(),
                adminAPI.getDepartments()
            ]);
            setGoals(goalsRes.data || []);
            setCourses(coursesRes.data || []);
            setDepartments(deptsRes.data || []);

            // Intelligent default: if user has a department, set it as the default scope
            if (user?.departmentId) {
                setFormData(prev => ({
                    ...prev,
                    scope: 'DEPARTMENT',
                    departmentId: user.departmentId
                }));
            }
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGoal = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.createGoal(formData);
            setIsModalOpen(false);
            setFormData({
                title: '',
                type: 'ANY',
                targetCount: 1,
                expiryDate: '',
                scope: currentUser?.departmentId ? 'DEPARTMENT' : 'GLOBAL',
                departmentId: currentUser?.departmentId || '',
                courseIds: []
            });
            fetchData();
        } catch (err) {
            console.error('Failed to create goal', err);
            alert('เกิดข้อผิดพลาดในการสร้างเป้าหมาย');
        }
    };

    const handleDeleteGoal = async (id) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเป้าหมายนี้?')) return;
        try {
            await adminAPI.deleteGoal(id);
            fetchData();
        } catch (err) {
            console.error('Failed to delete goal', err);
        }
    };

    const handleViewReport = async (goal) => {
        setReportGoal(goal);
        setReportLoading(true);
        try {
            const res = await adminAPI.getGoalReport(goal.id);
            setReportData(res.data);
        } catch (err) {
            console.error('Failed to fetch report', err);
        } finally {
            setReportLoading(false);
        }
    };

    const filteredCourses = useMemo(() => {
        return courses.filter(c => 
            c.title.toLowerCase().includes(courseSearch.toLowerCase()) && 
            !formData.courseIds.includes(c.id)
        );
    }, [courses, courseSearch, formData.courseIds]);

    const toggleCourse = (courseId) => {
        setFormData(prev => ({
            ...prev,
            courseIds: prev.courseIds.includes(courseId) 
                ? prev.courseIds.filter(id => id !== courseId)
                : [...prev.courseIds, courseId]
        }));
    };

    const columns = [
        { label: 'ชื่อเป้าหมาย' },
        { label: 'ประเภท' },
        { label: 'รายละเอียด' },
        { label: 'วันหมดอายุ' },
        { label: 'ขอบเขต' },
        { label: 'จัดการ', className: 'text-right' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <AdminPageHeader 
                title="จัดการเป้าหมายการเรียนรู"
                subtitle="กำหนดเป้าหมายการเรียนรายสัปดาห์หรือรายเดือนสำหรับพนักงานทุกคนหรือเฉพาะแผนก"
                actions={
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                        <Plus size={18} />
                        สร้างเป้าหมายใหม่
                    </button>
                }
            />

            <div className="card">
                <AdminTable 
                    columns={columns}
                    data={goals}
                    emptyMessage="ยังไม่มีการกำหนดเป้าหมายในขณะนี้"
                    renderRow={(goal) => (
                        <tr key={goal.id} className="border-b border-border hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                                <div className="font-bold text-slate-800">{goal.title}</div>
                                <div className="text-xs text-muted">สร้างเมื่อ {new Date(goal.createdAt).toLocaleDateString('th-TH')}</div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${goal.type === 'ANY' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                    {goal.type === 'ANY' ? 'คอร์สใดก็ได้' : 'เฉพาะคอร์ส'}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-slate-600">
                                {goal.type === 'ANY' ? (
                                    <span>เรียนจบ {goal.targetCount} คอร์ส</span>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium">{goal.courses.length} คอร์สที่กำหนด</span>
                                        <div className="flex flex-wrap gap-1">
                                            {goal.courses.slice(0, 2).map(gc => (
                                                <span key={gc.courseId} className="text-[10px] bg-slate-100 px-1 rounded">{gc.course.title}</span>
                                            ))}
                                            {goal.courses.length > 2 && <span className="text-[10px] text-muted">...และอีก {goal.courses.length - 2} คอร์ส</span>}
                                        </div>
                                    </div>
                                )}
                            </td>
                            <td className="p-4 text-sm font-medium">
                                {goal.expiryDate ? (
                                    <div className="flex items-center gap-1 text-slate-700">
                                        <Calendar size={14} className="text-muted" />
                                        {new Date(goal.expiryDate).toLocaleDateString('th-TH')}
                                    </div>
                                ) : <span className="text-muted">ไม่มีกำหนด</span>}
                            </td>
                            <td className="p-4">
                                <span className={`text-xs font-medium ${goal.scope === 'GLOBAL' ? 'text-blue-600' : 'text-amber-600'}`}>
                                    {goal.scope === 'GLOBAL' ? 'ทั้งองค์กร' : `แผนก ${goal.department?.name || 'ของคุณ'}`}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleViewReport(goal)} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors" title="ดูรายงาน">
                                        <FileText size={18} />
                                    </button>
                                    <button onClick={() => handleDeleteGoal(goal.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="ลบเป้าหมาย">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                />
            </div>

            {/* Create Goal Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                <Target className="text-primary" />
                                สร้างเป้าหมายการเรียนใหม่
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateGoal} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">ชื่อเป้าหมาย</label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="เช่น เป้าหมายประจำสัปดาห์แรกของเดือน"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            {currentUser?.role === 'admin' && (
                                <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">การขยายผล (Scope)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500">ขอบเขตเป้าหมาย</label>
                                            <select 
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium"
                                                value={formData.scope}
                                                onChange={e => setFormData({...formData, scope: e.target.value})}
                                            >
                                                <option value="GLOBAL">ทั้งองค์กร (Global)</option>
                                                <option value="DEPARTMENT">เฉพาะแผนก (Department)</option>
                                            </select>
                                        </div>
                                        {formData.scope === 'DEPARTMENT' && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-500">ระบุแผนก</label>
                                                <select 
                                                    required
                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium"
                                                    value={formData.departmentId}
                                                    onChange={e => setFormData({...formData, departmentId: e.target.value})}
                                                >
                                                    <option value="">-- เลือกแผนก --</option>
                                                    {departments.map(dept => (
                                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">ประเภทเป้าหมาย</label>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData({...formData, type: 'ANY'})}
                                            className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${formData.type === 'ANY' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-400'}`}
                                        >
                                            คอร์สใดก็ได้
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData({...formData, type: 'SPECIFIC'})}
                                            className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${formData.type === 'SPECIFIC' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-400'}`}
                                        >
                                            เลือกคอร์ส
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">วันหมดอายุ (ถ้ามี)</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all"
                                        value={formData.expiryDate}
                                        onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                                    />
                                </div>
                            </div>

                            {formData.type === 'ANY' ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">จำนวนคอร์สที่ต้องเรียนจบ</label>
                                    <input 
                                        required
                                        type="number" 
                                        min="1"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all"
                                        value={formData.targetCount}
                                        onChange={e => setFormData({...formData, targetCount: e.target.value})}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700">เลือกคอร์สที่กำหนด ({formData.courseIds.length})</label>
                                    
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.courseIds.map(id => (
                                            <div key={id} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold">
                                                {courses.find(c => c.id === id)?.title}
                                                <button type="button" onClick={() => toggleCourse(id)}><X size={14} /></button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="text" 
                                            placeholder="ค้นหาชื่อคอร์ส..."
                                            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200"
                                            value={courseSearch}
                                            onChange={e => setCourseSearch(e.target.value)}
                                        />
                                    </div>

                                    <div className="border border-slate-100 rounded-xl max-h-[200px] overflow-y-auto bg-slate-50">
                                        {filteredCourses.map(course => (
                                            <button 
                                                key={course.id} 
                                                type="button"
                                                onClick={() => toggleCourse(course.id)}
                                                className="w-full text-left p-3 text-sm hover:bg-white border-b border-slate-100 last:border-0 transition-colors"
                                            >
                                                {course.title}
                                            </button>
                                        ))}
                                        {filteredCourses.length === 0 && <div className="p-4 text-center text-xs text-muted">ไม่พบคอร์สที่ต้องการ</div>}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4">
                                <button type="submit" className="w-full btn btn-primary py-4 text-lg shadow-lg shadow-primary/20">
                                    สร้างเป้าหมายเดี๋ยวนี้
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {reportGoal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-slide-up h-[85vh] flex flex-col">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">รายงาน: {reportGoal.title}</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                                    เป้าหมาย: {reportGoal.type === 'ANY' ? `เรียนจบ ${reportGoal.targetCount} คอร์ส` : `เรียนจบ ${reportGoal.courses.length} คอร์สที่ระบุ`}
                                </p>
                            </div>
                            <button onClick={() => {setReportGoal(null); setReportData(null);}} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {reportLoading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                                    <p className="text-sm text-slate-400 font-bold uppercase animate-pulse">กำลังประมวลผลข้อมูลรายงาน...</p>
                                </div>
                            ) : reportData ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">พนักงานทั้งหมด</p>
                                            <p className="text-3xl font-black text-slate-800">{reportData.report.length}</p>
                                        </div>
                                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                                            <p className="text-[10px] font-bold text-emerald-500 uppercase mb-1">ทำสำเร็จแล้ว</p>
                                            <p className="text-3xl font-black text-emerald-600">{reportData.report.filter(r => r.isSuccess).length}</p>
                                        </div>
                                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
                                            <p className="text-[10px] font-bold text-amber-500 uppercase mb-1">อยู่ระหว่างดำเนินการ</p>
                                            <p className="text-3xl font-black text-amber-600">{reportData.report.filter(r => !r.isSuccess).length}</p>
                                        </div>
                                    </div>

                                    <div className="border border-border rounded-2xl overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 text-slate-500 border-b border-border">
                                                    <th className="p-4 text-left font-bold uppercase text-[10px]">พนักงาน</th>
                                                    <th className="p-4 text-left font-bold uppercase text-[10px]">แผนก</th>
                                                    <th className="p-4 text-center font-bold uppercase text-[10px]">ความคืบหน้า</th>
                                                    <th className="p-4 text-right font-bold uppercase text-[10px]">สถานะ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData.report.map(record => (
                                                    <tr key={record.userId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                        <td className="p-4">
                                                            <div className="font-bold text-slate-800">{record.name}</div>
                                                            <div className="text-[10px] text-slate-400">{record.email}</div>
                                                        </td>
                                                        <td className="p-4 text-slate-600 font-medium">{record.department}</td>
                                                        <td className="p-4">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="font-black text-slate-800">{record.completionCount} / {record.targetCount}</span>
                                                                <div className="w-24 bg-slate-100 rounded-full h-1 overflow-hidden">
                                                                    <div 
                                                                        className={`h-full ${record.isSuccess ? 'bg-emerald-500' : 'bg-primary'}`} 
                                                                        style={{width: `${Math.min(100, (record.completionCount/record.targetCount)*100)}%`}}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            {record.isSuccess ? (
                                                                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full text-xs">
                                                                    <CheckCircle2 size={14} /> สำเร็จ
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-slate-400 font-bold bg-slate-100 px-3 py-1 rounded-full text-xs">
                                                                    <XCircle size={14} /> ยังไม่ผ่าน
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-12 text-slate-400 font-bold">ไม่สามารถโหลดข้อมูลรายงาได้</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoalManagement;
