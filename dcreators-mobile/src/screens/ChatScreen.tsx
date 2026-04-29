import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ImageBackground, Platform, ScrollView, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send, Paperclip } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';

export default function ChatScreen({ navigation, route }: any) {
  const project = route?.params?.project;
  const otherName = route?.params?.otherName || 'Participant';
  const profile = useAuthStore((s) => s.profile);

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchMessages();
    // Subscribe to new messages via realtime
    const channel = supabase
      .channel(`messages:${project?.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${project?.id}`,
      }, (payload: any) => {
        setMessages((prev) => [...prev, payload.new]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchMessages() {
    if (!project?.id) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: true });
      if (!error && data) setMessages(data);
    } catch {}
    finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 200);
    }
  }

  async function handleSend() {
    if (!input.trim() || !project?.id || !profile?.id) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        project_id: project.id,
        sender_id: profile.id,
        text,
      });
      if (error) console.log('[Chat] Send error:', error.message);
      // Message will appear via realtime subscription
    } catch {}
    finally { setSending(false); }
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function formatDateHeader(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Group messages by date
  const groupedMessages: { date: string; msgs: any[] }[] = [];
  let lastDate = '';
  messages.forEach((msg) => {
    const dateKey = new Date(msg.created_at).toDateString();
    if (dateKey !== lastDate) {
      groupedMessages.push({ date: dateKey, msgs: [msg] });
      lastDate = dateKey;
    } else {
      groupedMessages[groupedMessages.length - 1].msgs.push(msg);
    }
  });

  const assignmentLabel = project
    ? `${project.assignment_type?.charAt(0).toUpperCase()}${project.assignment_type?.slice(1) || ''}`
    : 'Assignment';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.cardBg }]} edges={['top']}>
      <ImageBackground source={require('../../assets/bg-texture.png')} style={styles.bg} imageStyle={{ opacity: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerName}>{otherName}</Text>
              <Text style={styles.headerSub}>{assignmentLabel}</Text>
            </View>
            <View style={{ width: 36 }} />
          </View>

          {/* Messages */}
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
          ) : (
            <ScrollView
              ref={scrollRef}
              style={styles.chatScroll}
              contentContainerStyle={styles.chatContainer}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            >
              {messages.length === 0 && (
                <View style={styles.emptyChat}>
                  <Text style={styles.emptyChatText}>No messages yet. Start the conversation! 💬</Text>
                </View>
              )}

              {groupedMessages.map((group) => (
                <View key={group.date}>
                  <View style={styles.dateHeader}>
                    <Text style={styles.dateHeaderText}>{formatDateHeader(group.msgs[0].created_at)}</Text>
                  </View>
                  {group.msgs.map((msg) => {
                    const isMe = msg.sender_id === profile?.id;
                    return (
                      <View key={msg.id} style={[styles.messageWrapper, isMe ? styles.messageMe : styles.messageThem]}>
                        <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                          <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{msg.text}</Text>
                        </View>
                        <Text style={styles.timeText}>{formatTime(msg.created_at)}</Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          )}

          {/* Input Area */}
          <View style={styles.inputArea}>
            <TouchableOpacity style={styles.attachBtn}>
              <Paperclip size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TextInput
              style={styles.inputField}
              placeholder="Type a message..."
              placeholderTextColor={colors.textTertiary}
              value={input}
              onChangeText={setInput}
              multiline
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Send size={18} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.screenBg },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderCard, backgroundColor: colors.cardBg,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  headerName: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.textPrimary, fontFamily: fonts.heavy },
  headerSub: { fontSize: fontSizes.xs + 1, color: colors.textSecondary, fontFamily: fonts.medium },

  chatScroll: { flex: 1 },
  chatContainer: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xl },

  emptyChat: { alignItems: 'center', marginTop: 60, padding: spacing.xl },
  emptyChatText: { fontSize: fontSizes.base, color: colors.textTertiary, fontFamily: fonts.body, textAlign: 'center' },

  dateHeader: { alignItems: 'center', marginVertical: spacing.md },
  dateHeaderText: {
    fontSize: fontSizes.xs + 1, color: colors.textSecondary, fontFamily: fonts.medium,
    backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.md,
  },

  messageWrapper: { maxWidth: '80%', marginBottom: spacing.xs },
  messageMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  messageThem: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  messageBubble: { paddingHorizontal: spacing.lg, paddingVertical: 10, borderRadius: 18, marginBottom: 2 },
  bubbleMe: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  messageText: { fontSize: fontSizes.base, color: colors.textPrimary, fontFamily: fonts.body, lineHeight: 20 },
  messageTextMe: { color: colors.textOnPrimary },
  timeText: { fontSize: 9, color: colors.textTertiary, fontFamily: fonts.medium, marginHorizontal: spacing.xs },

  inputArea: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: spacing.lg, paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.md,
    backgroundColor: colors.cardBg, borderTopWidth: 1, borderTopColor: colors.border, gap: 10,
  },
  attachBtn: { padding: 10 },
  inputField: {
    flex: 1, backgroundColor: colors.inputBg, borderRadius: radii['2xl'],
    paddingHorizontal: spacing.lg, paddingTop: 10, paddingBottom: 10,
    maxHeight: 100, minHeight: 40, fontSize: fontSizes.base, fontFamily: fonts.body, color: colors.textPrimary,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: radii.full, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
  sendBtnDisabled: { backgroundColor: colors.borderInput },
});
