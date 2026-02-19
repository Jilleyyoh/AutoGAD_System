import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { MessageSquare, Search, AlertCircle } from 'lucide-react';

interface User {
    name: string;
}

interface Message {
    id: number;
    message: string;
    created_at: string;
    status_id: number;
}

interface ConversationItem {
    id: number;
    subject: string;
    created_at: string;
    proponent: {
        user: User;
    };
    creator: {
        user: User;
    };
    messages: Message[];
}

interface Props {
    conversations: {
        data: ConversationItem[];
        current_page: number;
        total: number;
        per_page: number;
    };
}

export default function Admin2ConversationsIndex() {
    const { conversations } = usePage<any>().props as Props;
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = conversations.data.filter(conv =>
        conv.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.proponent?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getUnreadCount = (conv: ConversationItem) => {
        return conv.messages.filter(m => m.status_id === 1).length;
    };

    return (
        <AppLayout 
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin2.dashboard') },
                { title: 'Messages', href: route('admin2.conversations.index') }
            ]}
            sidebarOpen={false}
        >
            <Head title="Conversations" />
            
            <div className="min-h-screen bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Header Section */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Proponent Messages
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Manage conversations and messages with proponents
                            </p>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="mb-8 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-purple-900 dark:text-purple-100">About Messages</h3>
                                <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                                    Communicate with proponents regarding their project submissions and evaluation processes.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Search Projects
                        </label>
                        <input
                            type="text"
                            placeholder="Search by subject or proponent name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Conversations List */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md overflow-hidden">
                        {filteredConversations.length > 0 ? (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredConversations.map((conversation) => {
                                    const unreadCount = getUnreadCount(conversation);
                                    return (
                                        <Link
                                            key={conversation.id}
                                            href={route('admin2.conversations.show', conversation.id)}
                                            className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div className="relative flex-shrink-0">
                                                        <MessageSquare className="w-5 h-5 mt-1 text-gray-400 dark:text-gray-500" />
                                                        {unreadCount > 0 && (
                                                            <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-bold text-white bg-red-600">
                                                                {unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-medium truncate text-gray-900 dark:text-white">
                                                                {conversation.subject || 'Untitled'}
                                                            </h3>
                                                            {unreadCount > 0 && (
                                                                <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm mb-1 text-gray-600 dark:text-gray-400">
                                                            From: <span className="font-medium">{conversation.proponent.user.name}</span>
                                                        </p>
                                                        <p className="text-sm truncate text-gray-600 dark:text-gray-400">
                                                            {conversation.messages[conversation.messages.length - 1]?.message || 'No messages'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 flex-shrink-0 text-gray-500 dark:text-gray-400">
                                                    <time className="text-sm whitespace-nowrap">
                                                        {new Date(conversation.created_at).toLocaleDateString()}
                                                    </time>
                                                    <span className="text-xs">{conversation.messages.length} messages</span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">No conversations</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
