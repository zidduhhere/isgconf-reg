// import React, { useState } from 'react';
// import { useAdmin } from '../../contexts/AdminContext';
// import { Participant } from '../../types';
// import { Plus, Edit2, Trash2, Users, UserCheck, UserX, Search, X } from 'lucide-react';

export const ParticipantManager: React.FC = () => {
    const {
        participants,
        isLoading,
        createParticipant,
        editParticipant,
        removeParticipant,
        activateAllCoupons,
        deactivateAllCoupons
    } = useAdmin();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
//         name: '',
//         phoneNumber: '',
//         familySize: 1,
//         isFam: false
//     });

//     const filteredParticipants = participants?.filter(p =>
//         p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         p.phoneNumber.includes(searchTerm)
//     ) || [];

//     const resetForm = () => {
//         setFormData({
//             name: '',
//             phoneNumber: '',
//             familySize: 1,
//             isFam: false
//         });
//         setShowCreateForm(false);
//         setEditingParticipant(null);
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         const participantData = {
//             ...formData,
//             familySize: formData.isFam ? formData.familySize : 1
//         };

//         let success = false;
//         if (editingParticipant && editParticipant) {
//             success = await editParticipant(editingParticipant.id, participantData);
//         } else if (createParticipant) {
//             success = await createParticipant(participantData);
//         }

//         if (success) {
//             resetForm();
//         }
//     };

//     const handleEdit = (participant: any) => {
//         setEditingParticipant(participant);
//         setFormData({
//             name: participant.name,
//             phoneNumber: participant.phoneNumber,
//             familySize: participant.familySize,
//             isFam: participant.isFam
//         }); const handleDelete = async (participant: Participant) => {
//             if (removeParticipant && window.confirm(`Are you sure you want to delete ${participant.name}? This will also remove all their coupons.`)) {
//                 await removeParticipant(participant.id);
//             }
//         };

//         const handleActivateAllCoupons = async (participantId: string) => {
//             if (activateAllCoupons && window.confirm('Activate all coupons for this participant?')) {
//                 await activateAllCoupons(participantId);
//             }
//         };

//         const handleDeactivateAllCoupons = async (participantId: string) => {
//             if (deactivateAllCoupons && window.confirm('Deactivate all active coupons for this participant?')) {
//                 await deactivateAllCoupons(participantId);
//             }
//         };

//         return (
//             <div className="space-y-6">
//                 {/* Header */}
//                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                     <div>
//                         <h2 className="text-2xl font-bold text-gray-900">Participant Management</h2>
//                         <p className="text-gray-600">Manage conference participants and their meal coupons</p>
//                     </div>
//                     <button
//                         onClick={() => setShowCreateForm(true)}
//                         className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
//                     >
//                         <Plus className="w-4 h-4" />
//                         Add Participant
//                     </button>
//                 </div>

//                 {/* Search */}
//                 <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                         type="text"
//                         placeholder="Search by name or phone number..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                 </div>

//                 {/* Create/Edit Form Modal */}
//                 {showCreateForm && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                         <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
//                             <div className="flex justify-between items-center mb-4">
//                                 <h3 className="text-lg font-semibold">
//                                     {editingParticipant ? 'Edit Participant' : 'Add New Participant'}
//                                 </h3>
//                                 <button
//                                     onClick={resetForm}
//                                     className="text-gray-500 hover:text-gray-700"
//                                 >
//                                     <X className="w-5 h-5" />
//                                 </button>
//                             </div>

//                             <form onSubmit={handleSubmit} className="space-y-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Full Name
//                                     </label>
//                                     <input
//                                         type="text"
//                                         value={formData.name}
//                                         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                         required
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Phone Number
//                                     </label>
//                                     <input
//                                         type="tel"
//                                         value={formData.phoneNumber}
//                                         onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                         required
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="flex items-center space-x-2">
//                                         <input
//                                             type="checkbox"
//                                             checked={formData.isFam}
//                                             onChange={(e) => setFormData({
//                                                 ...formData,
//                                                 isFam: e.target.checked,
//                                                 familySize: e.target.checked ? formData.familySize : 1
//                                             })}
//                                             className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                                         />
//                                         <span className="text-sm font-medium text-gray-700">Has Family Members</span>
//                                     </label>
//                                 </div>

//                                 {formData.isFam && (
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             Total Family Size (including participant)
//                                         </label>
//                                         <select
//                                             value={formData.familySize}
//                                             onChange={(e) => setFormData({ ...formData, familySize: parseInt(e.target.value) })}
//                                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                         >
//                                             <option value={1}>1 person</option>
//                                             <option value={2}>2 people</option>
//                                             <option value={3}>3 people</option>
//                                             <option value={4}>4 people</option>
//                                         </select>
//                                     </div>
//                                 )}

//                                 <div className="flex space-x-3 pt-4">
//                                     <button
//                                         type="button"
//                                         onClick={resetForm}
//                                         className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                                     >
//                                         Cancel
//                                     </button>
//                                     <button
//                                         type="submit"
//                                         disabled={isLoading}
//                                         className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
//                                     >
//                                         {isLoading ? 'Saving...' : (editingParticipant ? 'Update' : 'Create')}
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 )}

//                 {/* Participants List */}
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                     <div className="overflow-x-auto">
//                         <table className="w-full">
//                             <thead className="bg-gray-50">
//                                 <tr>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                         Participant
//                                     </th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                         Phone
//                                     </th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                         Family Size
//                                     </th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                         Quick Actions
//                                     </th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                         Actions
//                                     </th>
//                                 </tr>
//                             </thead>
//                             <tbody className="bg-white divide-y divide-gray-200">
//                                 {filteredParticipants.map((participant) => (
//                                     <tr key={participant.id} className="hover:bg-gray-50">
//                                         <td className="px-6 py-4 whitespace-nowrap">
//                                             <div className="flex items-center">
//                                                 <div className="flex-shrink-0 h-10 w-10">
//                                                     <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
//                                                         {participant.isFam ? (
//                                                             <Users className="h-5 w-5 text-blue-600" />
//                                                         ) : (
//                                                             <span className="text-blue-600 font-semibold">
//                                                                 {participant.name.charAt(0)}
//                                                             </span>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                                 <div className="ml-4">
//                                                     <div className="text-sm font-medium text-gray-900">
//                                                         {participant.name}
//                                                     </div>
//                                                     <div className="text-sm text-gray-500">
//                                                         ID: {participant.id}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                                             {participant.phoneNumber}
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap">
//                                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${participant.isFam
//                                                 ? 'bg-purple-100 text-purple-800'
//                                                 : 'bg-gray-100 text-gray-800'
//                                                 }`}>
//                                                 {participant.familySize} {participant.familySize === 1 ? 'person' : 'people'}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm">
//                                             <div className="flex space-x-2">
//                                                 <button
//                                                     onClick={() => handleActivateAllCoupons(participant.id)}
//                                                     className="text-green-600 hover:text-green-900 transition-colors"
//                                                     title="Activate all coupons"
//                                                 >
//                                                     <UserCheck className="w-4 h-4" />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleDeactivateAllCoupons(participant.id)}
//                                                     className="text-orange-600 hover:text-orange-900 transition-colors"
//                                                     title="Deactivate all coupons"
//                                                 >
//                                                     <UserX className="w-4 h-4" />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm">
//                                             <div className="flex space-x-2">
//                                                 <button
//                                                     onClick={() => handleEdit(participant)}
//                                                     className="text-blue-600 hover:text-blue-900 transition-colors"
//                                                     title="Edit participant"
//                                                 >
//                                                     <Edit2 className="w-4 h-4" />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleDelete(participant)}
//                                                     className="text-red-600 hover:text-red-900 transition-colors"
//                                                     title="Delete participant"
//                                                 >
//                                                     <Trash2 className="w-4 h-4" />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>

//                     {filteredParticipants.length === 0 && (
//                         <div className="text-center py-8">
//                             <Users className="mx-auto h-12 w-12 text-gray-400" />
//                             <h3 className="mt-2 text-sm font-medium text-gray-900">No participants found</h3>
//                             <p className="mt-1 text-sm text-gray-500">
//                                 {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new participant.'}
//                             </p>
//                         </div>
                )
}
            </div >
        </div >
    );
};