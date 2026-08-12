import { useState } from 'react';
import { List, FilePlus } from 'lucide-react';
import CriteriaForm from '../../component/eventCoordinator/criteria/CriteriaForm';
import CriteriaList from '../../component/eventCoordinator/criteria/CriteriaList';

export default function CriteriaPage() {
    const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
    const [editingCriteria, setEditingCriteria] = useState<any>(null);

    const handleEdit = (criteria: any) => {
        setEditingCriteria(criteria);
        setActiveTab('create');
    };

    const handleDelete = () => {
        setEditingCriteria(null);
        setActiveTab('list');
    }

    const handleSuccess = () => {
        setEditingCriteria(null);
        setActiveTab('list');
    };

    const handleCreateNewClick = () => {
        setActiveTab('create');
        setEditingCriteria(null);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto w-full">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {activeTab === 'create' ? (editingCriteria ? 'Chỉnh sửa Bộ tiêu chí' : 'Tạo Bộ tiêu chí') : 'Quản lý Tiêu chí'}
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">Quản lý tiêu chí chấm điểm và đánh giá bài thi.</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={handleCreateNewClick}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === 'create' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                    >
                        <FilePlus size={16} /> {editingCriteria ? 'Sửa' : 'Tạo mới'}
                    </button>
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === 'list' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                    >
                        <List size={16} /> Danh sách Tiêu chí
                    </button>
                </div>
            </div>

            {activeTab === 'create' ? (
                <CriteriaForm
                    initialData={editingCriteria}
                    onSuccess={handleSuccess}
                />
            ) : (
                <CriteriaList
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCreateNew={handleCreateNewClick}
                />
            )}
        </div>
    );
}

