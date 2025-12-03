import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { themeClasses, combineTheme } from '@/lib/theme-classes';
import { MessageSquare, Plus, Search, Clock, X } from 'lucide-react';
import axios from 'axios';

interface Message {
    id: number;
    message: string;
    created_at: string;
}

interface ConversationItem {
    id: number;
    subject: string;
    created_at: string;
    creator: {
        name: string;
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

export default function ConversationsIndex() {
    const { conversations } = usePage<any>().props as Props;
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [convList, setConvList] = useState(conversations.data);

    const filteredConversations = convList.filter(conv =>
        conv.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateConversation = async () => {
        if (!subject.trim() || !message.trim()) {
            alert('Please fill in both subject and message');
            return;
        }

        setLoading(true);
        try {
            console.log('Creating conversation with subject:', subject);
            const response = await axios.post(route('proponent.conversations.store'), {
                subject,
                message,
            });

            console.log('Conversation created, response:', response.data);

            // The response should contain the conversation_id
            if (response.data?.conversation_id) {
                const convId = response.data.conversation_id;
                console.log('Fetching conversation:', convId);
                
                // Fetch the full conversation with all relationships via API
                try {
                    const apiUrl = route('proponent.conversations.api.show', convId);
                    console.log('Fetching from URL:', apiUrl);
                    
                    const convResponse = await axios.get(apiUrl);
                    
                    console.log('Fetched conversation:', convResponse.data);
                    const newConversation = convResponse.data;
                    if (newConversation && newConversation.id) {
                        console.log('Adding new conversation to list');
                        // Add new conversation to the top of the list
                        setConvList([newConversation, ...convList]);
                        console.log('List updated');
                    } else {
                        console.error('Invalid conversation data:', newConversation);
                    }
                } catch (fetchError: any) {
                    console.error('Error fetching new conversation:', fetchError);
                    console.error('Error details:', fetchError.response?.data || fetchError.message);
                    // Fallback: refresh the entire list
                    window.location.reload();
                }
            }

            // Reset form
            setSubject('');
            setMessage('');
            setShowModal(false);
        } catch (error: any) {
            console.error('Error creating conversation:', error);
            alert('Failed to create conversation: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: route('proponent.dashboard') },
            { title: 'Messages', href: route('proponent.conversations.index') }
        ]}>
            <Head title="Messages" />
            <div className="min-h-screen bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Header */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Messages
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Communicate with Admin support
                            </p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus className="w-4 h-4" />
                            New Message
                        </button>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Search Conversations
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md overflow-hidden">
                        {filteredConversations.length > 0 ? (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredConversations.map((conversation) => (
                                    <Link
                                        key={conversation.id}
                                        href={route('proponent.conversations.show', conversation.id)}
                                        className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <MessageSquare className="w-5 h-5 mt-1 text-gray-400 dark:text-gray-500" />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium truncate text-gray-900 dark:text-white">
                                                        {conversation.subject || 'Untitled'}
                                                    </h3>
                                                    <p className="text-sm truncate text-gray-600 dark:text-gray-400">
                                                        {conversation.messages[0]?.message || 'No messages'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0 text-gray-500 dark:text-gray-400">
                                                <Clock className="w-4 h-4" />
                                                <time className="text-sm whitespace-nowrap">
                                                    {new Date(conversation.created_at).toLocaleDateString()}
                                                </time>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">No conversations yet</p>
                                <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                                    Start a new message to get help from Admin support
                                </p>
                            </div>
                        )}
                    </div>

                    {/* New Message Modal */}
                    {showModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-lg">
                                {/* Modal Header */}
                                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        New Message
                                    </h2>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Modal Content */}
                                <div className="p-6 space-y-4">
                                    {/* Subject Field */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="What is your message about?"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    {/* Message Field */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            Message *
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Type your message here..."
                                            rows={6}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                        <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                                            {message.length} characters
                                        </p>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 rounded-lg font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateConversation}
                                        disabled={loading || !subject.trim() || !message.trim()}
                                        className={`px-6 py-2 rounded-lg font-medium ${
                                            loading || !subject.trim() || !message.trim()
                                                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                    >
                                        {loading ? 'Sending...' : 'Send Message'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
