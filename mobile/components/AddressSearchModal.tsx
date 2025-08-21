import React from 'react';
import { Modal, View, StyleSheet, SafeAreaView, TouchableOpacity, Text, Alert } from 'react-native';
import Postcode from '@actbase/react-daum-postcode';

type Props = {
  visible: boolean;
  onClose: () => void;
  onComplete: (data: {
    zonecode: string;
    roadAddress: string;
    jibunAddress: string;
    address: string;
    buildingName?: string;
    bname?: string;
    sido?: string;
    sigungu?: string;
    defaultAddress?: string;
  }) => void;
};

export default function AddressSearchModal({ visible, onClose, onComplete }: Props) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>닫기</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>주소 검색</Text>
          <View style={{ width: 60 }} />
        </View>

        <Postcode
          style={{ width: '100%', height: '100%' }}
          jsOptions={{ animation: true }}
          onSelected={(d: any) => {
            try {
              // 대표 주소
              const addr = d.address || d.roadAddress || d.jibunAddress || '';
              // 상세 기본값(건물명/아파트 여부)
              let defaultAddress = '';
              if (d.buildingName && d.buildingName !== 'N') {
                defaultAddress = `(${d.buildingName})`;
              } else if (d.apartment === 'Y') {
                defaultAddress = '(아파트)';
              }

              onComplete({
                zonecode: d.zonecode,
                roadAddress: d.roadAddress,
                jibunAddress: d.jibunAddress,
                address: addr,
                buildingName: d.buildingName,
                bname: d.bname,
                sido: d.sido,
                sigungu: d.sigungu,
                defaultAddress,
              });
              onClose();
            } catch (e: any) {
              Alert.alert('주소 처리 오류', String(e?.message ?? e));
            }
          }}
          onError={(err: any) => {
            Alert.alert('우편번호 오류', String(err?.message ?? err));
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, borderBottomWidth: 1, borderColor: '#eee',
  },
  closeBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  closeText: { fontSize: 16, color: '#111827' },
  headerTitle: { fontSize: 16, fontWeight: '700' },
});