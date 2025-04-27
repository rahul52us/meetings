import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DDMMYYYY_FORMAT, formatDateTime } from '../../utils/dateUtils/dateUtils';
import DeleteSVG from '../../assets/delete';
import EditSVG from '../../assets/edit';  // Assuming you have an Edit icon
import UserSVG from '../../assets/UserSvg';

// Types for better type safety
interface DocumentItem {
  pdf_Id: string | number;
  extractedData?: {
    name?: string;
    designation?: string;
    company?: string;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  files?: { file: string[] };
  created_At: string;
  status: string;
}

interface DocumentCardProps {
  item: DocumentItem;
  onPress: (file: string) => void;
  getPdfs?:any;
  onDelete: (item: DocumentItem) => void;
  onEdit: (item: DocumentItem) => void;  // Add onEdit prop
}

const DocumentCard = memo(({ item, onPress, onDelete, onEdit, getPdfs }: DocumentCardProps) => {
  const { extractedData = {}, files, created_At, status } = item;
  const hasFile = files?.file?.[0];

  const renderField = useCallback((value: string | undefined, icon: string) => (
    value ? <Text style={styles.detailText}>{`${icon} ${value}`}</Text> : null
  ), []);

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={hasFile ? () => onPress(hasFile) : undefined}
      disabled={!hasFile}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <UserSVG color={COLORS.primary} width={40} height={40} />
        <View style={styles.documentDetails}>
          <Text style={styles.boldText} numberOfLines={1}>
            {extractedData.name || 'Unnamed Contact'}
          </Text>
          <Text style={styles.detailText}>
            Created: {formatDateTime(created_At, DDMMYYYY_FORMAT, true) || 'N/A'}
          </Text>
        </View>
        {status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEdit(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <EditSVG color="white" width={20} height={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <DeleteSVG color="white" width={20} height={20} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.userInfo}>
        <Text style={styles.boldText}>{extractedData.name || 'Unnamed Contact'}</Text>
        {(extractedData.designation || extractedData.company) && (
          <Text style={styles.detailText} numberOfLines={1}>
            {`${extractedData.designation || ''}${extractedData.designation && extractedData.company ? ' at ' : ''}${extractedData.company || ''}`}
          </Text>
        )}
        {extractedData.website && (
          <Text style={styles.linkText} numberOfLines={1}>
            {extractedData.website}
          </Text>
        )}
        {renderField(extractedData.email, '📧')}
        {renderField(extractedData.phone, '📞')}
        {renderField(extractedData.address, '📍')}
      </View>
    </TouchableOpacity>
  );
});

// Color constants
const COLORS = {
  primary: '#007AFF',
  delete: '#D51A13',
  text: '#333',
  secondaryText: '#666',
  divider: '#eee',
  background: '#fff',
  shadow: '#000',
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.background,
    padding: 15,
    margin: 15,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  documentDetails: {
    flex: 1,
    marginHorizontal: 12,
  },
  boldText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginVertical: 2,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.primary,
    textDecorationLine: 'underline',
    marginVertical: 2,
  },
  userInfo: {
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 10,
  },
  actions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: COLORS.delete,
    padding: 8,
    borderRadius: 6,
  },
});

export default DocumentCard;
