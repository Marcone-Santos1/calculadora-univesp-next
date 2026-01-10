"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useAacData } from "@/hooks/useAacData";
import { AacDashboard } from "@/components/aac/AacDashboard";
import { ActivityForm } from "@/components/aac/ActivityForm";
import { ActivityList } from "@/components/aac/ActivityList";
import { ReportGenerator } from "@/components/aac/ReportGenerator";
import { ActivityDetailsModal } from "@/components/aac/ActivityDetailsModal";
import { FaSync, FaPlus } from "react-icons/fa";
import { ActivityData } from "@/actions/aac-actions";
import { redirect } from "next/navigation";

export default function AacPage() {
    const { data: session } = useSession();
    const { stats, activities, isLoading, needsSync, performSync, isSyncing, addActivity, updateActivity, removeActivity } = useAacData();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<ActivityData | null>(null);
    const [editingActivity, setEditingActivity] = useState<ActivityData | null>(null);

    const handleFormSubmit = async (data: Omit<ActivityData, "id" | "validHours">) => {
        if (editingActivity && editingActivity.id) {
            await updateActivity(editingActivity.id, data);
        } else {
            await addActivity(data);
        }
        setIsFormOpen(false);
        setEditingActivity(null);
    };

    const handleEditStart = (activity: ActivityData) => {
        setEditingActivity(activity);
        setIsFormOpen(true);
        setSelectedActivity(null); // Close details if open
    };

    const handleCancelForm = () => {
        setIsFormOpen(false);
        setEditingActivity(null);
    };

    return (
        <div className="pb-8 pt-8 px-4">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão de Horas Complementares(AAC)</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie suas atividades acadêmico-científico-culturais.</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {needsSync && (
                            <button
                                onClick={performSync}
                                disabled={isSyncing}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-all shadow-sm animate-pulse"
                            >
                                <FaSync className={isSyncing ? "animate-spin" : ""} />
                                {isSyncing ? "Sincronizando..." : "Sincronizar"}
                            </button>
                        )}

                        <ReportGenerator
                            activities={activities}
                            userName={session?.user?.name}
                            userEmail={session?.user?.email}
                        />

                        <button
                            onClick={() => { setEditingActivity(null); setIsFormOpen(true); }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-transform hover:scale-105"
                        >
                            <FaPlus /> Nova Atividade
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Dashboard */}
                        <AacDashboard stats={stats} targetHours={200} />

                        {/* Content Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left: List (takes 2/3 space usually, but here full width or adjusted) or Form Modal */}
                            <div className="lg:col-span-3 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Suas Atividades</h2>
                                </div>

                                {/* Form Section */}
                                {isFormOpen && (
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-900/30 mb-6 animate-fadeIn">
                                        <ActivityForm
                                            onSubmit={handleFormSubmit}
                                            existingActivities={activities}
                                            onCancel={handleCancelForm}
                                            initialData={editingActivity}
                                        />
                                    </div>
                                )}

                                <ActivityList
                                    activities={activities}
                                    onDelete={removeActivity}
                                    onView={setSelectedActivity}
                                    onEdit={handleEditStart}
                                />
                            </div>
                        </div>

                        {/* Details Modal */}
                        {selectedActivity && (
                            <ActivityDetailsModal
                                activity={selectedActivity}
                                onClose={() => setSelectedActivity(null)}
                                onEdit={handleEditStart}
                                onDelete={removeActivity}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
