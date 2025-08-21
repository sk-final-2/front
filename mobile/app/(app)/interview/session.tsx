import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';

export default function InterviewSession() {
  const r = useRouter();
  const { id, seq, question } = useLocalSearchParams<{ id: string; seq: string; question: string }>();

  return (
    <View style={{ flex:1, padding:16, gap:14 }}>
      <Text style={{ fontSize:18, fontWeight:'800' }}>인터뷰 세션</Text>
      <Text style={{ color:'#666' }}>ID: {id}</Text>
      <Text style={{ color:'#666' }}>문항번호: {seq}</Text>

      <View style={{ backgroundColor:'#fff', borderRadius:12, padding:14, borderWidth:1, borderColor:'#eee' }}>
        <Text style={{ fontWeight:'700', marginBottom:6 }}>질문</Text>
        <Text>{question}</Text>
      </View>

      <Pressable onPress={() => r.back()} style={{ marginTop:'auto', alignSelf:'flex-start', padding:10 }}>
        <Text>← 준비 화면으로</Text>
      </Pressable>
    </View>
  );
}
