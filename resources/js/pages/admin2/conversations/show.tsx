import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { ChevronLeft, Send, User } from 'lucide-react';
import axios from 'axios';

interface User {
    name: string;
    email: string;
}

interface Message {
    id: number;
    message: string;
    subject: string;
    created_at: string;
    replied_by: string | null;
    status_id: number;
}

interface ConversationDetail {
    id: number;
    subject: string;
    created_at: string;
    proponent: {
        user: User;
        organization: string;
    };
    messages: Message[];
}

interface Props {
    conversation: ConversationDetail;
    userRole: string;
}

export default function Admin2ConversationShow() {
    const { conversation, userRole } = usePage<any>().props as Props;
    const [messages, setMessages] = useState<Message[]>(conversation.messages);
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!messageText.trim()) return;

        setSending(true);
        try {
            console.log('Sending message:', messageText);
            console.log('Route:', route('admin2.conversations.messages.store', conversation.id));
            
            const response = await axios.post(
                route('admin2.conversations.messages.store', conversation.id),
                {
                    message: messageText,
                    subject: conversation.subject,
                }
            );

            console.log('Message sent successfully:', response.data);
            setMessages([...messages, response.data.data]);
            setMessageText('');
        } catch (error: any) {
            console.error('Error sending message:', error);
            console.error('Error response:', error.response?.data);
            alert('Failed to send message: ' + (error.response?.data?.message || error.message));
        } finally {
            setSending(false);
        }
    };

    return (
        <AppLayout 
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin2.dashboard') },
                { title: 'Messages', href: route('admin2.conversations.index') },
                { title: conversation.subject || 'Conversation', href: '#' }
            ]}
            sidebarOpen={false}
        >
            <Head title={conversation.subject || 'Message'} />
            
            <div className="bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Header Section */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {conversation.subject || 'Conversation'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                View and reply to this conversation with the proponent
                            </p>
                        </div>
                        <Link
                            href={route('admin2.conversations.index')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 dark:bg-gray-700 dark:hover:bg-gray-800 whitespace-nowrap"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Back to Messages
                        </Link>
                    </div>

                    {/* Proponent Info */}
                    <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-blue-900 dark:text-blue-100">
                                    {conversation.proponent.user.name}
                                </p>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    {conversation.proponent.organization || 'No organization'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md overflow-hidden mb-6">
                        <div className="p-6 h-110 overflow-y-auto">
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`p-4 rounded-lg ${
                                            msg.replied_by 
                                                ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 ml-auto max-w-2xl'
                                                : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className={`font-semibold text-sm ${
                                                msg.replied_by ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-white'
                                            }`}>
                                                {msg.replied_by ? 'Your Response' : 'Proponent Message'}
                                            </p>
                                            <time className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(msg.created_at).toLocaleString()}
                                            </time>
                                        </div>
                                        <p className="whitespace-pre-wrap break-words text-gray-900 dark:text-white">
                                            {msg.message}
                                        </p>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    </div>

                    {/* Message Input */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md p-6">
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Send a Reply
                        </label>
                        <div className="flex gap-2">
                            <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Type your response..."
                                rows={3}
                                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={sending || !messageText.trim()}
                                className={`px-4 py-3 rounded-lg font-medium flex items-center gap-2 self-end transition-colors ${
                                    sending || !messageText.trim() 
                                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white'
                                }`}
                            >
                                <Send className="w-4 h-4" />
                                {sending ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
