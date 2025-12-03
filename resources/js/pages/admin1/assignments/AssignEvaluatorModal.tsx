import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { ProjectAssignment } from '@/types/assignments';

interface Evaluator {
    id: number;
    name: string;
    email: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    project: ProjectAssignment;
    evaluators: Evaluator[];
    onAssign: (evaluatorId: number) => Promise<void>;
    loading?: boolean;
}

export default function AssignEvaluatorModal({ isOpen, onClose, project, evaluators, onAssign, loading = false }: Props) {
    const [selectedEvaluatorId, setSelectedEvaluatorId] = useState<number | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleAssign = async () => {
        if (!selectedEvaluatorId) return;

        setIsAssigning(true);
        try {
            await onAssign(selectedEvaluatorId);
            setSuccessMessage('Evaluator assigned successfully! Refreshing...');
            setSelectedEvaluatorId(null);
        } catch (error) {
            console.error('Error in modal assign:', error);
        } finally {
            setIsAssigning(false);
        }
    };

    if (!isOpen) return null;

    const selectedEvaluator = evaluators.find(e => e.id === selectedEvaluatorId);

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6 w-full shadow-lg">
                    <Dialog.Title className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                        Assign Evaluator
                    </Dialog.Title>

                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                            {successMessage}
                        </div>
                    )}

                    <div className="mb-6">
                        <div className="bg-gray-50 rounded p-3 mb-4">
                            <p className="text-xs text-gray-600 uppercase tracking-wide">Project</p>
                            <p className="font-medium text-gray-900">{project.project_code}</p>
                            <p className="text-sm text-gray-700 mt-1 truncate">{project.title}</p>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-medium text-gray-700 mb-2">Current Evaluator</h3>
                            {project.evaluator ? (
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    {project.evaluator.name}
                                </div>
                            ) : (
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                    Not Assigned
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="evaluator" className="block text-sm font-medium text-gray-700 mb-2">
                                Select Evaluator for this Domain
                            </label>
                            <select
                                id="evaluator"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={selectedEvaluatorId || ''}
                                onChange={(e) => setSelectedEvaluatorId(e.target.value ? Number(e.target.value) : null)}
                                disabled={loading || isAssigning}
                            >
                                <option value="">-- Select an evaluator --</option>
                                {evaluators.map(evaluator => (
                                    <option key={evaluator.id} value={evaluator.id}>
                                        {evaluator.name} ({evaluator.email})
                                    </option>
                                ))}
                            </select>
                            
                            {evaluators.length === 0 && !loading && (
                                <p className="mt-2 text-sm text-yellow-600">
                                    No evaluators available for this domain.
                                </p>
                            )}

                            {loading && (
                                <p className="mt-2 text-sm text-blue-600">
                                    Loading evaluators...
                                </p>
                            )}
                        </div>

                        {selectedEvaluator && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Selected Evaluator</p>
                                <p className="font-medium text-gray-900">{selectedEvaluator.name}</p>
                                <p className="text-sm text-gray-600">{selectedEvaluator.email}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            disabled={isAssigning}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAssign}
                            disabled={!selectedEvaluatorId || isAssigning || loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                        >
                            {isAssigning ? (
                                <>
                                    <span className="inline-block animate-spin">⏳</span>
                                    <span>Assigning...</span>
                                </>
                            ) : (
                                'Assign Evaluator'
                            )}
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}