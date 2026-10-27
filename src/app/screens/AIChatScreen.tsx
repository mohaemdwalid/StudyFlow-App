/**
 * AIChatScreen — Full-screen chat with Gemini AI Coach
 *
 * Features:
 * - Real-time streaming feel (typing indicator)
 * - Conversation history maintained in local state
 * - Beautiful dark/light themed chat bubbles
 * - Quick suggestion chips
 */
import React, { useState, useRef, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { geminiService, type ChatMessage } from '../services/gemini.service';

const SUGGESTIONS = [
    '📚 Make me a study plan for this week',
    '⚡ How to focus better while studying?',
    '🎯 Help me prepare for an exam',
    '💡 Explain the Pomodoro technique',
];

interface DisplayMessage extends ChatMessage {
    id: string;
    timestamp: Date;
}

export default function AIChatScreen({ navigation }: { navigation: any }) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<DisplayMessage[]>([
        {
            id: 'demo-u1', role: 'user', text: '📚 Make me a study plan for this week',
            timestamp: new Date(Date.now() - 3600000 * 3),
        },
        {
            id: 'demo-a1', role: 'model',
            text: "Here's your personalized study plan for this week! 🎯\n\n**Sunday**\n⏰ 9:00–10:30 — Data Structures (Binary Trees)\n⏰ 11:00–12:00 — OOP Lab Practice\n\n**Monday**\n⏰ 9:00–10:30 — Database Systems (SQL JOINs)\n⏰ 13:00–14:30 — OS (Process Scheduling)\n\n**Tuesday**\n⏰ 10:00–11:30 — Networks (TCP/IP)\n⏰ 14:00–15:00 — SE Sprint Planning\n\n**Wednesday**\n⏰ 9:00–11:00 — DSA Problem Solving (LeetCode)\n⏰ 14:00–15:30 — DB ER Diagrams\n\n**Thursday**\n⏰ 9:00–10:30 — OOP Design Patterns\n⏰ 11:00–12:30 — Networks Lab\n\n💪 Use the Focus Timer for each session to stay on track! You've got this!",
            timestamp: new Date(Date.now() - 3600000 * 3),
        },
        {
            id: 'demo-u2', role: 'user', text: '💡 Explain the Pomodoro technique',
            timestamp: new Date(Date.now() - 3600000 * 2),
        },
        {
            id: 'demo-a2', role: 'model',
            text: "The Pomodoro Technique is a time management method that breaks study into focused intervals! 🍅\n\n**How it works:**\n1. Pick a task (e.g., \"Study Binary Trees\")\n2. Set a timer for 25 minutes ⏱️\n3. Focus ONLY on that task — no phone, no distractions\n4. When the timer rings, take a 5-minute break 😌\n5. After 4 rounds, take a longer 15–30 min break\n\n**Why it works:**\n- Your brain stays fresh with regular breaks\n- 25 min feels achievable (no overwhelm!)\n- You build momentum with each completed round\n\n✨ Pro tip: Use StudyFlow's Focus Timer — it has built-in Pomodoro modes and your garden grows while you study! Try a 25-min session right now!",
            timestamp: new Date(Date.now() - 3600000 * 2),
        },
        {
            id: 'demo-u3', role: 'user', text: '🎯 Help me prepare for an exam',
            timestamp: new Date(Date.now() - 3600000),
        },
        {
            id: 'demo-a3', role: 'model',
            text: "Let's crush that exam! Here's my proven prep strategy: 📝\n\n**1. Active Recall (Most Important!)**\nDon't just re-read notes. Close your book and try to explain the concept out loud. If you can't, review and try again.\n\n**2. Spaced Repetition**\nStudy a topic, then review it after 1 day, 3 days, and 7 days. This locks it into long-term memory! 🧠\n\n**3. Practice Problems**\nFor CS subjects, solving problems > reading theory. Aim for 3–5 problems per topic.\n\n**4. Teach Someone**\nExplain a concept to a friend or even to yourself. If you can teach it simply, you truly understand it.\n\n**5. Exam Day Tips**\n- Get 7+ hours of sleep the night before 💤\n- Eat a good breakfast\n- Arrive 15 min early\n- Read ALL questions before starting\n\n🎯 You can track your exam dates in the Planner tab and monitor your grades in the Grades section! Good luck! ✨",
            timestamp: new Date(Date.now() - 3600000),
        },
        {
            id: 'demo-u4', role: 'user', text: '⚡ How to focus better while studying?',
            timestamp: new Date(Date.now() - 1800000),
        },
        {
            id: 'demo-a4', role: 'model',
            text: "Great question! Here are my top focus tips: ⚡\n\n**🚫 Eliminate Distractions**\n- Put your phone in another room (or use Focus Mode)\n- Use StudyFlow's Strict Mode — your plant dies if you leave the app!\n- Close unnecessary browser tabs\n\n**🧠 Optimize Your Environment**\n- Find a quiet spot with good lighting\n- Use noise-cancelling headphones or lo-fi music\n- Keep water and snacks nearby\n\n**⏰ Time Block Your Study**\n- Use 25 or 50-minute focus blocks\n- One subject per block — don't multitask!\n- Take real breaks between blocks (stretch, walk)\n\n**💪 Build the Habit**\n- Study at the same time daily\n- Start with your hardest subject when energy is highest\n- Celebrate small wins!\n\n🌱 Try planting a tree in StudyFlow's Focus mode right now — watching it grow keeps you motivated!",
            timestamp: new Date(Date.now() - 1800000),
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || loading) return;

        const userMsg: DisplayMessage = {
            id: 'u' + Date.now(),
            role: 'user',
            text: text.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Scroll to bottom
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            // Build history (exclude the new message — it's sent separately)
            const history: ChatMessage[] = messages.map(m => ({ role: m.role, text: m.text }));
            const response = await geminiService.chat(history, text.trim());

            const aiMsg: DisplayMessage = {
                id: 'a' + Date.now(),
                role: 'model',
                text: response,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err: any) {
            const errorMsg: DisplayMessage = {
                id: 'e' + Date.now(),
                role: 'model',
                text: `Sorry, I couldn't process that. ${err.message ?? 'Please try again.'} 😔`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
        }
    }, [messages, loading]);

    const renderMessage = ({ item }: { item: DisplayMessage }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[s.msgRow, isUser && s.msgRowUser]}>
                {!isUser && (
                    <LinearGradient
                        colors={[theme.accent.violet, theme.accent.indigo]}
                        style={s.avatar}
                    >
                        <MaterialIcons name="auto-awesome" size={14} color="#FFF" />
                    </LinearGradient>
                )}
                <View style={[
                    s.bubble,
                    isUser
                        ? { backgroundColor: theme.accent.violet }
                        : { backgroundColor: theme.colors.card },
                ]}>
                    <Text style={[
                        s.bubbleText,
                        { color: isUser ? '#FFF' : theme.colors.textPrimary },
                    ]}>
                        {item.text}
                    </Text>
                </View>
            </View>
        );
    };

    const s = styles(theme);

    return (
        <View style={[s.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[s.header, { paddingTop: insets.top + 8 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <MaterialIcons name="arrow-back" size={22} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <View style={s.headerCenter}>
                    <LinearGradient colors={[theme.accent.violet, theme.accent.indigo]} style={s.headerAvatar}>
                        <MaterialIcons name="auto-awesome" size={16} color="#FFF" />
                    </LinearGradient>
                    <View>
                        <Text style={[s.headerTitle, { color: theme.colors.textPrimary }]}>AI Coach</Text>
                        <Text style={[s.headerSub, { color: theme.accent.mint }]}>
                            {loading ? 'Typing...' : 'Online'}
                        </Text>
                    </View>
                </View>
                <View style={{ width: 22 }} />
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={[s.messageList, messages.length === 0 && s.emptyList]}
                ListEmptyComponent={() => (
                    <View style={s.empty}>
                        <LinearGradient colors={[theme.accent.violet, theme.accent.indigo]} style={s.emptyIcon}>
                            <MaterialIcons name="auto-awesome" size={40} color="#FFF" />
                        </LinearGradient>
                        <Text style={[s.emptyTitle, { color: theme.colors.textPrimary }]}>
                            Hi! I'm your AI Study Coach ✨
                        </Text>
                        <Text style={[s.emptySubtitle, { color: theme.colors.textSecondary }]}>
                            Ask me anything about studying, planning, or staying productive.
                        </Text>

                        {/* Suggestion chips */}
                        <View style={s.suggestions}>
                            {SUGGESTIONS.map((sug) => (
                                <TouchableOpacity
                                    key={sug}
                                    style={[s.sugChip, { backgroundColor: theme.colors.card, borderColor: theme.accent.violet + '30' }]}
                                    onPress={() => sendMessage(sug)}
                                >
                                    <Text style={[s.sugText, { color: theme.colors.textPrimary }]}>{sug}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
                ListFooterComponent={loading ? (
                    <View style={s.typingRow}>
                        <LinearGradient colors={[theme.accent.violet, theme.accent.indigo]} style={s.avatar}>
                            <MaterialIcons name="auto-awesome" size={14} color="#FFF" />
                        </LinearGradient>
                        <View style={[s.typingBubble, { backgroundColor: theme.colors.card }]}>
                            <ActivityIndicator size="small" color={theme.accent.violet} />
                            <Text style={[s.typingText, { color: theme.colors.textSecondary }]}>Thinking...</Text>
                        </View>
                    </View>
                ) : null}
                onContentSizeChange={() => {
                    if (messages.length > 0) flatListRef.current?.scrollToEnd({ animated: true });
                }}
            />

            {/* Input Bar */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <View style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: theme.colors.elevated }]}>
                    <TextInput
                        style={[s.input, { color: theme.colors.textPrimary, backgroundColor: theme.colors.card }]}
                        placeholder="Ask your AI Coach..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={input}
                        onChangeText={setInput}
                        multiline
                        maxLength={2000}
                        returnKeyType="default"
                        editable={!loading}
                    />
                    <TouchableOpacity
                        style={[s.sendBtn, (!input.trim() || loading) && { opacity: 0.4 }]}
                        onPress={() => sendMessage(input)}
                        disabled={!input.trim() || loading}
                    >
                        <LinearGradient colors={['#6C63FF', '#4F46E5']} style={s.sendGrad}>
                            <MaterialIcons name="arrow-upward" size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = (theme: any) => StyleSheet.create({
    container: { flex: 1 },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.divider,
    },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 12, gap: 10 },
    headerAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '600' },
    headerSub: { fontSize: 12, fontWeight: '500' },

    // Messages
    messageList: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    emptyList: { flex: 1, justifyContent: 'center' },
    msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, maxWidth: '85%' },
    msgRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
    avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '100%' },
    bubbleText: { fontSize: 15, lineHeight: 22 },

    // Typing indicator
    typingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingLeft: 0 },
    typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
    typingText: { fontSize: 13 },

    // Empty state
    empty: { alignItems: 'center', paddingHorizontal: 32 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
    emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    suggestions: { width: '100%', gap: 8 },
    sugChip: {
        borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
        borderWidth: 1,
    },
    sugText: { fontSize: 14, fontWeight: '500' },

    // Input bar
    inputBar: {
        flexDirection: 'row', alignItems: 'flex-end', gap: 8,
        paddingHorizontal: 12, paddingTop: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.divider,
    },
    input: {
        flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
        fontSize: 15, maxHeight: 100, minHeight: 40,
    },
    sendBtn: {},
    sendGrad: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
    },
});
