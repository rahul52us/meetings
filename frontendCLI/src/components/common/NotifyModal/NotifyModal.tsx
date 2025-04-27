import React, { useEffect } from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const NotifyModal = ({
    visible,
    onClose,
    textColor = '#000',
    autoClose = true,
    autoCloseTime = 30,
    showLoader = false
}: any) => {
    useEffect(() => {
        if (visible?.isVisible && autoClose) {
            const timer = setTimeout(() => {
                onClose && onClose();
            }, autoCloseTime);
            return () => clearTimeout(timer);
        }
    }, [visible, autoClose, autoCloseTime, onClose]);

    if (!visible?.isVisible) {
        return null;
    }

    return (
        <Modal
            visible={visible.isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {visible.status && (
                        <Text style={[styles.headerText, { color: visible.status === 'Success' ? 'green' : visible.status === 'Error' ? 'red.400' : textColor }]}>{visible.status}</Text>
                    )}
                    <Text style={[styles.bodyText]}>{visible.text}</Text>
                    {showLoader && (
                        <ActivityIndicator size="large" color="#38B2AC" style={{ marginVertical: 10 }} />

                    )}
                </View>
            </View>
        </Modal>
    );
};

export default NotifyModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        elevation: 5,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    bodyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
