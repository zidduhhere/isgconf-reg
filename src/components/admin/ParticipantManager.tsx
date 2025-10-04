import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Participant } from '../../types';
import { Plus, Edit2, Trash2, Users, Search, X } from 'lucide-react';

export const ParticipantManager: React.FC = () => {
    const {
        participants,
        isLoading,
        addParticipant,
        updateParticipant,
        deleteParticipant,
        refreshData
    } = useAdmin();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        familySize: 1,
        isFam: false
    });

    const filteredParticipants = participants?.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phoneNumber.includes(searchTerm)
    ) || [];

    const resetForm = () => {
        setFormData({
            name: '',
            phoneNumber: '',
            familySize: 1,
            isFam: false
        });
        setShowCreateForm(false);
        setEditingParticipant(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const participantData = {
            ...formData,
            familySize: formData.isFam ? formData.familySize : 1
        };

        let success = false;
        if (editingParticipant && updateParticipant) {
            success = await updateParticipant(editingParticipant.id, participantData);
        } else if (addParticipant) {
            success = await addParticipant(participantData);
        }

        if (success) {
            resetForm();
            if (refreshData) {
                await refreshData();
            }
        }
    };

    const handleEdit = (participant: any) => {
        setEditingParticipant(participant);
        setFormData({
            name: participant.name,
            phoneNumber: participant.phoneNumber,
            familySize: participant.famSize || participant.familySize || 1,
            isFam: participant.isFam || false
        });
        setShowCreateForm(true);
    };

    const handleDelete = async (participant: Participant) => {
        if (deleteParticipant && window.confirm(`Are you sure you want to delete ${participant.name}? This action cannot be undone.`)) {
            const success = await deleteParticipant(participant.id);
            if (success && refreshData) {
                await refreshData();
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Participant Management</h2>
                    <p className="text-gray-600">Manage conference participants and their meal coupons</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Participant
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search participants by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Participants List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-500" />
                            <span className="font-medium text-gray-900">
                                Participants ({filteredParticipants.length})
                            </span>
                        </div>
                    </div>

                    {filteredParticipants.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            {searchTerm ? 'No participants found matching your search.' : 'No participants yet.'}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredParticipants.map((participant) => (
                                <div key={participant.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {participant.name}
                                                </h3>
                                                {participant.isFam && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        Family ({participant.famSize || participant.familySize || 1})
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Phone: {participant.phoneNumber}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Email: {participant.phoneNumber}@isgcon.com
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(participant)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit participant"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(participant)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete participant"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Form Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingParticipant ? 'Edit Participant' : 'Add New Participant'}
                            </h3>
                            <button
                                onClick={resetForm}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    id="phoneNumber"
                                    type="text"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Email will be: {formData.phoneNumber}@isgcon.com
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    id="isFam"
                                    type="checkbox"
                                    checked={formData.isFam}
                                    onChange={(e) => setFormData({ ...formData, isFam: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="isFam" className="text-sm font-medium text-gray-700">
                                    Family Registration
                                </label>
                            </div>

                            {formData.isFam && (
                                <div>
                                    <label htmlFor="familySize" className="block text-sm font-medium text-gray-700 mb-1">
                                        Family Size
                                    </label>
                                    <input
                                        id="familySize"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.familySize}
                                        onChange={(e) => setFormData({ ...formData, familySize: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Saving...' : (editingParticipant ? 'Update' : 'Add')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};